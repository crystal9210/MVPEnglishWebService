import { z } from "zod";
import { integerNonNegative } from "@/schemas/utils/numbers";
import { NA_PATH_ID, ServiceIdEnum } from "@/constants/serviceIds";
import { ProblemResultTypeEnum } from "@/constants/problemResultType";
import { SESSION_STATUS, SessionStatusEnum } from "@/constants/sessions/sessions";
import { SESSION_TYPES } from "@/constants/sessions/sessions";
import { ProgressDetailSchema } from "../progressDetailSchema";
import { DateSchema } from "../utils/dates";
import { createSessionSchema } from "./problemHistorySchemas"; // >> func
import { UserInputSchema } from "./userInputSchemas";
// import { sessionattemp}

// 概要としての情報を持たせることで情報のフィルタリング >> パフォ向上
const ProblemHistorySchema = z.object({
    serviceId: ServiceIdEnum.default(NA_PATH_ID),
    categoryId: z.string().default(NA_PATH_ID),
    stepId: z.string().default(NA_PATH_ID),
    problemId: z.string().default(NA_PATH_ID),
    correctAttempts: integerNonNegative().default(0), // セッション中にユーザは何回も同じ問題に正解するまで取り組んでいい、また、正解していても取り組める、最後の正誤判定結果が上書きされるようになっているのでそこは注意
    incorrectAttempts: integerNonNegative().default(0),
    problemAttempts: z.array(UserInputSchema).default([]),
    lastResult: ProblemResultTypeEnum,
    memo: z.string().max(100).default(""), // for improving UX
});

const SessionAttemptSchema = z.object({
    attemptId: z.string(), // 自作ID生成ユーティリティ適用
    startAt: z.date(),
    endAt: DateSchema,
    problems: z.array(ProblemHistorySchema),
});

// ただ見かけて試しただけのコード:
// export const exschema = ProblemHistorySchema.keyof().Values;

const GoalActivitySessionSchema = z.object({
    ...createSessionSchema(SESSION_TYPES.GOAL).shape,
    goalId: z.string(), // goalセッションに必須
    categoryId: z.string().default(NA_PATH_ID),
    stepId: z.string().default(NA_PATH_ID),
    progressDetails: ProgressDetailSchema, // 進捗データ
    attempts: z.array(SessionAttemptSchema).default([]),
    startTime: z.date(), // セッション開始時刻
    lastUpdatedAt: z.date(), // 最終更新時刻
    status: SessionStatusEnum.default(SESSION_STATUS.NOT_STARTED),
});

// ServiceActivitySessionSchema（サービス用セッション）は変更なし
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

// GoalとServiceを統合 >> idbのオブジェクトストア: 統一的に管理・効率化
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

export type GoalSessionHistoryItem = z.infer<typeof GoalSessionHistoryItemSchema>;
export type ServiceSessionHistoryItem = z.infer<typeof ServiceSessionHistoryItemSchema>;
export type UserHistoryItem = z.infer<typeof UserHistoryItemSchema>;

export type ProblemHistory = z.infer<typeof ProblemHistorySchema>;
export type DetailedHistory = z.infer<typeof DetailedHistorySchema>;
