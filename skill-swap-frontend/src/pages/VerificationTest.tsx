import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { verificationService } from '../services/verification.service';
import toast from 'react-hot-toast';
import type { VerificationTest } from '../types';

const VerificationTest = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<VerificationTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: testData, isLoading: isLoadingTest } = useQuery({
    queryKey: ['verification-test', skillId],
    queryFn: () => verificationService.startTest(skillId!),
    enabled: !!skillId,
  });

  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: (data: { testId: string; answers: Array<{ questionIndex: number; answer: string | number }> }) =>
      verificationService.submitTest(data),
    onSuccess: (result) => {
      // Invalidate profile query to refresh verified skills
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      if (result.status === 'passed') {
        toast.success(`Test passed! Score: ${result.score?.toFixed(0) || 0}%`);
      } else {
        toast.error(`Test failed. Score: ${result.score?.toFixed(0) || 0}%`);
      }
      navigate('/dashboard');
    },
  });

  useEffect(() => {
    if (testData) {
      setTest(testData);
    }
  }, [testData]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = () => {
    if (!test) return;

    // Convert answers to backend format (using questionIndex as key)
    const answersArray = test.questions.map((_, index) => {
      const answer = answers[index] || '';
      return {
        questionIndex: index,
        answer: answer,
      };
    });

    if (answersArray.some((a) => !a.answer)) {
      toast.error('Please answer all questions');
      return;
    }

    submitMutation.mutate({
      testId: test._id,
      answers: answersArray,
    });
  };

  if (isLoadingTest) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading test...</div>
      </div>
    );
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Test not available</div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {test.questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQuestion.text || currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuestionIndex] === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={option}
                  checked={answers[currentQuestionIndex] === option}
                  onChange={() => handleAnswerChange(currentQuestionIndex, option)}
                  className="mr-3"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentQuestionIndex < test.questions.length - 1 ? (
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min(test.questions.length - 1, prev + 1)
                )
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit Test'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationTest;

