import { z } from "zod";

export const ExerciseSchema = z.object({
    id: z.string(),
    type: z.enum(["fill-in-the-blank", "multiple-choice", "listening", "writing"]),
    question: z.string(),
    options: z.array(z.string()).optional(),
    answer: z.union([z.string(), z.array(z.string())]),
    tips: z.string().optional(),
});

export const PatternSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    examples: z.array(z.object({ en: z.string(), jp: z.string() })),
    exercises: z.array(ExerciseSchema),
});

// WritingExerciseSchemaの型を生成
export const WritingExerciseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  text: z.string(),
  blanks: z.array(
    z.object({
      index: z.number(),
      correctAnswer: z.string(),
      hint: z.string().optional(),
    })
  ),
});
export type WritingExercise = z.infer<typeof WritingExerciseSchema>;
