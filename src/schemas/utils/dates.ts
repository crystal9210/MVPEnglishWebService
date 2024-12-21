import { z } from "zod";
import { NOW, EPOCH_START } from "@/constants/dates";

/**
 * DateSchema is a Zod schema for Date objects with NOW as the default value.
 * Usage:
 * ```typescript
 * const dateSchema = DateSchema;
 * dateSchema.parse(new Date()); // OK
 * dateSchema.parse("Invalid Date"); // Fail
 * ```
 */
export const DateSchema = z.date().default(NOW);

/**
 * OptionalDateSchema is a Zod schema for optional Date objects with EPOCH_START as the default value.
 * Usage:
 * ```typescript
 * const optionalDateSchema = OptionalDateSchema;
 * optionalDateSchema.parse(null); // OK, defaults to EPOCH_START
 * optionalDateSchema.parse(undefined); // OK, defaults to EPOCH_START
 * optionalDateSchema.parse(new Date()); // OK
 * ```
 */
export const OptionalDateSchema = z.date().default(EPOCH_START);
