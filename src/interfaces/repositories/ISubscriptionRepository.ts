import type { SubscriptionData } from "@/schemas/subscriptionSchemas";

export interface ISubscriptionRepository {
    getSubscription(userId: string): Promise<SubscriptionData | null>;
    updateSubscription(userId: string, subscriptionData: SubscriptionData): Promise<void>;
    cancelSubscription(userId: string): Promise<void>;
}
