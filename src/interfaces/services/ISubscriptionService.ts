import type { SubscriptionData } from "@/schemas/subscriptionSchema";

export interface ISubscriptionService {
    getUserSubscription(userId: string): Promise<SubscriptionData | null>;
    updateUserSubscription(userId: string, subscriptionData: SubscriptionData): Promise<void>;
    cancelSubscription(userId: string): Promise<void>;
}
