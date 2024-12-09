import { injectable, inject } from "tsyringe";
import type { ISubscriptionService } from "@/interfaces/services/ISubscriptionService";
import type { ISubscriptionRepository } from "@/interfaces/repositories/ISubscriptionRepository";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { SubscriptionData } from "@/schemas/subscriptionSchemas";

@injectable()
export class SubscriptionService implements ISubscriptionService {
    constructor(
        // eslint-disable-next-line no-unused-vars
        @inject("ISubscriptionRepository") private readonly subscriptionRepository: ISubscriptionRepository,
        // eslint-disable-next-line no-unused-vars
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    async getUserSubscription(userId: string): Promise<SubscriptionData | null> {
        const sub = await this.subscriptionRepository.getSubscription(userId);
        if (sub) {
            this.logger.info(`User subscription retrieved in service: UID=${userId}`);
        } else {
            this.logger.warn(`No subscription found in service: UID=${userId}`);
        }
        return sub;
    }

    async updateUserSubscription(userId: string, subscriptionData: SubscriptionData): Promise<void> {
        await this.subscriptionRepository.updateSubscription(userId, subscriptionData);
        this.logger.info(`User subscription updated in service: UID=${userId}`);
    }

    async cancelSubscription(userId: string): Promise<void> {
        await this.subscriptionRepository.cancelSubscription(userId);
        this.logger.info(`User subscription canceled in service: UID=${userId}`);
    }
}
