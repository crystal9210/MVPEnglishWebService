// TODO バイパス対策のフィールド追加(uidなど > 制御の責任分離設計)
import { z } from "zod";
import { ActivitySessionHistoryItemSchema } from "./activitySessionHistoryItemSchema";

export const ActivitySessionSchema = z.object({
    sessionId: z.string(),
    startedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date string",
    }),
    history: z.array(ActivitySessionHistoryItemSchema),
    // 必要ならプロパティ追加
});

export type ActivitySessionType = z.infer<typeof ActivitySessionSchema>;
