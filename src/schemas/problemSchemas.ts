import { z } from "zod";

// 抽象スキーマ・共通ルール
const baseProblemSchema = z.object({
  id: z.string(),
  type: z.enum(["multiple-choice", "fill-in-the-blank", "writing", "basis", "pattern"]),
  category: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

const multipleChoiceProblemSchema = baseProblemSchema.extend({
  type: z.literal("multiple-choice"),
  question: z.string(),
  options: z.array(
    z.object({
      text: z.string(),
      images: z.array(z.string()).optional(),
    })
  ),
  answer: z.string(),
  explanation: z.string().optional(),
});

const fillInTheBlankProblemSchema = baseProblemSchema.extend({
  type: z.literal("fill-in-the-blank"),
  title: z.string(),
  description: z.string(),
  text: z.string(),
  blanks: z.array(
    z.object({
      index: z.number(),
      correctAnswer: z.string(),
      tips: z.string().optional(),
    })
  ),
});


// WritingExerciseSchemaの型を生成
const WritingExerciseSchema = baseProblemSchema.extend({
  type: z.literal("writing"),
  id: z.string(),
  title: z.string(),
  description: z.string(),
  text: z.string(),
  blanks: z.array(
    z.object({
      index: z.number(),
      correctAnswer: z.string(),
      tips: z.string().optional(),
    })
  ),
});

const basisProblemSchema = baseProblemSchema.extend({
  type: z.literal("basis"),
  id: z.string(),
  example: z.string(),
  explanation: z.string(),
  options: z.array(
    z.object({
      text: z.string(),
      images: z.array(z.string()),
    })
  ),
  answer: z.string(),
});

// export type WritingExercise = z.infer<typeof WritingExerciseSchema>;

export const PatternSchema = baseProblemSchema.extend({
  type: z.literal("pattern"),
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  examples: z.array(z.object({ en: z.string(), jp: z.string() })),
  problemIds: z.array(z.string()),
});

// TODO
export const ProblemSchema = z.discriminatedUnion("type", [
  multipleChoiceProblemSchema,
  fillInTheBlankProblemSchema,
  WritingExerciseSchema,
  basisProblemSchema,
  PatternSchema,
]);

export type Problem = z.infer<typeof ProblemSchema>;

// 個々の問題スキーマの部分的なバージョン
const partialMultipleChoiceProblemSchema = multipleChoiceProblemSchema.partial();
const partialFillInTheBlankProblemSchema = fillInTheBlankProblemSchema.partial();
const partialWritingExerciseSchema = WritingExerciseSchema.partial();
const partialBasisProblemSchema = basisProblemSchema.partial();
const partialPatternSchema = PatternSchema.partial();

export const PartialProblemSchema = z.discriminatedUnion("type", [
  partialMultipleChoiceProblemSchema,
  partialFillInTheBlankProblemSchema,
  partialWritingExerciseSchema,
  partialBasisProblemSchema,
  partialPatternSchema,
]);

export type PartialProblem = z.infer<typeof PartialProblemSchema>;


export type Pattern = z.infer<typeof PatternSchema>;
// export const ExerciseSchema = z.object({
//     id: z.string(),
//     type: z.enum(["fill-in-the-blank", "multiple-choice", "listening", "writing"]),
//     question: z.string(),
//     options: z.array(z.string()).optional(),
//     answer: z.union([z.string(), z.array(z.string())]),
//     tips: z.string().optional(),
// });

// export const PatternSchema = z.object({
//     id: z.string(),
//     title: z.string(),
//     description: z.string(),
//     difficulty: z.enum(["beginner", "intermediate", "advanced"]),
//     examples: z.array(z.object({ en: z.string(), jp: z.string() })),
//     exercises: z.array(ExerciseSchema),
// });
