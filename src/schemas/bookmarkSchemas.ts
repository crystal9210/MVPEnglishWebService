import { z } from "zod";
import { sanitizedString } from "@/schemas/baseSchemas";
// TODO serviceIdなど複数のスキーマで共通のフィールドは外部定義し、そこから依存性注入するようにして共通化の保証・内部抽象化
export const UserBookmarkSchema = z.object({
    serviceId: sanitizedString(50), // 問題形態
    problemId: sanitizedString(50), // 問題ID
    categoryId: sanitizedString(50).optional(),
    stepId: sanitizedString(50).optional(),
    bookmarkedAt: z.string().or(z.date()),
    // indexes to sort, filter bookmarked problems.
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export type UserBookmark = z.infer<typeof UserBookmarkSchema>;
