import { z } from "zod";

export const UserHistoryItemSchema = z.object({
    problemId: z.string(),
    result: z.enum(["correct", "incorrect"]),
    attempts: z.number(),
    lastAttemptAt: z.string().or(z.date()),
    notes: z.string().optional(),
});

export const UserBookmarkItemSchema = z.object({
    problemId: z.string(),
    category: z.string(), // TODO
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    addedAt: z.string().or(z.date()),
});

export const CustomProblemSetSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    probalemIds: z.array(z.string()),
    createdAt: z.string().or(z.date()),
});

export type UserHistoryItem = z.infer<typeof UserHistoryItemSchema>;
export type UserBookmarkItem = z.infer<typeof UserBookmarkItemSchema>;
export type CustomProblemSet = z.infer<typeof CustomProblemSetSchema>;
