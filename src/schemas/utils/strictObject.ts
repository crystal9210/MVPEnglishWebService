import { z } from "zod";

/**
 * Creates a strict ZodObject where all fields are required by default.
 * @param schema - The schema definition as a ZodRawShape (key-value pair of Zod types).
 * @returns A ZodObject with strict validation (no unknown keys allowed).
 */
export function strictObject<T extends z.ZodRawShape>(schema: T): z.ZodObject<T> {
    return z.object(schema).strict();
}

/**
 * Defines which fields in a schema should be treated as strictly required.
 * Fields marked as true are required, others are optional.
 */
/* eslint-disable no-unused-vars */
type StrictFields<T extends z.ZodRawShape> = {
    [K in keyof T]?: true; // Fields with `true` are strict; others are flexible.
};

/**
 * Partially strict ZodObject generator.
 * Allows some fields to be strictly required while making others optional.
 *
 * @param schema - The schema definition as a ZodRawShape (key-value pair of Zod types).
 * @param strictFields - A mapping of fields to `true` indicating which fields are strictly required.
 * @returns A ZodObject with mixed strict and flexible fields.
 *
 * Example usage:
 * ```typescript
 * const schema = {
 *   name: z.string(),
 *   age: z.number(),
 *   isActive: z.boolean(),
 * };
 *
 * const mySchema = partiallyStrictObject(schema, { name: true });
 *
 * // The sample case below will pass validation:
 * mySchema.parse({ name: "John", age: 30 });
 *
 * // The sample case below will fail validation because the `name` filed is required:
 * mySchema.parse({ age: 30 });
 * ```
 */
export function partiallyStrictObject<T extends z.ZodRawShape>(
    schema: T,
    strictFields: StrictFields<T>
): z.ZodObject<T> {
    const strictKeys = Object.keys(strictFields).filter(
        (key) => strictFields[key as keyof T] === true
    ) as (keyof T)[];
    const strictFieldSchema: z.ZodRawShape = strictKeys.reduce((acc, key) => {
        acc[key as string] = schema[key] as z.ZodTypeAny;
        return acc;
    }, {} as z.ZodRawShape);

    const flexibleKeys = Object.keys(schema).filter(
        (key) => !strictKeys.includes(key as keyof T)
    ) as (keyof T)[];
    const flexibleFieldSchema = flexibleKeys.reduce((acc, key) => {
        acc[key as string] = (schema[key] as z.ZodTypeAny).optional();
        return acc;
    }, {} as z.ZodRawShape);

    const strictSchema = z.object(strictFieldSchema).strict();
    const flexibleSchema = z.object(flexibleFieldSchema);

    return strictSchema.merge(flexibleSchema) as z.ZodObject<T>;
}



// type StrictFieldsObj<T, K extends keyof T> = {
//     [P in K]: true;
// }

// type PickKeys<T, K extends keyof T> = {
//     [P in K]: P;
// }

// type OmitKeys<T, K extends keyof T> = {
//     [P in Exclude<keyof T, K>]: P;
// }[Exclude<keyof T, K>];
