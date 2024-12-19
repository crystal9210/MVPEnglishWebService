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
