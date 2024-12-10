import { ActivitySession } from "@/domain/entities/clientSide/clientActivitySession";

export interface IActivitySessionRepository {
    findById(sessionId: string): Promise<ActivitySession | null>;
    create(session: ActivitySession): Promise<void>;
    update(session: ActivitySession): Promise<void>;
    delete(sessionId: string): Promise<void>;
}
