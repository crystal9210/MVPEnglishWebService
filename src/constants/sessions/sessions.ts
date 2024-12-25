// import { z } from "zod";

// export const SESSION_TYPES = {
//     GOAL: "goal",
//     SERVICE: "service",
// } as const;
// /**
//  * セッションタイプの列挙型
//  */
// export const SessionTypeEnum = z.enum(Object.values(SESSION_TYPES) as ["goal", "service"]); // こっちだとタプルとして扱われる
// export type SessionType = z.infer<typeof SessionTypeEnum>;

import { z } from "zod";

export const SESSION_TYPES = {
    GOAL: "goal",
    SERVICE: "service",
} as const;

/**
 * SESSION_TYPES >> Zod schema
 */
export const SessionTypeEnum = z.enum(Object.values(SESSION_TYPES) as unknown as [typeof SESSION_TYPES[keyof typeof SESSION_TYPES]]); // こっちだとユニオンとして扱われる
export type SessionType = z.infer<typeof SessionTypeEnum>;



export const GOAL_TERM_TYPE = {
    SHORT: "short",
    MEDIUM: "medium",
    LONG: "long",
} as const;

export const GoalTermTypeEnum = z.enum(Object.values(GOAL_TERM_TYPE) as unknown as [typeof GOAL_TERM_TYPE[keyof typeof GOAL_TERM_TYPE]]);
export type GoalTermType = z.infer<typeof GoalTermTypeEnum>;



export const PROGRESS_MODES = {
    ITERATION: "iteration",
    SCORE: "score",
    COUNT: "count",
    TIME: "time",
} as const;

export const ProgressModeEnum = z.enum(
    Object.values(PROGRESS_MODES) as unknown as [typeof PROGRESS_MODES[keyof typeof PROGRESS_MODES]]
);
export type ProgressMode = z.infer<typeof ProgressModeEnum>;


export const SESSION_STATUS = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
} as const;

/**
 * SERVICE_IDS >> Zod schema
 */
export const SessionStatusEnum = z.enum(Object.values(SESSION_STATUS) as unknown as [typeof SESSION_STATUS[keyof typeof SESSION_STATUS]]);
export type SessionStatus = z.infer<typeof SessionStatusEnum>;


// TODO 命名調整
export const GOAL_STATUS = {
    ACTIVE: "active",
    FAILED: "failed",
    GOOD_CLEAR: "good_clear",
    BEST_CLEAR: "best_clear",
    ARCHIVED: "archived",
} as const;

export const GoalStatusEnum = z.enum(Object.values(GOAL_STATUS) as unknown as [typeof GOAL_STATUS[keyof typeof GOAL_STATUS]]);
export type GoalStatus = z.infer<typeof GoalStatusEnum>;
