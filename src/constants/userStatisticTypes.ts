import { z } from "zod";

export const USER_RANK_TYPES = {
    BRONZE: "bronze",
    SILVER: "silver",
    GOLD: "gold",
    PLATINUM: "platinum"
} as const;


export const UserRankTypeEnum = z.enum(
    Object.values(USER_RANK_TYPES) as unknown as [
        typeof USER_RANK_TYPES[keyof typeof USER_RANK_TYPES]
    ]
);

export type UserRankType = z.infer<typeof UserRankTypeEnum>;



export const GOAL_PERIOD_TYPES = {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly"
} as const;


export const GoalPeriodTypeEnum = z.enum(
    Object.values(GOAL_PERIOD_TYPES) as unknown as [
        typeof GOAL_PERIOD_TYPES[keyof typeof GOAL_PERIOD_TYPES]
    ]
);

export type GoalPeriodType = z.infer<typeof GoalPeriodTypeEnum>;


export const PROBLEM_DIFFICULTY_LEVEL_TYPES = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
    VERY_HARD: 4,
    EXTREMELY_HARD: 5
} as const;

export const ProblemDifficultyLevelEnum = z.union([
    z.literal(PROBLEM_DIFFICULTY_LEVEL_TYPES.EASY),
    z.literal(PROBLEM_DIFFICULTY_LEVEL_TYPES.MEDIUM),
    z.literal(PROBLEM_DIFFICULTY_LEVEL_TYPES.HARD),
    z.literal(PROBLEM_DIFFICULTY_LEVEL_TYPES.VERY_HARD),
    z.literal(PROBLEM_DIFFICULTY_LEVEL_TYPES.EXTREMELY_HARD)
]);

export type ProblemDifficultyLevel = z.infer<typeof ProblemDifficultyLevelEnum>;
