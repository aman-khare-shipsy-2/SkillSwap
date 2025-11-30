import { IQuestion } from '../models/VerificationTest';
import { PREDEFINED_SKILLS } from './predefinedSkills';

/**
 * Generate dummy questions for testing verification system
 * Each skill has 5 questions, with option a) always being the correct answer
 */
export const getDummyQuestionsForSkill = (skillName: string): IQuestion[] => {
  const skill = PREDEFINED_SKILLS.find(
    (s) => s.name.toLowerCase() === skillName.toLowerCase()
  );

  if (!skill) {
    // Fallback questions if skill not found
    return generateGenericQuestions();
  }

  // Generate 5 questions for the specific skill
  return [
    {
      text: `Question 1: What is a fundamental aspect of ${skill.name}?`,
      options: [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
      ],
      correctAnswer: 'Option 1',
    },
    {
      text: `Question 2: Which technique is most important in ${skill.name}?`,
      options: [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
      ],
      correctAnswer: 'Option 1',
    },
    {
      text: `Question 3: What is the best practice for ${skill.name}?`,
      options: [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
      ],
      correctAnswer: 'Option 1',
    },
    {
      text: `Question 4: Which tool is essential for ${skill.name}?`,
      options: [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
      ],
      correctAnswer: 'Option 1',
    },
    {
      text: `Question 5: What should you prioritize when learning ${skill.name}?`,
      options: [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
      ],
      correctAnswer: 'Option 1',
    },
  ];
};

/**
 * Generate generic questions as fallback
 */
const generateGenericQuestions = (): IQuestion[] => {
  return [
    {
      text: 'Question 1: What is the fundamental concept?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 'Option 1',
    },
    {
      text: 'Question 2: Which technique is most important?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 'Option 1',
    },
    {
      text: 'Question 3: What is the best practice?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 'Option 1',
    },
    {
      text: 'Question 4: Which tool is essential?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 'Option 1',
    },
    {
      text: 'Question 5: What should you prioritize?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 'Option 1',
    },
  ];
};

