import { z } from "zod";
import { integerNonNegative } from "@/schemas/utils/numbers";
import { NA_PATH_ID, ServiceIdEnum } from "@/constants/serviceIds";
import { PROGRESS_MODES, ProgressMode } from "@/constants/sessions/sessions";
import { CustomProblemSetSchema } from "@/schemas/customProblemSetSchema";

// カテゴリID・ステップIDペアスキーマ - 複数のカテゴリ指定可能
const CategoryStepPairSchema = z.object({
    categoryId: z.string(),
    stepIds: z.array(z.string()).optional(), // 各カテゴリに属するステップIDの配列
});

const createProgressDetailSchema = <T extends ProgressMode>(progressMode: T) => {
    return z.object({
        mode: z.literal(progressMode),
    });
}

// ユースケース1: 問題セットベースの繰り返し
const IterationProgressDetailSchema = z.object({
    ...createProgressDetailSchema(PROGRESS_MODES.ITERATION).shape,
    completedIterations: integerNonNegative(), // 完了した繰り返し回数
    totalIterations: integerNonNegative(), // 必要な繰り返し回数
    // CustomProblemSetSchemaのshapeオブジェクトのproblemSetIdプロパティにアクセスしそのまま値として格納
    problemSetId: CustomProblemSetSchema.shape.problemSetId, // TODO 参照先との連携 (NOTE:上位層実装)
});

// ユースケース2: スコアベース
const ScoreProgressDetailSchema = z.object({
    ...createProgressDetailSchema(PROGRESS_MODES.SCORE).shape,
    completedAchievements: integerNonNegative(), // 完了した実績数
    totalAchievements: integerNonNegative(), // 必要な実績数
    targetServiceId: ServiceIdEnum.default(NA_PATH_ID), // 対象のサービスID
    targetCategoryStepPairs: z.array(CategoryStepPairSchema).optional(), // 対象のカテゴリIDとステップIDのペア配列
    requiredScore: integerNonNegative(), // 必要なスコア
    currentStore: integerNonNegative(), // 現在のスコア
});

// ユースケース3: 正解数ベース
const CountProgressDetailSchema = z.object({
    ...createProgressDetailSchema(PROGRESS_MODES.COUNT).shape,
    completedAchievements: integerNonNegative(), // 完了した実績数
    totalAchievements: integerNonNegative(), // 必要な実績数
    targetServiceId: ServiceIdEnum.default(NA_PATH_ID), // 対象のサービスID
    targetCategoryStepPairs: z.array(CategoryStepPairSchema).optional(),
    requiredCount: integerNonNegative(), // 目標達成に必要な正解数
    currentCorrectCount: integerNonNegative().default(0),
});


export const ProgressDetailSchema = z.discriminatedUnion("mode", [
    IterationProgressDetailSchema,
    ScoreProgressDetailSchema,
    CountProgressDetailSchema,
]);

export type ProgressDetail = z.infer<typeof ProgressDetailSchema>;


// --- sample code base ---
// import {
//     GoalProgressSessionSchema,
// } from "@/schemas/client/goalProgressSessionSchema";
// import { PROBLEM_RESULT_TYPES } from "@/constants/problemResultType";
// import { PROGRESS_MODES } from "@/constants/clientSide/sessions/sessions";
// import { GoalStatusEnum, GOAL_STATUS } from "@/constants/sessionConstants";

// function updateProgressDetail(session: GoalProgressSessionSchema) {
//     const { progressDetail, attempts, status } = session;

//     if (status === GOAL_STATUS.COMPLETED) {
//         return; // すでに完了している場合は何もしない
//     }
//     if (
//         progressDetail.mode !== PROGRESS_MODES.SCORE &&
//         progressDetail.mode !== PROGRESS_MODES.COUNT
//     ) {
//         return;
//     }
//     let isCompleted = false;
//     // 最後の試行を取得
//     const lastAttempt = attempts[attempts.length - 1];

//     if (!lastAttempt) {
//         return; // 試行が存在しない場合は何もしない
//     }

//     if (progressDetail.mode === PROGRESS_MODES.SCORE) {
//         let newScore = progressDetail.currentScore;

//         for (const problem of lastAttempt.problems) {
//             // サービスID、カテゴリID、ステップIDが一致するか確認
//             const serviceMatch = !progressDetail.targetServiceId || problem.serviceId === progressDetail.targetServiceId;
//             // カテゴリとステップのペアに基づいてフィルタリング
//             const categoryStepMatch = !progressDetail.targetCategoryStepPairs || progressDetail.targetCategoryStepPairs.some(pair => {
//                 const categoryMatch = pair.categoryId === problem.categoryId;
//                 const stepMatch = !pair.stepIds || pair.stepIds.includes(problem.stepId);
//                 return categoryMatch && stepMatch;
//             });

//             if (serviceMatch && categoryStepMatch && problem.lastResult === PROBLEM_RESULT_TYPES.CORRECT) {
//                 // スコアの加算ロジック（必要に応じてカスタマイズ）
//                 newScore += 1; // 例：正解1問につき1点を加算
//             }
//         }

//         // スコアの更新
//         progressDetail.currentScore = newScore;

//         // 達成状況の確認
//         if (progressDetail.currentScore >= progressDetail.requiredScore) {
//             progressDetail.completedAchievements += 1;
//             progressDetail.currentScore = 0; // リセット
//             // 必要に応じて、ここで session.status を更新するなどの処理を追加
//             isCompleted = progressDetail.completedAchievements >= progressDetail.totalAchievements;

//         }
//     } else if (progressDetail.mode === PROGRESS_MODES.COUNT) {
//         let newCount = progressDetail.currentCorrectCount;

//         for (const problem of lastAttempt.problems) {
//             // サービスID、カテゴリID、ステップIDが一致するか確認
//             const serviceMatch = !progressDetail.targetServiceId || problem.serviceId === progressDetail.targetServiceId;
//             const categoryStepMatch = !progressDetail.targetCategoryStepPairs || progressDetail.targetCategoryStepPairs.some(pair => {
//                 const categoryMatch = pair.categoryId === problem.categoryId;
//                 const stepMatch = !pair.stepIds || pair.stepIds.includes(problem.stepId);
//                 return categoryMatch && stepMatch;
//             });

//             if (serviceMatch && categoryStepMatch && problem.lastResult === PROBLEM_RESULT_TYPES.CORRECT) {
//                 newCount += 1;
//             }
//         }

//         progressDetail.currentCorrectCount = newCount;

//         if (progressDetail.currentCorrectCount >= progressDetail.requiredCount) {
//             progressDetail.completedAchievements += 1;
//             progressDetail.currentCorrectCount = 0; // リセット

//             isCompleted = progressDetail.completedAchievements >= progressDetail.totalAchievements;
//         }
//     }
//     // 最終判定
//     if (isCompleted) {
//         session.status = GOAL_STATUS.COMPLETED;
//     }

//     session.lastUpdatedAt = new Date();
// }
