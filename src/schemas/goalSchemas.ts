import { z } from 'zod';
import { integerNonNegative } from './utils/numbers';

// TODO
// Criteria schemas
const IterationCriteriaSchema = z.object({
  mode: z.literal('iteration'),
  details: z.object({
    problemSetIds: z.array(z.string()).min(1),
    requiredIterations: integerNonNegative(),
  }),
});

const ScoreCriteriaSchema = z.object({
  mode: z.literal('score'),
  details: z.object({
    serviceId: z.string(),
    categoryId: z.string().nullable(),
    stepId: z.string().nullable(),
    minimumScore: z.number().int().positive(),
  }),
});

const CountCriteriaSchema = z.object({
  mode: z.literal('count'),
  details: z.object({
    serviceId: z.string(),
    categoryId: z.string().nullable(),
    stepId: z.string().nullable(),
    requiredCount: z.number().int().positive(),
  }),
});

const TimeCriteriaSchema = z.object({
  mode: z.literal('time'),
  details: z.object({
    serviceId: z.string(),
    categoryId: z.string().nullable(),
    stepId: z.string().nullable(),
    requiredTime: z.number().int().positive(), // seconds
  }),
});

const CriteriaSchema = z.union([
  IterationCriteriaSchema,
  ScoreCriteriaSchema,
  CountCriteriaSchema,
  TimeCriteriaSchema,
]);

// Per period targets schema
const PerPeriodTargetsSchema = z.object({
  enabled: z.boolean().default(false),
  period: z.enum(['daily', 'weekly']).optional(),
  targetRate: z.number().min(0).max(100).optional(), // percentage
}).refine(data => {
  if (!data.enabled) return true;
  return data.period !== undefined && data.targetRate !== undefined;
}, {
  message: 'When enabled is true, period and targetRate must be specified.',
});


export const GoalSchema = z.object({
    id: z.string(),
    termType: z.enum(["short", "medium", "long"]),
    criteria: CriteriaSchema,
    targetQuestions: z.number().int().positive(), // TODO
    currentProgress: z.number().int().nonnegative(),
    createdAt: z.date(),
    updatedAt: z.date(),
    status: z.enum(["active", "failed", "good clear", "best clear", "archived"]),
    // TODO
    iterateCount: z.number().int().positive().optional(),
    completedIterations: z.number().int().nonnegative().optional(),
    deadlines: z.object({
        reasonableDeadline: z.date(),
        bestDeadline: z.date(),
    }).refine(data => data.bestDeadline <= data.reasonableDeadline, {
        message: 'Best deadline must be on or before reasonable deadline.',
    }),
    perPeriodTargets: PerPeriodTargetsSchema.optional(),
});

export type Goal = z.infer<typeof GoalSchema>;
