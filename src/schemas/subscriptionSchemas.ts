import { z } from "zod";


export const SubscriptionSchema = z.object({
    subscriptionType: z.enum(["free", "grammar", "sentence", "listening", "writing", "enterprise"]).optional(),
    paymentStatus: z.enum(["active", "canceled", "pending"]).optional(),
    stripeCustomerId: z.string().optional(),
    stripeSubscriptionId: z.string().optional(),
});

export type SubscriptionData = z.infer<typeof SubscriptionSchema>;
