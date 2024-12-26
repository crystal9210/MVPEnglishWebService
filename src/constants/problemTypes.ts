import { z } from "zod";

// 原則として論理上これらのステータス系を統一で扱う場合は形式を統一すること
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



export const PROBLEM_DIFFICULTY_TYPES = {
    EASY: "easy",
    INTERMEDIATE: "normal",
    HARD: "hard",
} as const;

/**
 * PROBLEM_DIFFICULTY_TYPES >> Zod schema
*/
export const ProblemDifficultyTypeEnum = z.enum(
    Object.values(PROBLEM_DIFFICULTY_TYPES) as unknown as [
        typeof PROBLEM_DIFFICULTY_TYPES[keyof typeof PROBLEM_DIFFICULTY_TYPES]
    ]
);

export type ProblemDifficultyType = z.infer<typeof ProblemDifficultyTypeEnum>;


export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: "multiple-choice",
    INPUT: "input",
    SORTING: "sorting",
} as const;


export const QuestionTypeEnum = z.enum(
    Object.values(QUESTION_TYPES) as unknown as [
        typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES]
    ]
);

export type QuestionType = z.infer<typeof QuestionTypeEnum>;
