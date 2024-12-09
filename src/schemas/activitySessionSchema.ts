import { z } from "zod";
import { UserSchema, UserProfileSchema, UserBookmarkItemSchema, CustomProblemSetSchema, UserHistoryItemSchema } from "./userSchemas";

export const ActivitySessionSchema = z.object({
    sessionId: z.string(),
    user: UserSchema,
    userProfile: UserProfileSchema,
    history: z.array(UserHistoryItemSchema),
    bookmarks: z.array(UserBookmarkItemSchema),
    customProblemSets: z.array(CustomProblemSetSchema),
    startedAt: z.string().or(z.date()),
    endedAt: z.string().or(z.date()).nullable(),
});

export type ActivitySession = z.infer<typeof ActivitySessionSchema>;
