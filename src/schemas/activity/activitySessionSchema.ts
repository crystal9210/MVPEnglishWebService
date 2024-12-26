import { z } from "zod";
import { integerNonNegative } from "@/schemas/utils/numbers";
import { NA_PATH_ID, ServiceIdEnum } from "@/constants/serviceIds";
import { ProblemResultTypeEnum } from "@/constants/problemResultType";
import { SESSION_STATUS, SessionStatusEnum } from "@/constants/sessions/sessions";
import { SESSION_TYPES, SessionType } from "@/constants/sessions/sessions";
import { DateSchema, OptionalDateSchema } from "../utils/dates";
import { UserInputSchema } from "./userInputSchemas";
import { ProgressDetailByCriteriaSchema } from "./progressDetailSchema";


/**
 * createSessionSchema function:
 * generate basic schema of the activity session based on session type field value.
 * @param sessionType
 * @returns 'session' schema
 */
export const createSessionSchema = <T extends SessionType>(sessionType: T) => {
    return z.object({
        sessionId: z.string().uuid("Invalid session ID format.").default(NA_PATH_ID),
        sessionType: z.literal(sessionType), // discriminator of session types
        startAt: z.date(),
        lastUpdatedAt: z.date(), // >> this field is used as reference info when the user unexpectedly terminates a session.
        endAt: z.date(),
        spentTime: integerNonNegative().min(0, { message: " Time must be non-negative" }), // i.e. how long the user spent time to complete the session.
        attemptedNum: integerNonNegative(), // >> how many times user tried the problem in the session.
        feedback: z.string().max(200).default(""), // i.e. comments about the session activity (ex: whether the user is well done in the session or not. ) by the user.
    });
};

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
export const SessionAttemptSchema = z.object({
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
export const GoalActivitySessionSchema = z.object({
    ...createSessionSchema(SESSION_TYPES.GOAL).shape,
    goalId: z.string(),
    progressDetails: ProgressDetailByCriteriaSchema,
    attempts: z.array(SessionAttemptSchema).default([]),
    status: SessionStatusEnum.default(SESSION_STATUS.NOT_STARTED),
});


/**
 * Schema for service-oriented activity sessions.
 * Maintains information related to problem sets and progress counts.
 */
export const ServiceActivitySessionSchema = z.object({
    ...createSessionSchema(SESSION_TYPES.SERVICE).shape,
    serviceId: z.string(),
    categoryId: z.string().default(NA_PATH_ID),
    stepId: z.string().default(NA_PATH_ID),
    problemCount: integerNonNegative(),
    correctAnswerRate: z
        .number()
        .min(0, { message: "Correct answer rate must be at least 0%." })
        .max(100, { message: "Correct answer rate cannot exceed 100%." }),
    progressCount: integerNonNegative(),
    totalTargetCount: integerNonNegative(),
    score: integerNonNegative().min(0, { message: "Score must be non-negative." }),
    maxScore: integerNonNegative().min(0, { message: "Max score must be non-negative." }),
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
