import { z } from "zod";
import { integerNonNegative } from "@/schemas/utils/numbers";
import { NA_PATH_ID, ServiceIdEnum } from "@/constants/serviceIds";
import { ProblemResultTypeEnum } from "@/constants/problemResultType";
import { SESSION_STATUS, SessionStatusEnum } from "@/constants/sessions/sessions";
import { SESSION_TYPES } from "@/constants/sessions/sessions";
import { DateSchema, OptionalDateSchema } from "../utils/dates";
import { createSessionSchema } from "./problemHistorySchemas"; // >> func
import { UserInputSchema } from "./userInputSchemas";
import { ProgressDetailByCriteriaSchema } from "../progressDetailSchema";

/**
 * Schema for recording the history of user interactions with problems.
 * Maintains summary information to enhance data filtering and performance.
 */
const ProblemHistorySchema = z.object({
    serviceId: ServiceIdEnum.default(NA_PATH_ID),
    categoryId: z.string().default(NA_PATH_ID),
    stepId: z.string().default(NA_PATH_ID),
    problemId: z.string().default(NA_PATH_ID),
    correctAttempts: integerNonNegative().default(0), // >> user can try the same problem any time in an activity session.
    incorrectAttempts: integerNonNegative().default(0),
    problemAttempts: z.array(UserInputSchema).default([]),
    lastResult: ProblemResultTypeEnum,
    spentTime: integerNonNegative().default(0), // >> specify the total time the user used in trying the specific problem.
    memo: z.string().max(100).default(""), // for improving UX
});

/**
 * Schema for a single attempt within a session.
 */
const SessionAttemptSchema = z.object({
    attemptId: z.string(),
    startAt: DateSchema,
    endAt: OptionalDateSchema, // >> use epoch time by default instead of using 'optional()' .
    problems: z.array(ProblemHistorySchema).default([]),
});

export type SessionAttempt = z.infer<typeof SessionAttemptSchema>;


/**
 * Schema for goal-oriented activity sessions.
 * Manages progress details and attempts related to achieving a specific goal.
 */
const GoalActivitySessionSchema = z.object({
    ...createSessionSchema(SESSION_TYPES.GOAL).shape,
    goalId: z.string(),
    progressDetails: ProgressDetailByCriteriaSchema,
    attempts: z.array(SessionAttemptSchema).default([]),
    startAt: z.date(),
    lastUpdatedAt: z.date(),
    endAt: z.date(),
    status: SessionStatusEnum.default(SESSION_STATUS.NOT_STARTED),
});


/**
 * Schema for service-oriented activity sessions.
 * Maintains information related to problem sets and progress counts.
 */
const ServiceActivitySessionSchema = z.object({
    ...createSessionSchema(SESSION_TYPES.SERVICE).shape,
    serviceId: z.string(),
    categoryId: z.string().default(NA_PATH_ID),
    stepId: z.string().default(NA_PATH_ID),
    progressCount: integerNonNegative(),
    totalTargetCount: integerNonNegative(),
    correctAnswerRate: z.number().min(0).max(100),
    score: integerNonNegative(),
    startTime: z.date(),
    lastUpdatedAt: z.date(),
});

/**
 * Unified schema for all activity sessions.
 * Discriminates between Goal and Service session types.
 */
export const ActivitySessionSchema = z.discriminatedUnion("sessionType", [
    GoalActivitySessionSchema,
    ServiceActivitySessionSchema,
]);

// --- sample code(usage) ---
// function processActivitySessions(sessions: ActivitySession[]) {
//     sessions.forEach(session => {
//         if (session.sessionType === SESSION_TYPES.GOAL) {
//             // session は GoalActivitySession 型として扱える
//             console.log(session.goalId); // GoalActivitySession のプロパティに安全にアクセス
//         } else if (session.sessionType === SESSION_TYPES.SERVICE) {
//             // session は ServiceActivitySession 型として扱える
//             console.log(session.serviceId); // ServiceActivitySession のプロパティに安全にアクセス
//         }
//     });
// }

export type ActivitySession = z.infer<typeof ActivitySessionSchema>;
export type GoalActivitySession = z.infer<typeof GoalActivitySessionSchema>;
export type ServiceActivitySession = z.infer<typeof ServiceActivitySessionSchema>;


// ただ見かけて試しただけのコード:
// export const exschema = ProblemHistorySchema.keyof().Values;
