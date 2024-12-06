import { z } from "zod";
import { sanitizedString } from "@/schemas/baseSchemas";

export const UserBookmarkSchema = z.object({
    serviceId: sanitizedString(50), // 問題形態
    problemId: sanitizedString(50), // 問題ID
    category: sanitizedString(50).optional(), // オプショナルカテゴリ
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    bookmarkedAt: z.string().or(z.date()),
});

export type UserBookmark = z.infer<typeof UserBookmarkSchema>;
