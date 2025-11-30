import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { skillService } from '../../services/skill.service';
import { PREDEFINED_SKILLS } from '../../constants/skills';
import toast from 'react-hot-toast';
import { FiPlus, FiCheck } from 'react-icons/fi';

const MySkills = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });

  const { data: allSkills, isLoading: isLoadingSkills, error: skillsError } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillService.getAllSkills({ limit: 100 }),
    retry: 2,
  });

  const addSkillMutation = useMutation({
    mutationFn: (skillId: string) => userService.addOfferedSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill added successfully!');
      setShowAddModal(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add skill');
    },
  });

  const offeredSkills = profile?.offeredSkills || [];
  const verifiedSkills = profile?.verifiedSkills || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="h2 text-text-primary">My Skills</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add New Skill</span>
        </button>
      </div>

      {/* Skills Table */}
      <div className="card overflow-hidden p-0">
        <table className="min-w-full divide-y divide-border-light">
          <thead className="bg-surface-elevation">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Skill Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Average Rating
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Verification Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border-light">
            {offeredSkills.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                  No skills added yet. Click "Add New Skill" to get started.
                </td>
              </tr>
            ) : (
              offeredSkills.map((skill) => {
                const skillObj = typeof skill === 'string' ? null : skill;
                const skillId = typeof skill === 'string' ? skill : skill._id;
                const isVerified = verifiedSkills.includes(skillId);

                return (
                  <tr key={skillId} className="hover:bg-surface-elevation transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-text-primary">
                        {skillObj?.name || 'Loading...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">
                        {profile?.averageRating.toFixed(1) || '0.0'}/5.0
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isVerified ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-700">
                          <FiCheck className="w-4 h-4 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-700">
                          Not Verified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!isVerified && (
                        <button
                          onClick={() => {
                            // Navigate to verification page
                            window.location.href = `/verification/${skillId}`;
                          }}
                          className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="h3 mb-6 text-text-primary">Add New Skill</h3>
            <p className="text-sm text-text-secondary mb-6">
              Select from the predefined skills available on the platform
            </p>

            {isLoadingSkills && (
              <div className="text-center py-8 text-text-secondary">Loading skills...</div>
            )}

            {skillsError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">
                  Error loading skills. Please refresh the page.
                </p>
              </div>
            )}

            {!isLoadingSkills && !skillsError && (!allSkills || allSkills.skills.length === 0) && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700">
                  No skills found in database. Skills should be automatically seeded on server startup.
                  Please contact support or restart the server.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {PREDEFINED_SKILLS.map((skill) => {
                const isAlreadyAdded = offeredSkills.some(
                  (os) =>
                    (typeof os === 'string' 
                      ? allSkills?.skills.find((s: { _id: string; name: string }) => s._id === os)?.name === skill.name
                      : os.name === skill.name)
                );

                // Note: Users can add skills they want to learn to their offered skills
                // (they might want to teach something they're learning)

                return (
                  <button
                    key={skill.name}
                    onClick={async () => {
                      if (isAlreadyAdded) {
                        toast.error('This skill is already in your list');
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
                          
                          await addSkillMutation.mutateAsync(retrySkill._id);
                          return;
                        }

                        // Add the existing skill to user's profile
                        await addSkillMutation.mutateAsync(existingSkill._id);
                      } catch (error: any) {
                        console.error('Error adding skill:', error);
                        toast.error(error?.response?.data?.message || 'Failed to add skill');
                      }
                    }}
                    disabled={isAlreadyAdded || addSkillMutation.isPending}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${
                        isAlreadyAdded
                          ? 'border-border-light bg-surface-elevation text-text-tertiary cursor-not-allowed'
                          : 'border-border-light bg-surface hover:border-primary-300 hover:bg-surface-elevation text-text-primary'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{skill.name}</span>
                      {isAlreadyAdded && (
                        <FiCheck className="w-5 h-5 text-text-tertiary" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{skill.category}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border-light">
              <button
                type="button"
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

export default MySkills;

