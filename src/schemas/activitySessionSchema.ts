import { z } from "zod";
import { integerNonNegative } from "@/schemas/utils/numbers";
import { ServiceIdEnum } from "@/constants/serviceIds";
import { ProblemResultTypeEnum } from "@/constants/problemResultType";
import { GOAL_STATUS, GoalStatusEnum } from "@/constants/sessionConstants";
import { SESSION_TYPES } from "@/constants/clientSide/sessions/sessions";
import { ProgressDetailSchema } from "./progressDetailSchema";

const UserInputSchema = z.object({
    inputs: z.array(
        z.object({
            input: z.string().default(""), // TODO
            result: ProblemResultTypeEnum,
        })
    ).default([]),
    attemptedAt: z.date().default(() => new Date()),
});

const ProblemHistorySchema = z.object({
    serviceId: ServiceIdEnum,
    categoryId: z.string().default("x"), // なんか "none" だと変な感じするので optional で値が存在しないときは特殊な値としてxを適用
    stepId: z.string().default("x"), // this property is optional && default value is "x"; means null here.
    problemId: z.string(),
    correctAttempts: integerNonNegative().default(0), // セッション中にユーザは何回も同じ問題に正解するまで取り組んでいい、また、正解していても取り組める、最後の正誤判定結果が上書きされるようになっているのでそこは注意
    incorrectAttempts: integerNonNegative().default(0),
    problemAttempts: z.array(UserInputSchema).default([]),
    lastResult: ProblemResultTypeEnum,
    memo: z.string().max(100).default(""), // for improving UX
});

const SessionAttemptSchema = z.object({
    attemptId: z.string(), // 自作ID生成ユーティリティ適用
    startAt: z.date(),
    endAt: z.date().default(new Date(0)), // 中断時・完了してないときはデフォルト値として特殊な値 new Date(0)としてハンドリング
    problems: z.array(ProblemHistorySchema),
});

// ただ見かけて試しただけのコード:
// export const exschema = ProblemHistorySchema.keyof().Values;

const GoalActivitySessionSchema = z.object({
    sessionId: z.string(),
    sessionType: z.literal(SESSION_TYPES.GOAL),
    goalId: z.string(), // goalセッションに必須
    categoryId: z.string().default("x"), // this property is optional && default value is "x"; means null here.
    stepId: z.string().default("x"), // this property is optional && default value is "x"; means null here.
    progressDetails: ProgressDetailSchema, // 進捗データ
    attempts: z.array(SessionAttemptSchema).default([]),
    startTime: z.date(), // セッション開始時刻
    lastUpdatedAt: z.date(), // 最終更新時刻
    status: GoalStatusEnum.default(GOAL_STATUS.NOT_STARTED),
});

// ServiceActivitySessionSchema（サービス用セッション）は変更なし
const ServiceActivitySessionSchema = z.object({
    sessionId: z.string(),
    sessionType: z.literal(SESSION_TYPES.SERVICE),
    serviceId: z.string(),
    categoryId: z.string().default("x"),
    stepId: z.string().default("x"),
    progressCount: integerNonNegative(),
    totalTargetCount: integerNonNegative(),
    correctAnswerRate: z.number().min(0).max(100),
    score: integerNonNegative(),
    startTime: z.date(),
    lastUpdatedAt: z.date(),
});

// Goal と Service を統合
export const ActivitySessionSchema = z.discriminatedUnion("sessionType", [
    GoalActivitySessionSchema,
    ServiceActivitySessionSchema,
]);

export type ActivitySession = z.infer<typeof ActivitySessionSchema>;
