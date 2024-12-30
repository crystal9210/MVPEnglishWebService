import { QUESTION_TYPES, QuestionType } from "@/constants/problemTypes";
import { z } from "zod";
import { NA_PATH_ID, ServiceIdEnum, SERVICE_IDS } from "@/constants/serviceIds";
import { ProblemDifficultyLevelEnum } from "@/constants/userStatisticTypes";

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
        difficulty: ProblemDifficultyLevelEnum,
        tags: z.array(z.string()).default([]),
    });
};

const OptionSchema = z.object({
    text: z.string(),
    images: z.array(z.string()).optional(),
});

export const MultipleChoiceProblemSchema = z.object({
    ...createProblemBaseSchema(QUESTION_TYPES.MULTIPLE_CHOICE).shape,
    problemText: z.string(),
    items: z
        .array(
            z.object({
                options: z.array(OptionSchema).min(2).max(5),
                correctAnswer: z.string(),
                tips: z.array(z.string()).optional(),
            })
        )
        .min(1)
        .max(30), // TODO
});

export const InputProblemSchema = z.object({
    ...createProblemBaseSchema(QUESTION_TYPES.INPUT).shape,
    inputs: z
        .array(
            z.object({
                correctAnswer: z.string(),
                tips: z.array(z.string()).optional(),
                placeholder: z.string().optional(),
            })
        )
        .min(1)
        .max(30),
});

export const SortingProblemSchema = z.object({
    ...createProblemBaseSchema(QUESTION_TYPES.SORTING).shape,
    items: z
        .array(
            z.object({
                targets: z.array(z.string()), // >> words or sentences to sort correctly.
                correctOrder: z.array(z.string()),
                tips: z.array(z.string()).optional(),
            })
        )
        .min(1)
        .max(30),
});

export const ProblemSchema = z
    .discriminatedUnion("questionType", [
        MultipleChoiceProblemSchema,
        InputProblemSchema,
        SortingProblemSchema,
    ])
    .readonly();

export type Problem = z.infer<typeof ProblemSchema>;

/**
 * Concrete service problem schemas below.
 */

export const WritingInputProblemSchema = InputProblemSchema.extend({
    serviceId: z.literal(SERVICE_IDS.WRITING),
});

export const GrammarMultipleChoiceProblemSchema =
    MultipleChoiceProblemSchema.extend({
        serviceId: z.literal(SERVICE_IDS.GRAMMAR),
    });

export const BasisProblemSchema = MultipleChoiceProblemSchema.extend({
    serviceId: z.literal(SERVICE_IDS.BASIS),
});

export const ServiceTypeProblemSchema = z
    .discriminatedUnion("serviceId", [
        WritingInputProblemSchema,
        GrammarMultipleChoiceProblemSchema,
        BasisProblemSchema,
    ])
    .readonly();

export type ServiceTypeProblem = z.infer<typeof ServiceTypeProblemSchema>;

// export const PatternSchema = baseProblemSchema.extend({
//   type: z.literal("pattern"),
//   title: z.string(),
//   description: z.string(),
//   examples: z.array(z.object({ en: z.string(), jp: z.string() })),
//   problemIds: z.array(z.string()),
// });

// export type Pattern = z.infer<typeof PatternSchema>;
