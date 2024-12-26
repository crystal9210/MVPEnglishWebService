import { z } from "zod";
import { integerNonNegative } from "./utils/numbers";
import { GoalPeriodTypeEnum, UserRankTypeEnum } from "@/constants/userStatisticTypes";

// --- Collections structure in firestore ---
// users/{userId}/
//     statistics/
//         session/
//             daily/
//                 {date}: SessionStatistics
//             weekly/
//                 {weekStartDate}: SessionStatistics
//             monthly/
//                 {month}: SessionStatistics
//         goal/
//             daily/
//                 {date}: GoalStatistics
//             weekly/
//                 {weekStartDate}: GoalStatistics
//             monthly/
//                 {month}: GoalStatistics
//         problem/
//             daily/
//                 {date}: ProblemStatistics
//             weekly/
//                 {weekStartDate}: ProblemStatistics
//             monthly/
//                 {month}: ProblemStatistics
//         userActivity/
//             daily/
//                 {date}: UserActivity
//             weekly/
//                 {weekStartDate}: UserActivity
//             monthly/
//                 {month}: UserActivity
//         summary: StatisticsSummary

/**
 * StatisticsSchemas module
 *
 * This module defines the schemas for various user statistics, including session statistics,
 * goal statistics, problem statistics, and overall user activity. Each schema includes
 * example data to aid developers in understanding the structure and content of the data.
 *
 * Example Usage:
 * const sessionStats: SessionStatistics = {
 *   period: "monthly",
 *   totalSessions: 20,
 *   totalSpentTime: 7200000,
 *   averageSpentTime: 360000,
 *   averageCorrectRate: 85,
 *   goalsAchieved: 5,
 *   createdAt: new Date("2024-12-01T00:00:00.000Z"),
 *   updatedAt: new Date("2024-12-31T23:59:59.999Z"),
 * };
 */

/**
 * Schema for Session Statistics
 *
 * @example
 * ```typescript
 * {
 *   period: "monthly",
 *   totalSessions: 20,
 *   totalSpentTime: 7200000,
 *   averageSpentTime: 360000,
 *   averageCorrectRate: 85,
 *   goalsAchieved: 5,
 *   createdAt: new Date("2024-12-01T00:00:00.000Z"),
 *   updatedAt: new Date("2024-12-31T23:59:59.999Z"),
 * }
 * ```
 */
export const SessionStatisticsSchema = z.object({
    period: GoalPeriodTypeEnum,
    totalSessions: integerNonNegative(),
    totalSpentTime: integerNonNegative(), // >> total time spent in milliseconds
    averageSpentTime: integerNonNegative(), // average time per session's problem in milliseconds
    averageCorrectRate: z.number().min(0).max(100), // percentage
    goalsAchieved: integerNonNegative(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type SessionStatistics = z.infer<typeof SessionStatisticsSchema>;

/**
 * Schema for Goal Statistics
 *
 * @example
 * ```typescript
 * {
 *   period: "weekly",
 *   totalGoals: 10,
 *   goalsCompleted: 7,
 *   completionRate: 70,
 *   averageProgress: 75,
 *   createdAt: new Date("2024-12-01T00:00:00.000Z"),
 *   updatedAt: new Date("2024-12-31T23:59:59.999Z"),
 * }
 * ```
 */
export const GoalStatisticsSchema = z.object({
    period: GoalPeriodTypeEnum,
    totalGoals: integerNonNegative(),
    goalsCompleted: integerNonNegative(),
    completionRate: z.number().min(0).max(100), // Percentage
    averageProgress: z.number().min(0).max(100), // Percentage
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type GoalStatistics = z.infer<typeof GoalStatisticsSchema>;

/**
 * Schema for Problem Statistics
 *
 * @example
 * ```typescript
 * {
 *   period: "daily",
 *   totalProblemsAttempted: 50,
 *   totalCorrectAnswers: 40,
 *   correctAnswerRate: 80,
 *   averageSpentTime: 30000,
 *   mostFrequentProblems: ["problem1", "problem2", "problem3"],
 *   createdAt: new Date("2024-12-01T00:00:00.000Z"),
 *   updatedAt: new Date("2024-12-31T23:59:59.999Z"),
 * }
 * ```
 */
export const ProblemStatisticsSchema = z.object({
    period: GoalPeriodTypeEnum,
    totalProblemsAttempted: integerNonNegative(),
    totalCorrectAnswers: integerNonNegative(),
    correctAnswerRate: z.number().min(0).max(100), // Percentage
    averageSpentTime: integerNonNegative(), // Average time per problem in milliseconds
    mostFrequentProblems: z.array(z.string()).max(10), // Top 10 problems
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type ProblemStatistics = z.infer<typeof ProblemStatisticsSchema>;

/**
 * Schema for User Activity Statistics
 *
 * @example
 * ```typescript
 * {
 *   period: "monthly",
 *   totalActions: 500,
 *   activeDays: 25,
 *   averageDailyActions: 20,
 *   createdAt: new Date("2024-12-01T00:00:00.000Z"),
 *   updatedAt: new Date("2024-12-31T23:59:59.999Z"),
 * }
 * ```
 */
export const UserActivitySchema = z.object({
    period: GoalPeriodTypeEnum,
    totalActions: integerNonNegative(),
    activeDays: integerNonNegative(),
    averageDailyActions: integerNonNegative(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type UserActivity = z.infer<typeof UserActivitySchema>;

/**
 * Schema for Statistics Summary
 *
 * @example
 * ```typescript
 * {
 *   userId: "user123",
 *   lastUpdated: new Date("2024-12-31T23:59:59.999Z"),
 *   createdAt: new Date("2024-01-01T00:00:00.000Z"),
 * }
 * ```
 */
export const StatisticsSummarySchema = z.object({
    userId: z.string(),
    lastUpdated: z.date(),
    createdAt: z.date(),
});

export type StatisticsSummary = z.infer<typeof StatisticsSummarySchema>;


/**
 * Schema for User Rank
 *
 * @example
 * ```typescript
 * {
 *   rank: "Gold",
 *   calculatedAt: new Date("2024-12-31T23:59:59.999Z"),
 * }
 * ```
 */
export const UserRankSchema = z.object({
    rank: UserRankTypeEnum,
    calculatedAt: z.date(),
    totalPoints: integerNonNegative(),
});

export type UserRank = z.infer<typeof UserRankSchema>;

/**
 * Combined Statistics Schema
 *
 * @example
 * ```typescript
 * {
 *   sessionStatistics: { ... },
 *   goalStatistics: { ... },
 *   problemStatistics: { ... },
 *   userActivity: { ... },
 *   summary: { ... },
 * }
 * ```
 */
export const CombinedStatisticsSchema = z.object({
    sessionStatistics: SessionStatisticsSchema,
    goalStatistics: GoalStatisticsSchema,
    problemStatistics: ProblemStatisticsSchema,
    userActivity: UserActivitySchema,
    summary: StatisticsSummarySchema,
    userRank: UserRankSchema,
});

export type CombinedStatistics = z.infer<typeof CombinedStatisticsSchema>;
