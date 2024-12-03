"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InputField from "./_components/InputField";
import HintDisplay from "./_components/HintDisplay";
import { WritingExerciseSchema, WritingExercise } from "@/schemas/WritingExerciseSchema";

const sampleData: WritingExercise[] = [
  {
    id: "writing-001",
    title: "Daily Routine",
    description: "Fill in the blanks with the correct words based on the hints.",
    content: [
      { type: "text", value: "Every morning, I wake up at " },
      { type: "blank", correctAnswer: "7:00", tips: "A typical wake-up time" },
      { type: "text", value: ". After that, I eat a quick " },
      { type: "blank", correctAnswer: "breakfast", tips: "A morning meal" },
      { type: "text", value: " before heading to work." }
    ]
  },
  {
        "id": "writing-002",
        "title": "Weekend Plans",
        "description": "Complete the sentences to describe a weekend plan.",
        "content": [
        { "type": "text", "value": "This Saturday, I will go to the " },
        { "type": "blank", "correctAnswer": "park", "tips": "An outdoor location" },
        { "type": "text", "value": " with my friends. We plan to watch a " },
        { "type": "blank", "correctAnswer": "comedy", "tips": "A genre of movies" },
        { "type": "text", "value": " movie." }
        ]
    }
];

const WritingExercisePage = () => {
  const [exercise, setExercise] = useState<WritingExercise | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hint, setHint] = useState<string | null>(null);
  const [activeHintIndex, setActiveHintIndex] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const rawData = sampleData.find((item) => item.id === id);

    if (rawData) {
      const validated = WritingExerciseSchema.safeParse(rawData);
      if (validated.success) {
        setExercise(validated.data);
      } else {
        console.error("Invalid data:", validated.error);
      }
    }
  }, [id]);

  const handleInputChange = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleHintDisplay = (hintText: string | undefined, index: number) => {
    if (activeHintIndex === index) {
      setHint(null);
      setActiveHintIndex(null);
    } else {
      setHint(hintText || "No hint available");
      setActiveHintIndex(index);
    }
  };

  const handleSubmit = () => {
    if (!exercise) return;

    const newResults = exercise.content.map((part, idx) => {
      if (part.type === "blank") {
        const inputAnswer = answers[idx]?.trim().toLowerCase();
        const correctAnswer = part.correctAnswer?.trim().toLowerCase();
        return inputAnswer === correctAnswer;
      }
      return true; // for non-blank parts
    });

    setResults(newResults);
  };

  if (!exercise) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{exercise.title}</h1>
      <p className="mb-4">{exercise.description}</p>
      <div className="mb-4 flex flex-wrap">
        {exercise.content.map((part, idx) => {
          if (part.type === "text") {
            return <span key={idx}>{part.value}</span>;
          } else if (part.type === "blank") {
            return (
              <InputField
                key={idx}
                index={idx}
                value={answers[idx] || ""}
                onChange={handleInputChange}
                hint={part.tips}
                onHintClick={(hintText) => handleHintDisplay(hintText, idx)}
              />
            );
          }
          return null;
        })}
      </div>
      {hint && <HintDisplay hint={hint} />}
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Submit
      </button>
      {results.length > 0 && (
        <div className="mt-4">
          {results
            .filter((_, idx) => exercise.content[idx].type === "blank")
            .map((result, idx) => (
              <p
                key={idx}
                className={`${
                  result ? "text-green-500" : "text-red-500"
                } font-bold`}
              >
                {`Blank ${idx + 1}: ${result ? "Correct" : "Incorrect"}`}
              </p>
            ))}
        </div>
      )}
    </div>
  );
};

export default WritingExercisePage;
