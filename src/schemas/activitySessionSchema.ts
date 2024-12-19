import { z } from "zod";
import { integerNonNegative } from "@/schemas/utils/numbers";

// 進捗データスキーマ: criteria のモードに応じて進捗管理
const ProgressDetailSchema = z.union([
    z.object({
        mode: z.literal("iteration"),
        completedIterations: integerNonNegative(), // 完了した繰り返し回数
        totalIterations: integerNonNegative(), // 必要な繰り返し回数
    }),
    z.object({
        mode: z.literal("score"),
        currentScore: integerNonNegative(), // 現在のスコア
        requiredScore: integerNonNegative(), // 必要なスコア
    }),
    z.object({
        mode: z.literal("count"),
        completedCount: integerNonNegative(), // 完了した問題数
        requiredCount: integerNonNegative(), // 必要な問題数
    }),
    z.object({
        mode: z.literal("time"),
        elapsedTime: integerNonNegative(), // 経過時間（秒）
        requiredTime: integerNonNegative(), // 必要な時間（秒）
    }),
]);

// 問題ごとの履歴スキーマ
const ProblemHistorySchema = z.object({
    problemId: z.string(), // 問題ID
    attempts: integerNonNegative().default(0), // 挑戦回数（間違え含む）
    clears: integerNonNegative().default(0), // クリア回数
    lastAttemptAt: z.date().optional(), // 最後に挑戦した日時
    lastClearedAt: z.date().optional(), // 最後にクリアした日時
    memo: z.string().max(50).optional(), // 問題ごとのメモ（最大50文字）
});

// GoalActivitySessionSchema の拡張
const GoalActivitySessionSchema = z.object({
    sessionId: z.string(),
    sessionType: z.literal("goal"),
    goalId: z.string(), // goalセッションに必須
    categoryId: z.string().default("none"),
    stepId: z.string().default("none"),
    progressDetails: ProgressDetailSchema, // 進捗データ
    problemHistories: z.array(ProblemHistorySchema).default([]), // 問題ごとの履歴データ
    progressCount: integerNonNegative(), // 現在の進捗数
    totalTargetCount: integerNonNegative(), // 目標問題数
    correctAnswerRate: z.number().min(0).max(100), // 正解率
    score: integerNonNegative(), // 現在のスコア
    startTime: z.date(), // セッション開始時刻
    lastUpdatedAt: z.date(), // 最終更新時刻
});

// ServiceActivitySessionSchema（サービス用セッション）は変更なし
const ServiceActivitySessionSchema = z.object({
    sessionId: z.string(),
    sessionType: z.literal("service"),
    serviceId: z.string(),
    categoryId: z.string().default("none"),
    stepId: z.string().default("none"),
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
