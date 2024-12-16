import { z } from "zod";
import { CustomProblemSetSchema } from "./userSchemas";

export const ActivitySessionSchema = z.object({
    sessionId: z.string(),
    customProblemSets: z.array(CustomProblemSetSchema),
    startedAt: z.string().or(z.date()),
    endedAt: z.string().or(z.date()).nullable(),
});

export type ActivitySession = z.infer<typeof ActivitySessionSchema>;
