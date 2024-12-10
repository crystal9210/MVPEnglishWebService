import { z } from "zod";
import { ActivitySessionHistoryItemSchema } from "./activitySessionHistoryItemSchema";

export const ClientActivitySessionSchema = z.object({
    sessionId: z.string(),
    startedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date string",
    }),
    history: z.array(ActivitySessionHistoryItemSchema),
    // 必要に応じプロパティ追加
});

export type ClientActivitySessionType = z.infer<typeof ClientActivitySessionSchema>;
