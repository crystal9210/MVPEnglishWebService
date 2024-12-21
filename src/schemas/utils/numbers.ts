import { z, ZodNumber } from "zod";

/**
 * Creates a Zod schema for a safe integer within ±(2^53 - 1).
 *
 * This schema enforces:
 *  1) The value must be a number.
 *  2) The value must be an integer (no decimals).
 *  3) The value must be >= Number.MIN_SAFE_INTEGER and <= Number.MAX_SAFE_INTEGER.
 *
 * Example:
 * ```typescript
 * const schema = integer();
 * schema.parse(10);        // OK
 * schema.parse(10.5);      // Fail
 * schema.parse("10");      // Fail
 * schema.parse(1e16);      // Fail (exceeds safe integer range)
 * ```
 * @returns A ZodNumber schema that validates a safe integer (±(2^53 - 1)).
 */
export function integer(): ZodNumber {
    return z.number()
        .int("Value must be an integer.")
        .min(
        Number.MIN_SAFE_INTEGER,
        `Value must be >= ${Number.MIN_SAFE_INTEGER}.`
        )
        .max(
        Number.MAX_SAFE_INTEGER,
        `Value must be <= ${Number.MAX_SAFE_INTEGER}.`
    );
}

/**
 * Creates a Zod schema for a non-negative safe integer within [0, 2^53 - 1].
 *
 * This schema enforces:
 *  1) The value must be a number.
 *  2) The value must be an integer (no decimals).
 *  3) The value must be >= 0 and <= Number.MAX_SAFE_INTEGER.
 *
 * Example:
 * ```typescript
 * const schema = integerNonNegative();
 * schema.parse(0);   // OK
 * schema.parse(10);  // OK
 * schema.parse(-1);  // Fail
 * schema.parse(10.5);// Fail
 * schema.parse(1e16);// Fail (exceeds safe integer range)
 * ```
 * @returns A ZodNumber schema that validates a non-negative safe integer.
 */
export function integerNonNegative(): ZodNumber {
    return z.number()
        .int("Value must be an integer.")
        .min(0, "Value must be >= 0.")
        .max(
        Number.MAX_SAFE_INTEGER,
        `Value must be <= ${Number.MAX_SAFE_INTEGER}.`
    );
}

/**
 * Type alias for the output of the `integer()` schema.
 * It represents a safe integer in the range [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER].
 */
export type Integer = z.infer<ReturnType<typeof integer>>;

/**
 * Type alias for the output of the `integerNonNegative()` schema.
 * It represents a safe integer in the range [0, Number.MAX_SAFE_INTEGER].
 */
export type IntegerNonNegative = z.infer<ReturnType<typeof integerNonNegative>>;
