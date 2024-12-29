import { z } from "zod";
import { ProblemResultTypeEnum } from "@/constants/problemTypes";
import { sanitizeInputUniversal } from "@/utils/sanitize";
import { integerNonNegative } from "../utils/numbers";

/**
 * UserInputSchema:
 *  Utilizes zod's superRefine to call sanitizeInputUniversal for input sanitization.
 *
 * @example
 * ```typescript
 * const userInput = {
 *   input: [
 *     { value: "Sample input", isCorrect: true, timeSpent: 120 },
 *   ],
 *   result: "CORRECT",
 *   attemptedAt: new Date(),
 * };
 *
 * UserInputSchema.parseAsync(userInput)
 *   .then((data) => {
 *     // valid and sanitized data can access in this block.
 *   })
 *   .catch((err) => {
 *     // >> implementation is set to handle validation errors.
 *   });
 * ```
 */
export const UserInputSchema = z.object({
    input: z
        .array(
            z.object({
                value: z
                    .string()
                    .min(1, {
                        message: "Value must be at least 1 character long.",
                    })
                    .max(600, {
                        message: "Value must not exceed 600 characters.",
                    })
                    .superRefine(async (val, ctx) => {
                        try {
                            await sanitizeInputUniversal(val);
                        } catch (error) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message:
                                    error instanceof Error
                                        ? error.message
                                        : "Invalid input detected.",
                            });
                        }
                    }),
                isCorrect: z.boolean(),
                timeSpent: integerNonNegative(),
            })
        )
        .min(1, { message: "Input array must contain at least one item." })
        .max(10, {
            message: "Input array must not contain more than 10 items.",
        }),
    result: ProblemResultTypeEnum,
    attemptedAt: z.date(), // Required field
});

export type UserInput = z.infer<typeof UserInputSchema>;
