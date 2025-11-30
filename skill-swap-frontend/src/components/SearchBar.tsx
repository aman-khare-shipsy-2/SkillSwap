import { useState } from 'react';
import { requestService } from '../services/request.service';
import { skillService } from '../services/skill.service';
import { useAuthStore } from '../store/authStore';
import { PREDEFINED_SKILLS } from '../constants/skills';
import toast from 'react-hot-toast';
import type { User, Skill } from '../types';
import { FiSearch } from 'react-icons/fi';

const SearchBar = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    if (!user?.offeredSkills || user.offeredSkills.length === 0) {
      toast.error('Please add at least one offered skill to your profile');
      return;
    }

    // Validate that the search term matches a predefined skill
    const matchingPredefinedSkill = PREDEFINED_SKILLS.find(
      (skill) => skill.name.toLowerCase() === searchTerm.trim().toLowerCase()
    );

    if (!matchingPredefinedSkill) {
      toast.error(`"${searchTerm}" is not available. Please select from the predefined skills.`);
      return;
    }

    try {
      setIsSearching(true);

      // Search for the skill in database (it should exist as it's predefined)
      const skillsResult = await skillService.getAllSkills({
        search: searchTerm.trim(),
        limit: 10,
      });

      // Find exact match (case-insensitive)
      const skill = skillsResult.skills.find(
        (s) => s.name.toLowerCase() === matchingPredefinedSkill.name.toLowerCase()
      );

      if (!skill) {
        toast.error('Skill not found in database. Please contact support.');
        setShowResults(false);
        return;
      }

      setSelectedSkill(skill);

      // Get all user's offered skills (not just the first one)
      const userOfferedSkillIds = user.offeredSkills.map((skill) =>
        typeof skill === 'string' ? skill : skill._id
      );

      if (userOfferedSkillIds.length === 0) {
        toast.error('Please add at least one offered skill to your profile');
        setShowResults(false);
        return;
      }

      // Search for users offering this skill
      const usersResult = await requestService.searchUsers({
        requestedSkillId: skill._id,
        offeredSkillIds: userOfferedSkillIds, // Pass all offered skill IDs
        limit: 10,
      });

      console.log('Search results:', {
        usersFound: usersResult.users.length,
        total: usersResult.total,
        requestedSkill: skill.name,
        offeredSkills: userOfferedSkillIds,
      });

      setSearchResults(usersResult.users);
      setShowResults(true);
      
      if (usersResult.users.length === 0) {
        toast('No users found matching your search criteria', { icon: 'ℹ️' });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      toast.error(error?.response?.data?.message || 'Search failed. Please try again.');
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (receiverId: string) => {
    if (!selectedSkill || !user?.offeredSkills || user.offeredSkills.length === 0) {
      toast.error('Unable to send request');
      return;
    }

    try {
      const userOfferedSkillId =
        typeof user.offeredSkills[0] === 'string'
          ? user.offeredSkills[0]
          : user.offeredSkills[0]._id;

      await requestService.createRequest({
        receiverId,
        offeredSkillId: userOfferedSkillId,
        requestedSkillId: selectedSkill._id,
      });

      toast.success('Request sent successfully!');
      setShowResults(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Send request error:', error);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for a skill to learn..."
          list="skills-list"
          className="flex-1 px-4 py-2.5 border border-border-light rounded-l-xl bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        <datalist id="skills-list">
          {PREDEFINED_SKILLS.map((skill: { name: string; category: string }) => (
            <option key={skill.name} value={skill.name} />
          ))}
        </datalist>
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-5 py-2.5 bg-primary-500 text-white rounded-r-xl hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center transition-all"
        >
          <FiSearch className="w-5 h-5" />
        </button>
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 card shadow-soft-lg max-h-96 overflow-y-auto">
          {searchResults.map((resultUser) => (
            <div
              key={resultUser._id}
              className="p-4 border-b border-border-light last:border-b-0 hover:bg-surface-elevation transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">{resultUser.name}</h3>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Rating: {resultUser.averageRating.toFixed(1)}/5.0
                  </p>
                </div>
                <button
                  onClick={() => handleSendRequest(resultUser._id)}
                  className="btn btn-primary text-sm px-4 py-2"
                >
                  Send Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-2 card shadow-soft-lg p-4">
          <p className="text-text-secondary text-center">No users found</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

