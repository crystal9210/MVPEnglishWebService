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

const writingExerciseSchema = baseProblemSchema.extend({
  type: z.literal("writing"),
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

export const PatternSchema = baseProblemSchema.extend({
  type: z.literal("pattern"),
  title: z.string(),
  description: z.string(),
  examples: z.array(z.object({ en: z.string(), jp: z.string() })),
  problemIds: z.array(z.string()),
});

export type Pattern = z.infer<typeof PatternSchema>;

// 手動でプロパティをオプショナル化
const partialMultipleChoiceProblemSchema = multipleChoiceProblemSchema.extend({
  question: z.string().optional(),
  options: z.array(
    z.object({
      text: z.string(),
      images: z.array(z.string()).optional(),
    })
  ).optional(),
  answer: z.string().optional(),
  explanation: z.string().optional(),
});

const partialFillInTheBlankProblemSchema = fillInTheBlankProblemSchema.extend({
  title: z.string().optional(),
  description: z.string().optional(),
  text: z.string().optional(),
  blanks: z.array(
    z.object({
      index: z.number(),
      correctAnswer: z.string(),
      tips: z.string().optional(),
    })
  ).optional(),
});

const partialWritingExerciseSchema = writingExerciseSchema.extend({
  title: z.string().optional(),
  description: z.string().optional(),
  text: z.string().optional(),
  blanks: z.array(
    z.object({
      index: z.number(),
      correctAnswer: z.string(),
      tips: z.string().optional(),
    })
  ).optional(),
});

const partialPatternSchema = PatternSchema.extend({
  title: z.string().optional(),
  description: z.string().optional(),
  examples: z.array(z.object({ en: z.string(), jp: z.string() })).optional(),
  problemIds: z.array(z.string()).optional(),
});

// Discriminated Union
export const PartialProblemSchema = z.discriminatedUnion("type", [
  partialMultipleChoiceProblemSchema,
  partialFillInTheBlankProblemSchema,
  partialWritingExerciseSchema,
  partialPatternSchema,
]);

export type PartialProblem = z.infer<typeof PartialProblemSchema>;

// 問題スキーマ全体
export const ProblemSchema = {
  "multiple-choice": multipleChoiceProblemSchema,
  "fill-in-the-blank": fillInTheBlankProblemSchema,
  writing: writingExerciseSchema,
};

export const baseProblemValidationSchema = baseProblemSchema;

// 型エイリアス
export type Problem = z.infer<typeof baseProblemSchema>;
export type MultipleChoiceProblem = z.infer<typeof multipleChoiceProblemSchema>;
export type FillInTheBlankProblem = z.infer<typeof fillInTheBlankProblemSchema>;
export type WritingProblem = z.infer<typeof writingExerciseSchema>;

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
