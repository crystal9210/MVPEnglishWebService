import { z } from 'zod';

export const SessionProblemSchema = z.object({
  problemId: z.string(),
  result: z.enum(['correct', 'incorrect']),
  timeSpent: z.number().int().nonnegative(),
  attempts: z.number().int().nonnegative(),
  notes: z.array(z.string().max(200)).max(3).optional(),
});

export const SessionSchema = z.object({
  goalId: z.string(),
  startedAt: z.date(),
  endedAt: z.date().nullable(),
  problems: z.array(SessionProblemSchema),
  status: z.enum(['active', 'completed']),
});

export type Session = z.infer<typeof SessionSchema>;
