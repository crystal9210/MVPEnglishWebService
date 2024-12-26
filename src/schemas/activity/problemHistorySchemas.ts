/**
 * Schema definition file to absorb differences when storing historical data on the server side, etc.
 */
import { z } from "zod";
import { integerNonNegative } from "@/schemas/utils/numbers";
import { DateSchema } from "../utils/dates";
import { UserInputSchema } from "./userInputSchemas";
import { ServiceIdEnum, NA_PATH_ID } from "@/constants/serviceIds";

/**
 * Schema of memo for additional info to a specific problem.
 * @property {string} text - Memo text content (max 200 characters).
 * @property {Date} createdAt - Timestamp of when the memo was created.
 * @example
 * {
 *   text: "This is a sample memo.",
 *   createdAt: new Date("2024-12-25T12:00:00.000Z"),
 * }
 */
const MemoSchema = z.object({
    text: z.string().max(200), // Memo text content (max 200 characters).
    createdAt: z.date(),       // Timestamp of when the memo was created.
});

/**
 * Schema for storing memos related to a problem (max 3 memos).
 * @property {Memo[]} memos - Array of memos (max 3).
 * @example
 * {
 *   memos: [
 *     { text: "This problem was tricky.", createdAt: new Date("2024-12-25T12:00:00.000Z") },
 *     { text: "I need to review this concept.", createdAt: new Date("2024-12-25T12:30:00.000Z") },
 *   ],
 * }
 */
export const ProblemMemoSchema = z.object({
    memos: z.array(MemoSchema).max(3), // Array of memos (max 3).
});

/**
 * @property {Date} attemptedAt - Timestamp of when the attempt was made.
 * @property {number} spentTime - Time spent on the attempt in milliseconds.
 * @property {object|undefined} userInput - User's input for the attempt. Can be undefined if no input was given.
 * @property {boolean} isCorrect - Whether the attempt was correct or not.
 * @example
 * {
 *   attemptedAt: new Date("2024-12-25T12:15:00.000Z"),
 *   spentTime: 300000,
 *   userInput: { input: [{ value: "answer", isCorrect: true, timeSpent: 1500 }], result: "CORRECT" },
 *   isCorrect: true,
 * }
 */
const ProblemAttemptSchema = z.object({
  attemptedAt: DateSchema,         // Timestamp of when the attempt was made.
  spentTime: integerNonNegative(), // Time spent on the attempt in milliseconds.
  userInput: UserInputSchema.optional(), // User's input for the attempt. Can be undefined if no input was given.
  isCorrect: z.boolean(),            // Whether the attempt was correct or not.
});

/**
 * @property {string} problemId - ID of the problem.
 * @property {string} serviceId - ID of the service related to the problem.
 * @property {string} categoryId - ID of the category of the problem.
 * @property {string} stepId - ID of the step of the problem.
 * @property {ProblemAttempt[]} attempts - Array of attempts for this problem in the session.
 * @example
 * {
 *   problemId: "problem123",
 *   serviceId: "serviceABC",
 *   categoryId: "categoryX",
 *   stepId: "stepY",
 *   attempts: [
 *     {
 *       attemptedAt: new Date("2024-12-25T12:20:00.000Z"),
 *       spentTime: 200000,
 *       userInput: { input: [{ value: "user answer", isCorrect: true, timeSpent: 2000 }], result: "CORRECT" },
 *       isCorrect: true,
 *     },
 *   ],
 * }
 */
const SessionProblemHistorySchema = z.object({
  problemId: z.string(),   // ID of the problem.
  serviceId: z.string(),   // ID of the service related to the problem.
  categoryId: z.string(),  // ID of the category of the problem.
  stepId: z.string(),      // ID of the step of the problem.
  attempts: z.array(ProblemAttemptSchema), // Array of attempts for this problem in the session.
});

/**
 * @property {string} sessionId - ID of the session.
 * @property {string} sessionType - Type of the session (e.g., "SERVICE", "GOAL").
 * @property {Date} startAt - Timestamp of when the session started.
 * @property {Date} endAt - Timestamp of when the session ended.
 * @property {number} spentTime - Total time spent in the session in milliseconds.
 * @property {string} feedback - User's feedback on the session (max 50 characters).
 * @property {number} correctAnswerRate - Correct answer rate for the session.
 * @property {number} totalAnsweredCount - Number of problems the user attempted in the session.
 * @property {number} correctAnswerCount - Number of problems the user correctly answered during the session.
 * @property {string[]} problemIds - Array of Problem IDs the user attempted.
 * @property {ServiceIdEnum} serviceId - Service ID the user attempted.
 * @property {string} categoryId - Category ID the user attempted.
 * @property {string} stepId - Step ID the user attempted.
 * @example
 * {
 *   sessionId: "session123",
 *   sessionType: "SERVICE",
 *   startAt: new Date("2024-12-25T12:00:00.000Z"),
 *   endAt: new Date("2024-12-25T13:00:00.000Z"),
 *   spentTime: 3600000,
 *   feedback: "Good session.",
 *   correctAnswerRate: 80,
 *   totalAnsweredCount: 10,
 *   correctAnswerCount: 8,
 *   problemIds: ["problem1", "problem2", "problem3"],
 *   serviceId: "serviceABC",
 *   categoryId: "categoryX",
 *   stepId: "stepY",
 * }
 */
const SessionSummarySchema = z.object({
    sessionId: z.string(),       // ID of the session.
    sessionType: z.string(),    // Type of the session (e.g., "SERVICE", "GOAL"). Consider using Enum for type safety.
    startAt: DateSchema,         // Timestamp of when the session started.
    endAt: DateSchema,           // Timestamp of when the session ended.
    spentTime: integerNonNegative(), // Total time spent in the session in milliseconds.
    feedback: z.string().max(50),  // User's feedback on the session (max 50 characters).
    correctAnswerRate: z.number().min(0).max(100).default(0), // Correct answer rate for session.
    totalAnsweredCount: integerNonNegative().default(0), // Number of problems the user attempted in the session.
    correctAnswerCount: integerNonNegative().default(0), // Number of problems the user correctly answered during the session.
    problemIds: z.array(z.string()).default([]), // Array of Problem IDs the user attempted.
    serviceId: ServiceIdEnum, // Service ID the user attempted.
    categoryId: z.string().default(NA_PATH_ID), // Category ID the user attempted.
    stepId: z.string().default(NA_PATH_ID), // Step ID the user attempted.
});

/**
 * @property {SessionProblemHistory[]} problems - Array of problem histories within the session.
 * @example
 * {
 *   problems: [
 *     {
 *       problemId: "problem123",
 *       serviceId: "serviceABC",
 *       categoryId: "categoryX",
 *       stepId: "stepY",
 *       attempts: [
 *         {
 *           attemptedAt: new Date("2024-12-25T12:20:00.000Z"),
 *           spentTime: 200000,
 *           userInput: { input: [{ value: "user answer", isCorrect: true, timeSpent: 2000 }], result: "CORRECT" },
 *           isCorrect: true,
 *         },
 *       ],
 *     },
 *   ],
 * }
 */
const SessionDetailsSchema = z.object({
    problems: z.array(SessionProblemHistorySchema), // Array of problem histories within the session.
});

/**
 * Schema for activity session history, combining summary and details.
 * @property {SessionSummary} summary - Summary information of the session.
 * @property {SessionDetails} details - Detailed information of the session.
 * @example
 * {
 *   summary: {
 *     sessionId: "session123",
 *     sessionType: "SERVICE",
 *     startAt: new Date("2024-12-25T12:00:00.000Z"),
 *     endAt: new Date("2024-12-25T13:00:00.000Z"),
 *     spentTime: 3600000,
 *     feedback: "Good session.",
 *     correctAnswerRate: 80,
 *     totalAnsweredCount: 10,
 *     correctAnswerCount: 8,
 *     problemIds: ["problem1", "problem2", "problem3"],
 *     serviceId: "serviceABC",
 *     categoryId: "categoryX",
 *     stepId: "stepY",
 *   },
 *   details: {
 *     problems: [
 *       {
 *         problemId: "problem123",
 *         serviceId: "serviceABC",
 *         categoryId: "categoryX",
 *         stepId: "stepY",
 *         attempts: [
 *           {
 *             attemptedAt: new Date("2024-12-25T12:20:00.000Z"),
 *             spentTime: 200000,
 *             userInput: { input: [{ value: "user answer", isCorrect: true, timeSpent: 2000 }], result: "CORRECT" },
 *             isCorrect: true,
 *           },
 *         ],
 *       },
 *     ],
 *   },
 * }
 */
export const ActivitySessionHistorySchema = z.object({
    summary: SessionSummarySchema,   // Summary information of the session.
    details: SessionDetailsSchema,   // Detailed information of the session.
});

/**
 * Type representing a memo related to a specific problem.
 * @example
 * const example: ProblemMemo = {
 *   memos: [
 *     { text: "This is a memo.", createdAt: new Date("2024-12-25T12:00:00.000Z") }
 *   ]
 * };
 */
export type ProblemMemo = z.infer<typeof ProblemMemoSchema>;

/**
 * Type representing the complete activity session history.
 * @example
 * const example: ActivitySessionHistory = {
 *   summary: {
 *     sessionId: "session123",
 *     sessionType: "SERVICE",
 *     startAt: new Date("2024-12-25T12:00:00.000Z"),
 *     endAt: new Date("2024-12-25T13:00:00.000Z"),
 *     spentTime: 3600000,
 *     feedback: "Good session.",
 *     correctAnswerRate: 80,
 *     totalAnsweredCount: 10,
 *     correctAnswerCount: 8,
 *     problemIds: ["problem1", "problem2"],
 *     serviceId: "serviceABC",
 *     categoryId: "categoryX",
 *     stepId: "stepY",
 *   },
 *   details: {
 *     problems: [
 *       {
 *         problemId: "problem123",
 *         serviceId: "serviceABC",
 *         categoryId: "categoryX",
 *         stepId: "stepY",
 *         attempts: [
 *           {
 *             attemptedAt: new Date("2024-12-25T12:20:00.000Z"),
 *             spentTime: 200000,
 *             userInput: { input: [{ value: "user answer", isCorrect: true, timeSpent: 2000 }], result: "CORRECT" },
 *             isCorrect: true,
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * };
 */
export type ActivitySessionHistory = z.infer<typeof ActivitySessionHistorySchema>;

/**
 * Type representing a summary of a session.
 * @example
 * const example: SessionSummary = {
 *   sessionId: "session123",
 *   sessionType: "SERVICE",
 *   startAt: new Date("2024-12-25T12:00:00.000Z"),
 *   endAt: new Date("2024-12-25T13:00:00.000Z"),
 *   spentTime: 3600000,
 *   feedback: "Good session.",
 *   correctAnswerRate: 80,
 *   totalAnsweredCount: 10,
 *   correctAnswerCount: 8,
 *   problemIds: ["problem1", "problem2"],
 *   serviceId: "serviceABC",
 *   categoryId: "categoryX",
 *   stepId: "stepY",
 * };
 */
export type SessionSummary = z.infer<typeof SessionSummarySchema>;

/**
 * Type representing detailed session information.
 * @example
 * const example: SessionDetails = {
 *   problems: [
 *     {
 *       problemId: "problem123",
 *       serviceId: "serviceABC",
 *       categoryId: "categoryX",
 *       stepId: "stepY",
 *       attempts: [
 *         {
 *           attemptedAt: new Date("2024-12-25T12:20:00.000Z"),
 *           spentTime: 200000,
 *           userInput: { input: [{ value: "user answer", isCorrect: true, timeSpent: 2000 }], result: "CORRECT" },
 *           isCorrect: true,
 *         }
 *       ]
 *     }
 *   ]
 * };
 */
export type SessionDetails = z.infer<typeof SessionDetailsSchema>;
