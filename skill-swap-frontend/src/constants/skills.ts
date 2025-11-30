// Predefined skills list for the platform
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

