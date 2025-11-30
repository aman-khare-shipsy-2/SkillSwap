// Predefined skills list - matches frontend constants
export const PREDEFINED_SKILLS = [
  { name: 'Filming', category: 'Media' },
  { name: 'Singing', category: 'Arts' },
  { name: 'Dancing', category: 'Arts' },
  { name: 'Coding', category: 'Technology' },
  { name: 'Cooking', category: 'Culinary' },
  { name: 'Baking', category: 'Culinary' },
  { name: 'Graphic Designing', category: 'Design' },
  { name: 'Oil Painting', category: 'Arts' },
  { name: 'Video Editing', category: 'Media' },
  { name: 'Fitness', category: 'Health' },
  { name: 'UI/UX', category: 'Design' },
  { name: 'Interior Designing', category: 'Design' },
  { name: 'VFX', category: 'Media' },
  { name: 'Guitar', category: 'Music' },
] as const;

export type PredefinedSkillName = typeof PREDEFINED_SKILLS[number]['name'];

/**
 * Check if a skill name is in the predefined list
 */
export const isPredefinedSkill = (skillName: string): boolean => {
  return PREDEFINED_SKILLS.some(
    (skill) => skill.name.toLowerCase() === skillName.trim().toLowerCase()
  );
};

/**
 * Get predefined skill by name (case-insensitive)
 */
export const getPredefinedSkill = (skillName: string): typeof PREDEFINED_SKILLS[number] | undefined => {
  return PREDEFINED_SKILLS.find(
    (skill) => skill.name.toLowerCase() === skillName.trim().toLowerCase()
  );
};

/**
 * Get all predefined skill names
 */
export const getPredefinedSkillNames = (): string[] => {
  return PREDEFINED_SKILLS.map((skill) => skill.name);
};

