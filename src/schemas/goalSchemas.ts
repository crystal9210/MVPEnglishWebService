import { z } from 'zod';
import { integerNonNegative } from './utils/numbers';
import { GoalStatusEnum, PROGRESS_MODES } from '@/constants/sessions/sessions';
import { GoalTermTypeEnum } from '@/constants/sessions/sessions';
import { NA_PATH_ID } from '@/constants/serviceIds';

/**
 * 'goal' schema and the 'criteria' schemas used in the 'goal' schema.
 */

/**
 * criteria schemas:
 */

const IterationCriteriaSchema = z.object({
  mode: z.literal(PROGRESS_MODES.ITERATION),
  details: z.object({
    problemSetIds: z.array(z.string()).min(1),
    requiredIterations: integerNonNegative(),
  }),
});

const ScoreCriteriaSchema = z.object({
  mode: z.literal(PROGRESS_MODES.SCORE),
  details: z.object({
    serviceId: z.string().default(NA_PATH_ID),
    categoryId: z.string().default(NA_PATH_ID),
    stepId: z.string().default(NA_PATH_ID),
    minimumScore: integerNonNegative(),
  }),
});

const CountCriteriaSchema = z.object({
  mode: z.literal(PROGRESS_MODES.COUNT),
  details: z.object({
    serviceId: z.string().default(NA_PATH_ID),
    categoryId: z.string().default(NA_PATH_ID),
    stepId: z.string().default(NA_PATH_ID),
    requiredCount: integerNonNegative(),
  }),
});

const TimeCriteriaSchema = z.object({
  mode: z.literal(PROGRESS_MODES.TIME),
  details: z.object({
    serviceId: z.string().default(NA_PATH_ID),
    categoryId: z.string().default(NA_PATH_ID),
    stepId: z.string().default(NA_PATH_ID),
    requiredTime: integerNonNegative(), // seconds
  }),
});

const CriteriaSchema = z.discriminatedUnion("mode", [
  IterationCriteriaSchema,
  ScoreCriteriaSchema,
  CountCriteriaSchema,
  TimeCriteriaSchema,
]);

export type Criteria = z.infer<typeof CriteriaSchema>;

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
    termType: GoalTermTypeEnum,
    criteria: CriteriaSchema,
    targetProblems: z.number().int().positive(), // TODO
    currentProgress: z.number().int().nonnegative(),
    createdAt: z.date(),
    updatedAt: z.date(),
    status: GoalStatusEnum,
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
