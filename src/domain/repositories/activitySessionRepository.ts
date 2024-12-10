import { injectable } from "tsyringe";
import { IActivitySessionRepository } from "@/interfaces/repositories/IActivitySessionRepository";
import { ActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";

@injectable()
export class ActivitySessionRepository implements IActivitySessionRepository {
    private collectionName = "activitySessions";

    constructor(
        private firebaseAdmin: IFirebaseAdmin,
        private logger: ILoggerService
    ) {}

    async findById(sessionId: string): Promise<ActivitySession | null> {
        try {
        const doc = await this.firebaseAdmin.getFirestore().collection(this.collectionName).doc(sessionId).get();
        if (doc.exists) {
            const data = doc.data()!;
            return ActivitySession.fromFirestore(data);
        }
        return null;
        } catch (error) {
        this.logger.error(`Failed to find ActivitySession: ID = ${sessionId}`, { error });
        throw error;
        }
    }

    async create(session: ActivitySession): Promise<void> {
        try {
        await this.firebaseAdmin.getFirestore().collection(this.collectionName).doc(session.sessionId).set(session.toFirestore());
        this.logger.info(`ActivitySession created: ID = ${session.sessionId}`);
        } catch (error) {
        this.logger.error(`Failed to create ActivitySession: ID = ${session.sessionId}`, { error });
        throw error;
        }
    }

    async update(session: ActivitySession): Promise<void> {
        try {
        await this.firebaseAdmin.getFirestore().collection(this.collectionName).doc(session.sessionId).update(session.toFirestore());
        this.logger.info(`ActivitySession updated: ID = ${session.sessionId}`);
        } catch (error) {
        this.logger.error(`Failed to update ActivitySession: ID = ${session.sessionId}`, { error });
        throw error;
        }
    }

    async delete(sessionId: string): Promise<void> {
        try {
        await this.firebaseAdmin.getFirestore().collection(this.collectionName).doc(sessionId).delete();
        this.logger.info(`ActivitySession deleted: ID = ${sessionId}`);
        } catch (error) {
        this.logger.error(`Failed to delete ActivitySession: ID = ${sessionId}`, { error });
        throw error;
        }
    }
}
