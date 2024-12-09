import { z } from "zod";

// TODO コレクションの設計からやり直すべき
export const UserHistoryItemSchema = z.object({
  problemId: z.string(),
  result: z.enum(["correct", "incorrect"]),
  attempts: z.number(),
  lastAttemptAt: z.string().or(z.date()),
  notes: z.string().optional(),
});

export type UserHistoryItem = z.infer<typeof UserHistoryItemSchema>;


export const AttemptHistoryItemSchema = z.object({
    result: z.enum(["correct", "incorrect"]),
    timeSpent: z.number().min(0, "Time spent must be a positive number."),
    attemptAt: z.date(),
});

export type AttemptHistoryItem = z.infer<typeof AttemptHistoryItemSchema>;

export const ProblemResultSchema = z.object({
    uid: z.string().uuid("Invalid UID format"),
    categoryId: z.string(),
    problemId: z.string(),
    latestAttemptAt: z.date(),
    timeSpent: z.number().min(0, "Time spent must be a positive number."),
    result: z.enum(["correct", "incorrect"]),
    notes: z.array(z.string().max(200, "Each note must be at most 200 characters.")),
    // attemptHisotry:サブコレクションとして管理
});

export type ProblemResult = z.infer<typeof ProblemResultSchema>;
