import { injectable, inject } from "tsyringe";
import type { ISubscriptionRepository } from "@/interfaces/repositories/ISubscriptionRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { SubscriptionData } from "@/schemas/subscriptionSchemas";
import { SubscriptionSchema } from "@/schemas/subscriptionSchemas";

@injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    private subscriptionDocRef(userId: string) {
        const firestore = this.firebaseAdmin.getFirestore();
        return firestore.collection("subscription").doc(userId);
    }

    async getSubscription(userId: string): Promise<SubscriptionData | null> {
        const docSnap = await this.subscriptionDocRef(userId).get();
        if (!docSnap.exists) {
            this.logger.warn(`Subscription not found: UID=${userId}`);
            return null;
        }
        const parsed = SubscriptionSchema.safeParse(docSnap.data());
        if (!parsed.success) {
            this.logger.warn(`Invalid subscription data in Firestore: UID=${userId}`, { errors: parsed.error.errors });
            return null;
        }
        this.logger.info(`Subscription retrieved from repository: UID=${userId}`);
        return parsed.data;
    }

    async updateSubscription(userId: string, subscriptionData: SubscriptionData): Promise<void> {
        const parsed = SubscriptionSchema.safeParse(subscriptionData);
        if (!parsed.success) {
            this.logger.warn(`Invalid subscription data to update: UID=${userId}`, { errors: parsed.error.errors });
            throw new Error("Invalid subscription data");
        }
        await this.subscriptionDocRef(userId).set(parsed.data, { merge: true });
        this.logger.info(`Subscription updated in repository: UID=${userId}`);
    }

    async cancelSubscription(userId: string): Promise<void> {
        // cancel means setting paymentStatus to "canceled"
        const updateData: Partial<SubscriptionData> = { paymentStatus: "canceled" };
        // Validate partial
        const partialParsed = SubscriptionSchema.partial().safeParse(updateData);
        if (!partialParsed.success) {
            this.logger.warn(`Invalid subscription data to cancel: UID=${userId}`, { errors: partialParsed.error.errors });
            throw new Error("Invalid subscription data for cancel");
        }
        await this.subscriptionDocRef(userId).set(partialParsed.data, { merge: true });
        this.logger.info(`Subscription canceled in repository: UID=${userId}`);
    }
}
