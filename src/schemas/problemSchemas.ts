import { ProblemDifficultyTypeEnum, QUESTION_TYPES, QuestionType } from "@/constants/problemTypes";
import { z } from "zod";
import { NA_PATH_ID, ServiceIdEnum, SERVICE_IDS } from "@/constants/serviceIds";


const createProblemBaseSchema = <T extends QuestionType>(questionType: T) => {
    return z.object({
      id: z.string().default(NA_PATH_ID),
      questionType: z.literal(questionType),
      serviceId: ServiceIdEnum,
      categoryId: z.string().default(NA_PATH_ID),
      stepId: z.string().default(NA_PATH_ID),
      title: z.string(),
      description: z.string().optional(),
      explanation: z.string().optional(),
      difficulty: ProblemDifficultyTypeEnum,
      tags: z.array(z.string()).default([]),
  });
}

export const MultipleChoiceProblemSchema = z.object({
  ...createProblemBaseSchema(QUESTION_TYPES.MULTIPLE_CHOICE).shape,
  choices: z.array(z.object({
    options: z.array(z.string()).min(2).max(5),
    correctAnswer: z.string(),
    tips: z.array(z.string()).optional(),
  })),
});

export const InputProblemSchema = z.object({
  ...createProblemBaseSchema(QUESTION_TYPES.INPUT).shape,
  inputs: z.array(z.object({
    correctAnswer: z.string(),
    tips: z.array(z.string()).optional(),
    placeholder: z.string().optional(),
  })),
});

export const SortingProblemSchema = z.object({
  ...createProblemBaseSchema(QUESTION_TYPES.SORTING).shape,
  items: z.array(z.object({
    targets: z.array(z.string()), // words or sentences to sort correctly.
    correctOrder: z.array(z.string()),
    tips: z.array(z.string()).optional(),
  })),
});

export const ProblemSchema = z.discriminatedUnion("questionType", [
  MultipleChoiceProblemSchema,
  InputProblemSchema,
  SortingProblemSchema
]).readonly();

export type Problem = z.infer<typeof ProblemSchema>;




/**
 * Concrete service problem schemas below.
 */

const WritingContentSchema = z.union([
  z.object({ type: z.literal("text"), value: z.string() }),
  z.object({ type: z.literal("blank"), correctAnswer: z.string(), tips: z.string().optional() }),
]);

export const WritingInputProblemSchema = z.object({
  ...createProblemBaseSchema(QUESTION_TYPES.INPUT).shape,
  serviceId: z.literal(SERVICE_IDS.WRITING),
  content: z.array(WritingContentSchema),
});

export const GrammarMultipleChoiceProblemSchema = z.object({
  ...createProblemBaseSchema(QUESTION_TYPES.MULTIPLE_CHOICE).shape,
  serviceId: z.literal(SERVICE_IDS.GRAMMAR),
  problem: z.string(),
});


const BasisOptionSchema = z.object({
  text: z.string(),
  images: z.array(z.string()),
});

export const BasisProblemSchema = z.object({
  serviceId: z.literal(SERVICE_IDS.BASIS),
  example: z.string(),
  options: z.array(BasisOptionSchema), // TODO try integration with multiple-choice question type schema
  answer: z.string(),
})

export const ServiceTypeProblemSchema = z.discriminatedUnion("serviceId", [
  WritingInputProblemSchema,
  GrammarMultipleChoiceProblemSchema,
  BasisProblemSchema
]).readonly();

export type ServiceTypeProblem = z.infer<typeof ServiceTypeProblemSchema>;


// export const PatternSchema = baseProblemSchema.extend({
//   type: z.literal("pattern"),
//   title: z.string(),
//   description: z.string(),
//   examples: z.array(z.object({ en: z.string(), jp: z.string() })),
//   problemIds: z.array(z.string()),
// });

// export type Pattern = z.infer<typeof PatternSchema>;
