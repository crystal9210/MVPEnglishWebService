import { z } from "zod";
import { ProblemResultTypeEnum } from "@/constants/problemTypes";
import { DateSchema } from "../utils/dates";
import { integerNonNegative } from "../utils/numbers";

/**
 * The schema for managing input to a problem from the user.
 * - Maintains user's input for each question's input section
 * - Maintains correct or incorrect info and time spent while answering the question's section.
 *
 * @example
 * ```typescript
 * {
 *   input: [
 *     { value: "answer1", isCorrect: true, timeSpent: 1500 },
 *     { value: "answer2", isCorrect: false, timeSpent: 2000 }
 *   ],
 *   result: "CORRECT",
 *   attemptedAt: new Date("2024-12-25T12:15:00.000Z"),
 * }
 * ```
 *
 */
export const UserInputSchema = z.object({
    input: z.array(
        z.object({
            value: z.string().min(1).max(600), // Ensure at least one character and limit size of inputs to prevent abuse.
            isCorrect: z.boolean(),
            timeSpent: integerNonNegative(),
        })
    ).max(10), // Limit total number of inputs
    result: ProblemResultTypeEnum,
    attemptedAt: DateSchema,
});

export type UserInput = z.infer<typeof UserInputSchema>;

// TODO: Implement the input schemas for other input types like boolean, number, etc.
