import { z } from "zod";
import { ProblemResultTypeEnum } from "@/constants/problemTypes";
import { sanitizeInput } from "@/utils/sanitizeInput";

/**
 * 整数で非負のものを検証するカスタムスキーマ
 */
const integerNonNegative = () => z.number().int().nonnegative();

export const UserInputSchema = z.object({
    input: z.array(
        z.object({
            value: z.string()
                .min(1, { message: "Value must be at least 1 character long." })
                .max(600, { message: "Value must not exceed 600 characters." })
                .refine((val) => {
                    try {
                        sanitizeInput(val);
                        return true;
                    } catch (error) {
                        return false;
                    }
                }, { message: "Invalid input detected." }),
            isCorrect: z.boolean(),
            timeSpent: integerNonNegative(),
        })
    )
    .min(1, { message: "Input array must contain at least one item." })
    .max(10, { message: "Input array must not contain more than 10 items." }),
    result: ProblemResultTypeEnum,
    attemptedAt: z.date(), // 必須フィールドとして定義
});
