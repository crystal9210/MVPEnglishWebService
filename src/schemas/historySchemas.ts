import { z } from 'zod';

export const HistorySchema = z.object({
  sessionId: z.string(),
  goalId: z.string(),
  completedAt: z.date(),
  achievement: z.boolean(),
});

export type History = z.infer<typeof HistorySchema>;
