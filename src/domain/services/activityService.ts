import { injectable, inject } from "tsyringe";
import { IActivityService } from "@/interfaces/services/IActivityService";
import type { IActivitySessionRepository } from "@/interfaces/repositories/IActivitySessionRepository";
import { ServerActivitySession } from "@/domain/entities/serverSide/activitySession";

@injectable()
export class ActivityService implements IActivityService {
    constructor(
        @inject("IActivitySessionRepository") private activitySessionRepository: IActivitySessionRepository
    ) {}

    async saveActivitySession(session: ServerActivitySession): Promise<void> {
        await this.activitySessionRepository.saveActivitySession(session);
    }

}
