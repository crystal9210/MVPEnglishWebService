import { z } from "zod";
import { integer, integerNonNegative } from "./utils/numbers";
import { SessionType, SessionTypeEnum } from "@/constants/clientSide/sessions/sessions";
import { ServiceIdEnum, ServiceId } from "@/constants/clientSide/sessions/sessions";


// TODO UI設計から逆算する形で設計を進める >> DDD(UIはビジネスロジックをそのまま反映したと言えるため)
// 1. 単調な履歴データ
// 2. サービスごとの履歴データ
// 3.

// 要件メモ
// /dashboard用 - /dashboardページの履歴セッション一覧にて閲覧できるセッション数:最大20個
// /dashboard >> history >> historyItems: 取り組み日時でソート

// フィールドにserviceIdを保持 >> /dashboardの履歴一覧にもデータ格納し、そこでデータ情報の識別として必要
const ServiceSessionHistoryItemSchema = z.object({
  serviceId: ServiceIdEnum,
  categoryId: z.string().optional(),
  stepId: z.string().optional(),
  problemId: z.string(),
  attempts: integerNonNegative().min(0, { message: "Attempts must be non-negative." }), // ユーザの苦手などを情報として取得するためのフィールド: セッション内で問題への挑戦回数(仕様として何回も取り組むことが可能とする - firestore側に保存される)
  lastResult: z.enum(["correct", "incorrect"]),
  historyDetailId: z.string(),
});

const GoalSessionHistoryItemSchema = z.object({
  serviceId: ServiceIdEnum,
  categoryId: z.string().optional(),
  stepId: z.string().optional(),
  problemId: z.string(),
  attempts: z.number().int().nonnegative(),
  lastResult: z.enum(["correct", "incorrect"]),
  historyDetailId: z.string(),
})

// sessionId === activitySession's id
// TODO id設計 : 一意性の担保: セッションは1ユーザに対して同時に1つを上限として設ける仕様 -> 取り組み日時をid化 (取り組み日時データの整合性はどうするか問題 - どこの日時を基準とするか - ユーザのプロフィールか何かに住んでいる場所を入力させてそこから日時を計算するように設計)
const GoalSessionSchema = z.object({
  sessionId: z.string(),
  sessionType: z.literal("goal"),
  goalId: z.string(),
  problemCount: integerNonNegative().min(0, { message: "Problem count must be non-negative" }),
  correctAnswerRate: z
    .number()
    .min(0, { message: "Problem count must be at least 0%" })
    .max(100, { message: "Correct answer rate cannot exceed 100%" }),
  score: integerNonNegative().min(0, { message: "Score must be non-negative." }),
  maxScore: integerNonNegative().min(0, { message: "Max score must be non-negative." }),
  spentTime: integerNonNegative().min(0, { message: " Time must be non-negative" }), // i.e. how long the user spent time to complete the session.
  attemptedTime: integerNonNegative(),
  completedAt: z.date(), // i.e. the time this session is completed at
  historyItems: z.array(GoalSessionHistoryItemSchema)
});

export const ServiceSessionSchema = z.object({
  sessionId: z.string(),
  sessionType: z.literal("service"),
  serviceId: ServiceIdEnum,
  problemCount: integerNonNegative().min(0, { message: "Problem count must be non-negative." }),
  correctAnswerRate: z
    .number()
    .min(0, { message: "Correct answer rate must be at least 0%." })
    .max(100, { message: "Correct answer rate cannot exceed 100%." }),
  score: integerNonNegative().min(0, { message: "Score must be non-negative." }),
  maxScore: integerNonNegative().min(0, { message: "Max score must be non-negative." }),
  spentTime: integerNonNegative().min(0, { message: " Time must be non-negative" }), // i.e. how long the user spent time to complete the session.
  attemptedTime: integerNonNegative(),
  completedAt: z.date(),
  historyItems: z
    .array(ServiceSessionHistoryItemSchema)
});

export const UserHistoryItemSchema = z.discriminatedUnion("sessionType", [
  GoalSessionSchema,
  ServiceSessionSchema
]).superRefine((data, ctx) => {
  if (data.score > data.maxScore) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Score must be less than or equal to maxScore.",
      path: ["score"],
    });
  }
});

export type UserHistoryItem = z.infer<typeof UserHistoryItemSchema>;


// /[serviceId]/dashboard用

export const ProblemHistorySchema = z.object({
  serviceId: ServiceIdEnum,
  categoryId: z.string(), // optional i.e. default value: "none"
  stepId: z.string(), // optional i.e. default value: "none"
  problemId: z.string(),
  latestAttemptAt: z.date(),
  attemptCount: z.number().int().nonnegative(),
  correctRate: z.number().min(0).max(100),
  lastResult: z.enum(["correct", "incorrect"]),
  everCorrect: z.boolean(), // i.e. whether the user have answered the problem correctly in the past
  isBookmarked: z.boolean(),
  historyDetailIds: z.array(z.string()),
  memos: z.array(z.string().max(200)).max(3).optional(),
});

export const DetailedHistorySchema = z.object({
  sessionId: z.string(),
  serviceId: ServiceIdEnum,
  categoryId: z.string(), // optional i.e. default value: "none"
  stepId: z.string(), // optional i.e. default value: "none"
  problemId: z.string(),
  attemptedAt: z.date(),
  result: z.enum(["correct", "incorrect"]),
  timeSpent: z.number().int().nonnegative(),
  feedback: z.string().max(50).optional(), // i.e. comments on user's approach to the problem by the user
});

export const AttemptHistoryItemSchema = z.object({
  result: z.enum(["correct", "incorrect"]),
  timeSpent: z.number().min(0, "Time spent must be a positive number."),
  attemptAt: z.date(),
});

export type AttemptHistoryItem = z.infer<typeof AttemptHistoryItemSchema>;

//

export const ProblemResultSchema = z.object({
  uid: z.string().uuid("Invalid UID format"),
  serviceId: ServiceIdEnum,
  categoryId: z.string(), // optional i.e. default value: "none"
  stepId: z.string(), // optional i.e. default value: "none"
  problemId: z.string(),
  latestAttemptAt: z.date(),
  timeSpent: z.number().gt(0, "Time spent must be a positive number."),
  result: z.enum(["correct", "incorrect"]),
  notes: z.array(z.string().max(200, "Each note must be at most 200 characters.")),
  // attemptHisotry:サブコレクションとして管理
});

export type ProblemResult = z.infer<typeof ProblemResultSchema>;
