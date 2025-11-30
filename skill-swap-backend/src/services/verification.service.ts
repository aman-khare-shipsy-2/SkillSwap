import VerificationTest, { IVerificationTest, IQuestion } from '../models/VerificationTest';
import User from '../models/User';
import Skill from '../models/Skill';
import { ERROR_MESSAGES, VERIFICATION_PASSING_SCORE } from '../utils/constants';
import { getDummyQuestionsForSkill } from '../utils/dummyQuestions';
import mongoose from 'mongoose';

export interface TestQuestion {
  text: string;
  options: string[];
  // correctAnswer is not included in response
}

export interface TestWithQuestions extends Omit<IVerificationTest, 'questions'> {
  questions: TestQuestion[];
}

export interface SubmitTestData {
  testId: string;
  userId: string;
  answers: Array<{ questionIndex: number; answer: string | number }>;
}

// Generate test questions based on skill
const generateTestQuestions = async (skillId: string): Promise<IQuestion[]> => {
  try {
    // Fetch skill to get its name
    const skill = await Skill.findById(skillId);
    if (!skill) {
      console.error('Skill not found:', skillId);
      throw new Error(ERROR_MESSAGES.SKILL_NOT_FOUND);
    }

    console.log('Generating questions for skill:', skill.name);

    // Get dummy questions for this specific skill
    const questions = getDummyQuestionsForSkill(skill.name);
    console.log('Generated questions count:', questions.length);
    return questions;
  } catch (error) {
    console.error('Error generating test questions:', error);
    throw error;
  }
};

// Start verification test
export const startVerificationTest = async (
  userId: string,
  skillId: string
): Promise<TestWithQuestions> => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(skillId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  // Check if user already verified for this skill
  const user = await User.findById(userId);
  if (!user) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  if (user.verifiedSkills.some((id) => id.toString() === skillId)) {
    throw new Error('User is already verified for this skill');
  }

  // Check for existing pending test
  const existingTest = await VerificationTest.findOne({
    userId,
    skillId,
    status: 'pending',
  });

  if (existingTest) {
    // Return existing test without correct answers
    const testWithoutAnswers = existingTest.toObject();
    testWithoutAnswers.questions = testWithoutAnswers.questions.map((q: IQuestion) => ({
      text: q.text,
      options: q.options,
    })) as IQuestion[];
    return testWithoutAnswers as TestWithQuestions;
  }

  // Generate test questions
  const questions = await generateTestQuestions(skillId);

  // Create verification test
  const test = new VerificationTest({
    userId,
    skillId,
    questions,
    status: 'pending',
  });

  await test.save();

  // Return test without correct answers
  const testWithoutAnswers = test.toObject();
  testWithoutAnswers.questions = testWithoutAnswers.questions.map((q: IQuestion) => ({
    text: q.text,
    options: q.options,
  })) as IQuestion[];

  return testWithoutAnswers as TestWithQuestions;
};

// Submit test answers
export const submitTestAnswers = async (data: SubmitTestData): Promise<IVerificationTest> => {
  const { testId, userId, answers } = data;

  if (!mongoose.Types.ObjectId.isValid(testId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  // Find test
  const test = await VerificationTest.findById(testId);
  if (!test) {
    throw new Error(ERROR_MESSAGES.TEST_NOT_FOUND);
  }

  // Validate user owns test
  if (test.userId.toString() !== userId) {
    throw new Error(ERROR_MESSAGES.FORBIDDEN);
  }

  // Validate test is pending
  if (test.status !== 'pending') {
    throw new Error(ERROR_MESSAGES.TEST_ALREADY_COMPLETED);
  }

  // Update questions with user answers
  answers.forEach((answer) => {
    if (test.questions[answer.questionIndex]) {
      test.questions[answer.questionIndex].userAnswer = answer.answer;
    }
  });

  // Calculate score (pre-save hook will handle this, but we can also do it here)
  const totalQuestions = test.questions.length;
  let correctAnswers = 0;
  test.questions.forEach((question) => {
    if (question.userAnswer !== undefined && question.userAnswer === question.correctAnswer) {
      correctAnswers++;
    }
  });

  const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  test.score = scorePercentage;

  // Determine status
  test.status = scorePercentage >= VERIFICATION_PASSING_SCORE ? 'passed' : 'failed';

  if (test.status === 'passed') {
    test.verifiedAt = new Date();

    // Add skill to user's verifiedSkills
    const user = await User.findById(userId);
    if (user && !user.verifiedSkills.some((id) => id.toString() === test.skillId.toString())) {
      user.verifiedSkills.push(test.skillId);
      await user.save();
    }
  }

  await test.save();

  return test;
};

// Get test by ID
export const getTestById = async (
  testId: string,
  userId: string
): Promise<TestWithQuestions | IVerificationTest> => {
  if (!mongoose.Types.ObjectId.isValid(testId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const test = await VerificationTest.findById(testId);
  if (!test) {
    throw new Error(ERROR_MESSAGES.TEST_NOT_FOUND);
  }

  // Validate user owns test
  if (test.userId.toString() !== userId) {
    throw new Error(ERROR_MESSAGES.FORBIDDEN);
  }

  // If test is pending, hide correct answers
  if (test.status === 'pending') {
    const testWithoutAnswers = test.toObject();
    testWithoutAnswers.questions = testWithoutAnswers.questions.map((q: IQuestion) => ({
      text: q.text,
      options: q.options,
    })) as IQuestion[];
    return testWithoutAnswers as TestWithQuestions;
  }

  // If completed, return full test with answers
  return test;
};

// Get user verification status
export const getUserVerificationStatus = async (
  userId: string
): Promise<Array<{ skillId: string; status: string; score?: number; verifiedAt?: Date }>> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const tests = await VerificationTest.find({ userId })
    .populate('skillId', 'name category')
    .sort({ attemptedAt: -1 })
    .exec();

  // Group by skill and get latest status
  const statusMap = new Map<string, { status: string; score?: number; verifiedAt?: Date }>();

  tests.forEach((test) => {
    const skillIdStr = test.skillId.toString();
    if (!statusMap.has(skillIdStr)) {
      statusMap.set(skillIdStr, {
        status: test.status,
        score: test.score,
        verifiedAt: test.verifiedAt,
      });
    }
  });

  // Convert to array
  const statusArray = Array.from(statusMap.entries()).map(([skillId, status]) => ({
    skillId,
    ...status,
  }));

  return statusArray;
};

