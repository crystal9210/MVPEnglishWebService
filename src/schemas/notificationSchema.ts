import { z } from 'zod';

export const NotificationSchema = z.object({
  type: z.enum(['achievement', 'reminder', 'new_content']),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.date(),
});

export type Notification = z.infer<typeof NotificationSchema>;
