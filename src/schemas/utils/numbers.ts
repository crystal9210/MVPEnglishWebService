import { z, ZodNumber } from "zod";

/**
 * 整数のみを定義する基本スキーマを返す関数
 * @returns "ZodNumber" schema
 */
export const integer = (): ZodNumber => z.number().int();

/**
 * 整数かつ非負の数値を定義する基本スキーマを返す関数
 * @returns "ZodNumber" schema
 */
export const integerNonNegative = (): ZodNumber => z.number().int().nonnegative();
