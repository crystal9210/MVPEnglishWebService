import { z } from "zod";
import { ActivitySessionHistoryItemSchema } from "./activitySessionHistoryItemSchema";
import { ProblemSetSchema } from "./problemSetSchema";

export const ClientActivitySessionSchema = z.object({
    sessionId: z.string(),
    startedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date string",
    }),
    history: z.array(ActivitySessionHistoryItemSchema),
    problemSet: ProblemSetSchema,
});

export type IClientActivitySession = z.infer<typeof ClientActivitySessionSchema>;
