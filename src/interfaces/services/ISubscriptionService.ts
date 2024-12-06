import type { SubscriptionData } from "@/schemas/subscriptionSchemas";

export interface ISubscriptionService {
    getUserSubscription(userId: string): Promise<SubscriptionData | null>;
    updateUserSubscription(userId: string, subscriptionData: SubscriptionData): Promise<void>;
    cancelSubscription(userId: string): Promise<void>;
}
