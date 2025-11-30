import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { skillService } from '../services/skill.service';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { PREDEFINED_SKILLS } from '../constants/skills';
import { FiCheck } from 'react-icons/fi';

const SkillSelection = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all skills to get their IDs
  const { data: allSkills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ['all-skills'],
    queryFn: () => skillService.getAllSkills({ limit: 100 }),
    retry: 2,
  });

  // Add skills to user profile
  const addSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      await userService.addOfferedSkill(skillId);
    },
  });

  const handleSkillToggle = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  };

  const handleSubmit = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill you can offer');
      return;
    }

    try {
      setIsSubmitting(true);

      // For each selected skill, find it in the database and add it to user
      for (const skillName of selectedSkills) {
        const predefinedSkill = PREDEFINED_SKILLS.find((s) => s.name === skillName);
        if (!predefinedSkill) {
          console.warn(`Skill ${skillName} not found in predefined list`);
          continue;
        }

        // Find the skill in the database (should exist as it's predefined and seeded)
        if (!allSkills || allSkills.skills.length === 0) {
          toast.error('Skills not loaded. Please refresh the page.');
          setIsSubmitting(false);
          return;
        }

        let existingSkill = allSkills.skills.find(
          (s) => s.name.toLowerCase() === skillName.toLowerCase()
        );

        if (!existingSkill) {
          // Try refreshing skills once
          try {
            const refreshed = await skillService.getAllSkills({ limit: 100 });
            existingSkill = refreshed.skills.find(
              (s) => s.name.toLowerCase() === skillName.toLowerCase()
            );
          } catch (refreshError) {
            console.error('Error refreshing skills:', refreshError);
          }
        }

        if (!existingSkill) {
          toast.error(`Skill "${skillName}" not found in database. Skills may not be seeded yet. Please contact support.`);
          console.error('Available skills:', allSkills.skills.map((s) => s.name));
          continue;
        }

        // Add skill to user's offered skills
        await addSkillMutation.mutateAsync(existingSkill._id);
      }

      // Refresh user profile
      const updatedProfile = await userService.getProfile();
      updateUser(updatedProfile);

      toast.success('Skills added successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding skills:', error);
      toast.error('Failed to add skills. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSkills) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-elevation">
        <div className="text-text-secondary">Loading skills...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-elevation py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Welcome to Skill Swap!</h1>
          <p className="text-text-secondary">
            Select the skills you can offer to others
          </p>
        </div>

        {/* Skills Grid */}
        <div className="card mb-6">
          <h2 className="h3 text-text-primary mb-6">Choose Your Skills</h2>
          <p className="text-sm text-text-secondary mb-6">
            Select all the skills you're comfortable teaching. You can add more later.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PREDEFINED_SKILLS.map((skill) => {
              const isSelected = selectedSkills.includes(skill.name);
              return (
                <button
                  key={skill.name}
                  onClick={() => handleSkillToggle(skill.name)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-border-light bg-surface hover:border-primary-300 hover:bg-surface-elevation text-text-primary'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{skill.name}</span>
                    {isSelected && (
                      <FiCheck className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{skill.category}</p>
                </button>
              );
            })}
          </div>

          {selectedSkills.length > 0 && (
            <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
              <p className="text-sm text-primary-700">
                <span className="font-semibold">{selectedSkills.length}</span> skill
                {selectedSkills.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleSubmit}
            disabled={selectedSkills.length === 0 || isSubmitting}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding Skills...' : 'Continue to Dashboard'}
          </button>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          You can add or remove skills later from your profile
        </p>
      </div>
    </div>
  );
};

export default SkillSelection;

