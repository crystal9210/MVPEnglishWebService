import { z } from 'zod';

export const ProblemSetSchema = z.object({
  serviceId: z.string(),
  categoryId: z.string().nullable(),
  stepId: z.string().nullable(),
  problemIds: z.array(z.string()).min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CustomProblemSet = z.infer<typeof ProblemSetSchema>;
