// components/QuizQuestion.tsx
'use client';

type Problem = {
  id: string;
  problem: string;
  answer: string;
  options: string[];
  details: string;
};

type QuizQuestionProps = {
  problem: Problem;
  questionNumber: number;
  selectedOption?: string;
  onSelectOption: (id: string, option: string) => void;
};

export default function QuizQuestion({ problem, questionNumber, selectedOption, onSelectOption }: QuizQuestionProps) {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded shadow">
      <h3 className="text-xl font-semibold mb-2">
        {questionNumber}. {problem.problem}
      </h3>
      <div className="space-y-2">
        {problem.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectOption(problem.id, option)}
            className={`block w-full text-left px-4 py-2 rounded transition ${
              selectedOption === option
                ? 'bg-indigo-500 text-white'
                : 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
