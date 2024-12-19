import { z } from "zod";
import { integerNonNegative } from "@/schemas/utils/numbers";
import { ServiceIdEnum } from "@/constants/serviceIds";
import { PROGRESS_MODES } from "@/constants/clientSide/sessions/sessions";

// 共通部分をまとめた型
const BaseProgressDetailSchema = z.object({
    mode: z.literal(PROGRESS_MODES.ITERATION),
});

// ユースケース1: 問題セットベースの繰り返し
const IterationProgressDetailSchema = BaseProgressDetailSchema.extend({
    mode: z.literal(PROGRESS_MODES.ITERATION),
    completedIterations: integerNonNegative(), // 完了した繰り返し回数
    totalIterations: integerNonNegative(), // 必要な繰り返し回数
    problemSetId: z.string(), // 事前に作成された問題セットのID
});

// ユースケース2: スコアベース
const ScoreProgressDetailSchema = BaseProgressDetailSchema.extend({
    mode: z.literal(PROGRESS_MODES.SCORE),
    completedAchievements: integerNonNegative(), // 完了した実績数
    totalAchievements: integerNonNegative(), // 必要な実績数
    targetServiceId: ServiceIdEnum.optional(), // 対象のサービスID
    targetCategoryId: z.string().optional(), // 対象のカテゴリID
    targetStepId: z.string().optional(), // 対象のステップID
    requiredScore: integerNonNegative(), // 必要なスコア
});

// ユースケース3: 正解数ベース
const CountProgressDetailSchema = BaseProgressDetailSchema.extend({
    mode: z.literal(PROGRESS_MODES.COUNT),
    completedAchievements: integerNonNegative(), // 完了した実績数
    totalAchievements: integerNonNegative(), // 必要な実績数
    targetServiceId: ServiceIdEnum.optional(), // 対象のサービスID
    targetCategoryId: z.string().optional(), // 対象のカテゴリID
    targetStepId: z.string().optional(), // 対象のステップID
    requiredCount: integerNonNegative(), // 必要な正解数
});

// 新しい ProgressDetailSchema (Union)
export const ProgressDetailSchema = z.discriminatedUnion("mode", [
    IterationProgressDetailSchema,
    ScoreProgressDetailSchema,
    CountProgressDetailSchema,
]);

export type ProgressDetail = z.infer<typeof ProgressDetailSchema>;
