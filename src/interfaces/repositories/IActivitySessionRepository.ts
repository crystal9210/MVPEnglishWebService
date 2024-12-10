import { ServerActivitySession } from "@/domain/entities/serverSide/activitySession";

export interface IActivitySessionRepository {
    saveActivitySession(session: ServerActivitySession): Promise<void>;
}
