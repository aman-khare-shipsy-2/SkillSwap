import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { skillService } from '../../services/skill.service';
import { requestService } from '../../services/request.service';
import { PREDEFINED_SKILLS } from '../../constants/skills';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiCheck } from 'react-icons/fi';

const MyLearnings = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });

  const { data: allSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillService.getAllSkills({ limit: 100 }),
    retry: 2,
  });

  const { user } = useAuthStore();

  // Fetch accepted requests to show currently learning skills
  const { data: acceptedRequests } = useQuery({
    queryKey: ['requests', 'accepted'],
    queryFn: () => requestService.getMyRequests('accepted'),
    enabled: !!user,
  });

  const addDesiredSkillMutation = useMutation({
    mutationFn: (skillId: string) => userService.addDesiredSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill added to wishlist!');
      setShowAddModal(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add skill');
    },
  });

  const removeDesiredSkillMutation = useMutation({
    mutationFn: (skillId: string) => userService.removeDesiredSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Skill removed from wishlist!');
    },
  });

  const desiredSkills = profile?.desiredSkills || [];

  // Extract currently learning skills from accepted requests
  const currentlyLearningSkills = useMemo(() => {
    if (!acceptedRequests || !user) return [];

    const learningSkills: Array<{ skillId: string; skillName: string; fromUser: string; requestId: string }> = [];

    // For requests sent by user: they're learning the requestedSkillId
    acceptedRequests.sent.forEach((request) => {
      const skill = typeof request.requestedSkillId === 'string' 
        ? null 
        : request.requestedSkillId;
      const skillId = typeof request.requestedSkillId === 'string'
        ? request.requestedSkillId
        : request.requestedSkillId._id;
      const fromUser = typeof request.receiverId === 'string'
        ? 'Unknown'
        : request.receiverId.name;

      if (skillId) {
        learningSkills.push({
          skillId,
          skillName: skill?.name || 'Loading...',
          fromUser,
          requestId: typeof request._id === 'string' ? request._id : request._id,
        });
      }
    });

    // For requests received by user: they're learning the offeredSkillId
    acceptedRequests.received.forEach((request) => {
      const skill = typeof request.offeredSkillId === 'string'
        ? null
        : request.offeredSkillId;
      const skillId = typeof request.offeredSkillId === 'string'
        ? request.offeredSkillId
        : request.offeredSkillId._id;
      const fromUser = typeof request.senderId === 'string'
        ? 'Unknown'
        : request.senderId.name;

      if (skillId) {
        learningSkills.push({
          skillId,
          skillName: skill?.name || 'Loading...',
          fromUser,
          requestId: typeof request._id === 'string' ? request._id : request._id,
        });
      }
    });

    return learningSkills;
  }, [acceptedRequests, user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="h2 text-text-primary">My Learnings</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Skill to Learn</span>
        </button>
      </div>

      {/* Currently Learning Section */}
      <div className="card card-hover">
        <h3 className="h4 text-text-primary mb-4">
          Currently Learning
        </h3>
        {currentlyLearningSkills.length === 0 ? (
          <p className="text-text-secondary">
            No active learning sessions. Accept a skill exchange request to start learning!
          </p>
        ) : (
          <div className="space-y-2">
            {currentlyLearningSkills.map((learning) => (
              <div
                key={learning.requestId}
                className="flex items-center justify-between p-3 bg-surface-elevation rounded-xl hover:bg-surface transition-colors"
              >
                <div className="flex-1">
                  <span className="text-text-primary font-medium block">
                    {learning.skillName}
                  </span>
                  <span className="text-xs text-text-secondary">
                    Learning from {learning.fromUser}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    // Find the chat session for this request
                    try {
                      const chats = await queryClient.fetchQuery({
                        queryKey: ['chats'],
                        queryFn: async () => {
                          const chatService = (await import('../../services/chat.service')).chatService;
                          return chatService.getMyChats();
                        },
                      });
                      
                      const chatSession = chats.find((chat: any) => {
                        const requestId = typeof chat.requestId === 'string' 
                          ? chat.requestId 
                          : chat.requestId?._id || chat.requestId;
                        return requestId === learning.requestId;
                      });
                      
                      if (chatSession) {
                        const chatId = typeof chatSession._id === 'string' ? chatSession._id : chatSession._id;
                        window.location.href = `/chat/${chatId}`;
                      } else {
                        toast.error('Chat session not found. Please try again.');
                      }
                    } catch (error) {
                      console.error('Error finding chat:', error);
                      toast.error('Could not open chat. Please try again.');
                    }
                  }}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors ml-4"
                >
                  Open Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wish to Learn Section */}
      <div className="card card-hover">
        <h3 className="h4 text-text-primary mb-4">
          Wish to Learn
        </h3>
        {desiredSkills.length === 0 ? (
          <p className="text-text-secondary">No skills in your wishlist yet.</p>
        ) : (
          <div className="space-y-2">
            {desiredSkills.map((skill) => {
              const skillObj = typeof skill === 'string' ? null : skill;
              const skillId = typeof skill === 'string' ? skill : skill._id;

              return (
                <div
                  key={skillId}
                  className="flex items-center justify-between p-3 bg-surface-elevation rounded-xl hover:bg-surface transition-colors"
                >
                  <span className="text-text-primary font-medium">
                    {skillObj?.name || 'Loading...'}
                  </span>
                  <button
                    onClick={() => removeDesiredSkillMutation.mutate(skillId)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Skills Learnt Section */}
      <div className="card card-hover">
        <h3 className="h4 text-text-primary mb-4">
          Skills Learnt
        </h3>
        <p className="text-text-secondary">
          Skills you've completed learning: <span className="font-semibold text-text-primary">{profile?.totalSkillsLearnt || 0}</span>
        </p>
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="h3 mb-6 text-text-primary">Add Skill to Learn</h3>
            <p className="text-sm text-text-secondary mb-6">
              Select from the predefined skills available on the platform
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PREDEFINED_SKILLS.map((skill) => {
                // Check if skill is already in wishlist
                const isAlreadyAdded = desiredSkills.some(
                  (ds) =>
                    (typeof ds === 'string'
                      ? allSkills?.skills.find((s: { _id: string; name: string }) => s._id === ds)?.name === skill.name
                      : ds.name === skill.name)
                );

                // Check if user is already offering this skill
                const isOffering = profile?.offeredSkills?.some(
                  (os) =>
                    (typeof os === 'string'
                      ? allSkills?.skills.find((s: { _id: string; name: string }) => s._id === os)?.name === skill.name
                      : os.name === skill.name)
                );

                const isDisabled = isAlreadyAdded || isOffering;

                return (
                  <button
                    key={skill.name}
                    onClick={async () => {
                      if (isAlreadyAdded) {
                        toast.error('This skill is already in your wishlist');
                        return;
                      }

                      if (isOffering) {
                        toast.error('You cannot add a skill you are already offering to your wishlist');
                        return;
                      }

                      try {
                        // Refresh skills list if not loaded
                        if (!allSkills || allSkills.skills.length === 0) {
                          await queryClient.refetchQueries({ queryKey: ['skills'] });
                          toast.error('Skills not loaded. Please try again.');
                          return;
                        }

                        // Find the skill in the database (should exist as it's predefined and seeded)
                        const existingSkill = allSkills.skills.find(
                          (s: { name: string; _id: string }) => s.name.toLowerCase() === skill.name.toLowerCase()
                        );

                        if (!existingSkill) {
                          // Try to refresh and find again
                          const refreshed = await queryClient.fetchQuery({
                            queryKey: ['skills'],
                            queryFn: () => skillService.getAllSkills({ limit: 100 }),
                          });
                          
                          const retrySkill = refreshed.skills.find(
                            (s: { name: string; _id: string }) => s.name.toLowerCase() === skill.name.toLowerCase()
                          );
                          
                          if (!retrySkill) {
                            toast.error(`Skill "${skill.name}" not found in database. Skills may not be seeded yet. Please contact support.`);
                            console.error('Available skills:', refreshed.skills.map((s: { name: string }) => s.name));
                            return;
                          }
                          
                          await addDesiredSkillMutation.mutateAsync(retrySkill._id);
                          return;
                        }

                        // Add the existing skill to user's wishlist
                        await addDesiredSkillMutation.mutateAsync(existingSkill._id);
                      } catch (error: any) {
                        console.error('Error adding skill:', error);
                        toast.error(error?.response?.data?.message || 'Failed to add skill');
                      }
                    }}
                    disabled={isDisabled || addDesiredSkillMutation.isPending}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${
                        isDisabled
                          ? 'border-border-light bg-surface-elevation text-text-tertiary cursor-not-allowed opacity-60'
                          : 'border-border-light bg-surface hover:border-primary-300 hover:bg-surface-elevation text-text-primary'
                      }
                    `}
                    title={
                      isOffering
                        ? 'You are already offering this skill'
                        : isAlreadyAdded
                        ? 'Already in your wishlist'
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{skill.name}</span>
                      {isDisabled && (
                        <FiCheck className="w-5 h-5 text-text-tertiary" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {isOffering ? 'You offer this' : skill.category}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-border-light">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
              >
                Close
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearnings;

