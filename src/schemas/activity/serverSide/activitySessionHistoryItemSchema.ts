import { z } from "zod";

export const ActivitySessionHistoryItemSchema = z.object({
    sessionId: z.string(),
    problemId: z.string(),
    result: z.enum(["correct", "incorrect"]),
    attempts: z.number().int().min(1),
    lastAttemptAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date string",
    }),
    notes: z.string().optional(),
});

export type IActivitySessionHistoryItem = z.infer<typeof ActivitySessionHistoryItemSchema>;
