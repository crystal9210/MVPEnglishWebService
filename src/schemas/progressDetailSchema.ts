import { z } from "zod";
import { integerNonNegative } from "@/schemas/utils/numbers";
import { NA_PATH_ID, ServiceIdEnum } from "@/constants/serviceIds";
import { PROGRESS_MODES, ProgressMode } from "@/constants/sessions/sessions";
import { CustomProblemSetSchema } from "@/schemas/customProblemSetSchema";

/**
 * Schema for a pair of category and step IDs.
 * Allows specifying multiple categories, each with optional steps.
 */
const CategoryStepPairSchema = z.object({
    categoryId: z.string().default(NA_PATH_ID),
    stepIds: z.array(z.string().default(NA_PATH_ID)).default([]), // Array of stepIds within the category
});


/**
 * Base schema generator for progress details based on progress mode.
 * @param progressMode - The mode of progress tracking
 */
const createProgressDetailBaseSchema = <T extends ProgressMode>(progressMode: T) => {
    return z.object({
        mode: z.literal(progressMode),
        completedIterations: integerNonNegative(), // >> how many times the user completed the session.
        requiredIterations: integerNonNegative(), // >> the user should accomplish the goal as many times as this field's value.
        currentScore: integerNonNegative().default(0),
        currentCorrectAnswerCount: integerNonNegative().default(0), // >> the number user correctly answered problems in the session.
    });
}


/**
 * Schema for iteration-based progress details.
 * Tracks the number of iterations completed and required.
 */
const CustomProblemSetProgressDetailSchema = z.object({
    ...createProgressDetailBaseSchema(PROGRESS_MODES.ITERATION).shape,
    problemSetId: CustomProblemSetSchema.shape.problemSetId, // TODO 参照先との連携 (NOTE:上位層実装)
    currentProgressDetails: z.object({
        serviceId: z.string().default(NA_PATH_ID),
        categoryId: z.string().default(NA_PATH_ID),
        stepId: z.string().default(NA_PATH_ID),
        problemId: z.string().default(NA_PATH_ID),
        isCorrect: z.boolean().default(false),
        totalSpentTime: integerNonNegative().default(0),
    }),
});

/**
 * Schema for score-based progress details.
 * Tracks the user's score and achievements.
 */
const ScoreProgressDetailSchema = z.object({
    ...createProgressDetailBaseSchema(PROGRESS_MODES.SCORE).shape,
    requiredScore: integerNonNegative(), // >> the total score user correctly answered problems and get points of them,which is required for achieving the goal.
    targetServiceIds: z.array(ServiceIdEnum.default(NA_PATH_ID)).default([]),
    targetCategoryStepPairs: z.array(CategoryStepPairSchema),
});

/**
 * Schema for count-based progress details.
 * Tracks the number of correct answers required to achieve the goal.
 */
const CountProgressDetailSchema = z.object({
    ...createProgressDetailBaseSchema(PROGRESS_MODES.COUNT).shape,
    requiredCount: integerNonNegative(), // >> number of problems the user must answer correctly to achieve the goal.
    targetServiceIds: z.array(ServiceIdEnum.default(NA_PATH_ID)).default([]),
    targetCategoryStepPairs: z.array(CategoryStepPairSchema),
});



/**
 * Unified schema for progress details based on criteria.
 * Discriminates between different progress modes.
 */
export const ProgressDetailByCriteriaSchema = z.discriminatedUnion("mode", [
    CustomProblemSetProgressDetailSchema,
    ScoreProgressDetailSchema,
    CountProgressDetailSchema,
]);

export type ProgressDetailByCriteria = z.infer<typeof ProgressDetailByCriteriaSchema>;


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
