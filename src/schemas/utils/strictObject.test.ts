import { z } from "zod";
import { partiallyStrictObject } from "./strictObject";

/* -----------------------------------------------------
 * Test suite for partiallyStrictObject
 * ----------------------------------------------------- */

describe("partiallyStrictObject test suites", () => {
    // Basic schema for demonstration
    const schema = {
        name: z.string(),
        age: z.number(),
        isActive: z.boolean(),
    };

    /* -----------------------------------------------------
     * Basic usage and core functionality tests
     * ----------------------------------------------------- */

    it("should validate strict fields and allow flexible fields", () => {
        // 'name' is the only strict field
        const strictFields: { name: true } = { name: true };
        const mySchema = partiallyStrictObject(schema, strictFields);

        // Success case: 'name' is required, 'age' and 'isActive' are optional
        expect(() => mySchema.parse({ name: "John", age: 30, isActive: true })).not.toThrow();

        // Error case: missing 'name' (strict field)
        expect(() => mySchema.parse({ age: 30, isActive: true })).toThrow();

        // Success case: only 'name' is provided (flexible fields can be omitted)
        expect(() => mySchema.parse({ name: "John" })).not.toThrow();
    });

    it("should validate multiple strict fields", () => {
        // 'name' and 'age' are strict fields
        const strictFields: { name: true; age: true } = { name: true, age: true };
        const mySchema = partiallyStrictObject(schema, strictFields);

        // Success case: both 'name' and 'age' are provided
        expect(() => mySchema.parse({ name: "John", age: 30 })).not.toThrow();

        // Error case: 'age' is missing
        expect(() => mySchema.parse({ name: "John" })).toThrow();
    });

    it("should allow extra fields in flexible schema", () => {
        // Only 'name' is strict
        const strictFields: { name: true } = { name: true };
        const mySchema = partiallyStrictObject(schema, strictFields);

        // Success case: providing additional properties besides the flexible ones
        expect(() =>
            mySchema.parse({ name: "John", age: 30, isActive: true, extra: "value" })
        ).not.toThrow();
    });

    it("should disallow missing strict fields", () => {
        // 'name' and 'age' are strict fields
        const strictFields: { name: true; age: true } = { name: true, age: true };
        const mySchema = partiallyStrictObject(schema, strictFields);

        // Error case: missing both 'name' and 'age'
        expect(() => mySchema.parse({ isActive: true })).toThrow();
    });

    it("should handle empty strictFields", () => {
        // No fields are strict
        const strictFields: Record<string, true> = {};
        const mySchema = partiallyStrictObject(schema, strictFields);

        // Success case: all fields are flexible
        expect(() => mySchema.parse({ name: "John", age: 30, isActive: true })).not.toThrow();
        expect(() => mySchema.parse({})).not.toThrow();
    });

    /* -----------------------------------------------------
     * Advanced and comprehensive test cases
     * (covering types, nested objects, unions, etc.)
     * ----------------------------------------------------- */

    it("should throw an error if type of a strict field is invalid", () => {
        // 'name' is strict (must be a string)
        const strictFields: { name: true } = { name: true };
        const mySchema = partiallyStrictObject(schema, strictFields);

        // Error: 'name' is provided but as a number, which is invalid
        expect(() => mySchema.parse({ name: 123 })).toThrow();
    });

    it("should allow flexible fields to be optional or different types", () => {
        // 'name' is strict, 'age' and 'isActive' are flexible
        const strictFields: { name: true } = { name: true };
        const mySchema = partiallyStrictObject(schema, strictFields);

        // Error: 'age' is provided but as a string
        expect(() => mySchema.parse({ name: "Alice", age: "invalid" })).toThrow();

        // Success: 'isActive' omitted
        expect(() => mySchema.parse({ name: "Alice", age: 30 })).not.toThrow();

        // Success: additional field 'extra' provided
        expect(() => mySchema.parse({ name: "Alice", extra: "whatever" })).not.toThrow();
    });

    it("should handle nested object schemas with partial strictness", () => {
        // Nested schema with user info
        const nestedSchema = {
            user: z.object({
                name: z.string(),
                profile: z.object({
                    nickname: z.string(),
                    location: z.string().optional(),
                }),
            }),
            version: z.number(),
        };

        // 'user' is strict (must be present), 'version' is flexible
        const strictFields = { user: true } as const;
        const mySchema = partiallyStrictObject(nestedSchema, strictFields);

        // Error: 'user' is missing
        expect(() => mySchema.parse({ version: 1 })).toThrow();

        // Success: 'user' is present, 'version' omitted
        expect(() =>
            mySchema.parse({
                user: { name: "Bob", profile: { nickname: "Bobby" } },
            })
        ).not.toThrow();

        // Success: 'location' is optional
        expect(() =>
            mySchema.parse({
                user: { name: "Bob", profile: { nickname: "Bobby" } },
                version: 1,
            })
        ).not.toThrow();

        // Error: 'nickname' has the wrong type
        expect(() =>
            mySchema.parse({
                user: { name: "Bob", profile: { nickname: 123 } },
                version: 1,
            })
        ).toThrow();
    });

    it("should handle union type within flexible fields", () => {
        // Modify isActive to accept either boolean or string
        const unionSchema = {
            name: z.string(),
            age: z.number(),
            isActive: z.union([z.boolean(), z.string()]),
        };

        // 'age' is strict, everything else is flexible
        const strictFields = { age: true } as const;
        const mySchema = partiallyStrictObject(unionSchema, strictFields);

        // Success: 'age' is present, 'isActive' can be omitted or union type
        expect(() => mySchema.parse({ age: 20 })).not.toThrow();
        expect(() => mySchema.parse({ age: 20, isActive: "active" })).not.toThrow();
        expect(() => mySchema.parse({ age: 20, isActive: false })).not.toThrow();

        // Error: 'age' is missing
        expect(() => mySchema.parse({ name: "NoAge" })).toThrow();
    });

    it("should throw error if unexpected strict field is missing or has extra unknown keys", () => {
        // Intentionally cast as any to test an unknownKey scenario
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const strictFields = { name: true, unknownKey: true } as any;
        const mySchema = partiallyStrictObject(schema, strictFields);

        // 'unknownKey' does not exist in the schema but is marked as strict
        // This should cause an error if we try to parse with unknownKey
        expect(() =>
            mySchema.parse({
                name: "Test",
                unknownKey: "someValue",
            })
        ).toThrow();
    });
});
