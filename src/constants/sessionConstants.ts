import { z } from "zod";

export const GOAL_STATUS = {
    NOT_STARTED: "not _started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
} as const;

/**
 * SERVICE_IDS >> Zod schema
 */
export const GoalStatusEnum = z.enum(Object.values(GOAL_STATUS) as unknown as [typeof GOAL_STATUS[keyof typeof GOAL_STATUS]]);
export type GoalStatus = z.infer<typeof GoalStatusEnum>;
