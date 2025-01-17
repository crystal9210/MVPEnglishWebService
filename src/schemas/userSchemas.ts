import { z } from "zod";
import { sanitizedString } from "./baseSchemas";

export const UserSchema = z.object({
    uid: z.string(), // TODO
    email: z.string().email(),
    name: z.string().min(1, `Name is required`).max(255, "Name is too long."),
    image: z.string().url("Invalid image URL").max(255, "Name is too long."),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
});

export type User = z.infer<typeof UserSchema>;

export const UserProfileSchema = z.object({
    displayName: sanitizedString(50),
    bio: sanitizedString(300).optional(),
    location: sanitizedString(100).optional(),
    websites: z.array(z.string().url()).optional(),
    isPremium: z.boolean().optional(),
    subscriptionPlan: z.enum(["free", "pro", "enterprise"]), // TODO
    settings: z.object({
        privacy: z.object({
        profileVisibility: z.enum(["public", "private"]),
        allowFollowers: z.boolean(),
        }),
        notifications: z.object({
        emailNotifications: z.boolean(),
        pushNotifications: z.boolean(),
        }),
    }),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserHistoryItemSchema = z.object({
    problemId: z.string(),
    result: z.enum(["correct", "incorrect"]),
    attempts: z.number(),
    lastAttemptAt: z.string().or(z.date()),
    notes: z.string().optional(),
});

export type UserHistoryItem = z.infer<typeof UserHistoryItemSchema>;

export const UserBookmarkItemSchema = z.object({
    problemId: z.string(),
    category: z.string(), // TODO: カテゴリーの定義具体化
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    addedAt: z.string().or(z.date()),
});

export type UserBookmarkItem = z.infer<typeof UserBookmarkItemSchema>;

export const CustomProblemSetSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    problemIds: z.array(z.string()),
    createdAt: z.string().or(z.date()),
});

export type CustomProblemSet = z.infer<typeof CustomProblemSetSchema>;
