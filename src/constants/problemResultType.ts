import { z } from "zod";

// 普段はめんどくさいので何も言わないが、原則として
// 論理上これらのステータス系を統一で扱う場合は形式を統一すること
// 今回はPROBLEM_RESULT_TYPESなので the problem is "".の""に適合する s v c の c の部分を使用
export const PROBLEM_RESULT_TYPES = {
    CORRECT: "correct",
    PARTIALLY_CORERCT: "partially_correct", // 複数問が一括である場合のケースに対応
    INCORRECT: "incorrect",
    // SKIPPED: "skipped" // なんかありそうだが使わなそうな気もするのでコメアウト
    NOT_STARTED: "not_started",
} as const;

/**
 * PROBLEM_RESULT_TYPES >> Zod schema
*/
export const ProblemResultTypeEnum = z.enum(
    Object.values(PROBLEM_RESULT_TYPES) as unknown as [
        typeof PROBLEM_RESULT_TYPES[keyof typeof PROBLEM_RESULT_TYPES]
    ]
);

export type ProblemResultType = z.infer<typeof ProblemResultTypeEnum>;
