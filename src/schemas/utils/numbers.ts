import { z, ZodNumber } from "zod";

/**
 * 整数のみを定義する基本スキーマを返す関数
 * @returns "ZodNumber" schema
 */
export const integer = (): ZodNumber => z.number().int();

const isIntegerNonnegative = (value: number) => {
    return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
/**
 * 整数かつ非負の数値を定義する基本スキーマを返す関数
 * @returns "ZodNumber" schema
 */
export const integerNonNegative = (): ZodNumber => {
    return z.custom<IntegerNonNegative>(isIntegerNonnegative, {
        message: "Value must be a non-negative integer.",
    }) as ZodNumber & { _output: IntegerNonNegative };
};

export type Integer = z.infer<ReturnType<typeof integer>>;
export type IntegerNonNegative = z.infer<ReturnType<typeof integerNonNegative>>;
