import { ServerActivitySession } from "@/domain/entities/serverSide/activitySession";

export interface IActivityService {
    saveActivitySession(session: ServerActivitySession): Promise<void>;
}
