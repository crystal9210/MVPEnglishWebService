import { z } from "zod";
import { ProblemResultTypeEnum } from "@/constants/problemTypes";
import { sanitizeInputUniversal } from "@/utils/sanitize"; // <-- ユニバーサルエントリポイント
// もしくは  "sanitizeInput.client" or "sanitizeInput.server" どちらかに固定したいならそこを指定

/** 整数非負 */
const integerNonNegative = () => z.number().int().nonnegative();

/**
 * UserInputSchema:
 *  zod refine で sanitizeInputUniversal を呼び出す
 */
export const UserInputSchema = z.object({
  input: z.array(
    z.object({
      value: z.string()
        .min(1, { message: "Value must be at least 1 character long." })
        .max(600, { message: "Value must not exceed 600 characters." })
        .refine((val) => {
          // refineは同期関数だが sanitizeInputUniversal は同期を呼ぶだけ→OK
          try {
            sanitizeInputUniversal(val);
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
  attemptedAt: z.date(), // 必須フィールド
});
