import { z } from "zod";
import { ActivitySessionHistoryItemSchema } from "./activitySessionHistoryItemSchema";
import { ProblemSetSchema } from "./problemSetSchema";

export const ClientActivitySessionSchema = z.object({
    sessionId: z.string(),
    startedAt: z.date().default(new Date(0)),
    endedAt: z.date().default(new Date(0)),
    history: z.array(ActivitySessionHistoryItemSchema),
    problemSet: ProblemSetSchema,
});

export type ClientActivitySessionType = z.infer<typeof ClientActivitySessionSchema>;
