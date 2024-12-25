/* eslint-disable no-unused-vars */
import { ActivitySession } from "@/schemas/activity/activitySessionSchema";

export interface IActivitySessionClientRepository {
    addActivitySession(session: ActivitySession): Promise<void>;
    getActivitySession(id: string): Promise<ActivitySession | undefined>;
    getAllActivitySessions(): Promise<ActivitySession[]>;
    updateActivitySession(id: string, session: ActivitySession): Promise<void>;
    deleteActivitySession(id: string): Promise<void>;
}
// TODO 完了したゴールに対応するセッション情報などはアーカイブして保持するようにするか、する場合どの程度保存期間および容量を設けるか
