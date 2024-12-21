import { DateSchema, OptionalDateSchema } from "./dates";
import { z, ZodError } from "zod";

describe("Date Schema Tests", () => {
    describe("DateSchema", () => {
        it("should parse a valid Date object without errors", () => {
            // Verify that a valid Date object is parsed correctly
            const date = new Date();
            expect(() => DateSchema.parse(date)).not.toThrow();
            const parsedDate = DateSchema.parse(date);
            expect(parsedDate).toBeInstanceOf(Date);
            expect(parsedDate).toEqual(date);
        });

        it("should default to NOW when parsing undefined", () => {
            // Verify that undefined input defaults to the current date and time
            const beforeParse = Date.now();
            const parsedDate = DateSchema.parse(undefined);
            const afterParse = Date.now();

            expect(parsedDate).toBeInstanceOf(Date);
            expect(parsedDate.getTime()).toBeGreaterThanOrEqual(beforeParse);
            expect(parsedDate.getTime()).toBeLessThanOrEqual(afterParse);
        });

        it("should throw an error for invalid date inputs", () => {
            // Verify that invalid inputs throw a ZodError
            const invalidInputs: unknown[] = [
                "Invalid Date",
                "abc",
                123,
                {},
                [],
                true,
                Symbol(),
                () => {},
                BigInt(123)
            ];

            invalidInputs.forEach(input => {
                expect(() => DateSchema.parse(input)).toThrow(ZodError);
            });
        });

        it("should handle edge date values within safe integer range", () => {
            // Verify that dates within the safe integer range are parsed correctly
            const maxSafeDate = new Date(8640000000000000); // Maximum safe date
            const minSafeDate = new Date(-8640000000000000); // Minimum safe date

            expect(() => DateSchema.parse(maxSafeDate)).not.toThrow();
            expect(() => DateSchema.parse(minSafeDate)).not.toThrow();
        });

        it("should throw an error for dates beyond the safe integer range", () => {
            // Verify that dates beyond the safe integer range throw a ZodError
            const invalidDates: Date[] = [
                new Date(8640000000000001),
                new Date(-8640000000000001)
            ];

            invalidDates.forEach(date => {
                expect(() => DateSchema.parse(date)).toThrow(ZodError);
            });
        });

        it("should provide accurate error messages for invalid types", () => {
            // Verify that the error message is accurate for invalid types
            try {
                DateSchema.parse("not a date");
            } catch (error: unknown) {
                if (error instanceof ZodError) {
                    expect(error.errors[0].message).toMatch(/Expected date, received string/);
                } else {
                    fail("Unexpected error type caught");
                }
            }
        });

        it("should handle different date formats correctly", () => {
            // Verify that different date formats are handled correctly
            const isoDate = "2023-12-31T23:59:59.999Z";
            const unixTimestamp = Date.now();

            expect(() => DateSchema.parse(new Date(isoDate))).not.toThrow();
            expect(DateSchema.parse(new Date(isoDate))).toEqual(new Date(isoDate));

            expect(() => DateSchema.parse(new Date(unixTimestamp))).not.toThrow();
            expect(DateSchema.parse(new Date(unixTimestamp))).toEqual(new Date(unixTimestamp));
        });
    });

    describe("Optional Date Schemas", () => {
        it("should parse a valid Date object without errors for OptionalDateSchema", () => {
            // Verify that OptionalDateSchema parses a valid Date object correctly
            const date = new Date();
            expect(() => OptionalDateSchema.parse(date)).not.toThrow();
            const parsedOptionalDate = OptionalDateSchema.parse(date);
            expect(parsedOptionalDate).toBeInstanceOf(Date);
            expect(parsedOptionalDate).toEqual(date);
        });

        it("should default to EPOCH_START when parsing undefined for OptionalDateSchema", () => {
            // Verify that undefined input defaults to EPOCH_START for OptionalDateSchema
            const epochStart = new Date(0);
            expect(OptionalDateSchema.parse(undefined)).toEqual(epochStart);
        });

        it("should throw an error when parsing null for OptionalDateSchema", () => {
            // Verify that OptionalDateSchema throws an error when parsing null
            expect(() => OptionalDateSchema.parse(null)).toThrow(ZodError);
        });

        it("should throw an error for invalid inputs for OptionalDateSchema", () => {
            // Verify that invalid inputs throw a ZodError for OptionalDateSchema
            const invalidInputs: unknown[] = [
                "Invalid Date",
                "abc",
                123,
                {},
                [],
                true,
                Symbol(),
                () => {},
                BigInt(123)
            ];

            invalidInputs.forEach(input => {
                expect(() => OptionalDateSchema.parse(input)).toThrow(ZodError);
            });
        });

        it("should handle default values correctly for OptionalDateSchema", () => {
            // Verify that the default value is correctly set for OptionalDateSchema
            const defaultDate = new Date(0);
            expect(OptionalDateSchema.parse(undefined)).toEqual(defaultDate);
        });

        it("should parse a valid Date object without errors for NullableOptionalDateSchema", () => {
            // Verify that NullableOptionalDateSchema parses a valid Date object correctly
            const date = new Date();
            const NullableOptionalDateSchema = z.date().nullable().optional().default(new Date(0));
            expect(() => NullableOptionalDateSchema.parse(date)).not.toThrow();
            const parsedNullableOptionalDate = NullableOptionalDateSchema.parse(date);
            expect(parsedNullableOptionalDate).toBeInstanceOf(Date);
            expect(parsedNullableOptionalDate).toEqual(date);
        });

        it("should default to EPOCH_START when parsing undefined for NullableOptionalDateSchema", () => {
            // Verify that undefined input defaults to EPOCH_START for NullableOptionalDateSchema
            const epochStart = new Date(0);
            const NullableOptionalDateSchema = z.date().nullable().optional().default(new Date(0));
            expect(NullableOptionalDateSchema.parse(undefined)).toEqual(epochStart);
        });

        it("should return null when parsing null for NullableOptionalDateSchema", () => {
            // Verify that NullableOptionalDateSchema returns null when parsing null
            const NullableOptionalDateSchema = z.date().nullable().optional().default(new Date(0));
            expect(NullableOptionalDateSchema.parse(null)).toEqual(null);
        });

        it("should throw an error for invalid inputs for NullableOptionalDateSchema", () => {
            // Verify that invalid inputs throw a ZodError for NullableOptionalDateSchema
            const NullableOptionalDateSchema = z.date().nullable().optional().default(new Date(0));
            const invalidInputs: unknown[] = [
                "Invalid Date",
                "abc",
                123,
                {},
                [],
                true,
                Symbol(),
                () => {},
                BigInt(123)
            ];

            invalidInputs.forEach(input => {
                expect(() => NullableOptionalDateSchema.parse(input)).toThrow(ZodError);
            });
        });

        it("should handle default values correctly for NullableOptionalDateSchema", () => {
            // Verify that the default value is correctly set for NullableOptionalDateSchema when undefined is passed
            const defaultDate = new Date(0);
            const NullableOptionalDateSchema = z.date().nullable().optional().default(new Date(0));
            expect(NullableOptionalDateSchema.parse(undefined)).toEqual(defaultDate);
            expect(NullableOptionalDateSchema.parse(null)).toEqual(null);
        });
    });

    describe("Enhanced Date Schema Tests", () => {
        it("should handle dates in different timezones correctly", () => {
            // Verify that dates in different timezones are handled correctly
            const dateInUTC = new Date("1996-12-01T00:00:00.000Z"); // UTC
            const dateInEST = new Date("1996-12-01T00:00:00.000-05:00"); // EST
            expect(DateSchema.parse(dateInUTC)).toEqual(new Date("1996-12-01T00:00:00.000Z"));
            expect(DateSchema.parse(dateInEST)).toEqual(new Date("1996-12-01T00:00:00.000-05:00"));
        });

        it("should validate dates with custom refinement", () => {
            // Verify that custom refinements work correctly
            const ModernDateSchema = z.date().refine((date) => date > new Date('2000-01-01'), {
                message: "Date must be after the year 2000"
            });

            expect(() => ModernDateSchema.parse(new Date('1999-12-31'))).toThrow(ZodError);
            expect(() => ModernDateSchema.parse(new Date('2001-01-01'))).not.toThrow();
            expect(ModernDateSchema.parse(new Date('2001-01-01'))).toBeInstanceOf(Date);
        });

        it("should handle extremely large/small date strings gracefully", () => {
            // Verify that extremely large/small date strings throw ZodError
            expect(() => DateSchema.parse("9999999999-12-31")).toThrow(ZodError);
            expect(() => DateSchema.parse("-9999999999-01-01")).toThrow(ZodError);
        });

        it("should have default NOW value within a small time frame", () => {
            // Verify that the default NOW value is within an acceptable time frame
            const beforeParse = Date.now();
            const parsedDate = DateSchema.parse(undefined);
            const afterParse = Date.now();

            expect(parsedDate).toBeInstanceOf(Date);
            expect(parsedDate.getTime()).toBeGreaterThanOrEqual(beforeParse);
            expect(parsedDate.getTime()).toBeLessThanOrEqual(afterParse);
        });

        it("should correctly handle UNIX timestamps", () => {
            // Verify that UNIX timestamps are handled correctly
            const unixTimestamp = 1672531199000; // 2023-01-01T00:59:59.000Z
            const date = new Date(unixTimestamp);
            expect(() => DateSchema.parse(date)).not.toThrow();
            expect(DateSchema.parse(date)).toEqual(date);
        });
    });

    describe("Security and Edge Case Tests", () => {
        it("should prevent prototype pollution via DateSchema", () => {
            // Attempt prototype pollution and verify that DateSchema is secure
            const maliciousInput = JSON.parse('{"__proto__": {"polluted": "yes"}}') as Record<string, unknown>;
            expect(() => DateSchema.parse(maliciousInput)).toThrow(ZodError);
            const testObject: Record<string, unknown> = {};
            expect(testObject["polluted"]).toBeUndefined();
        });

        it("should handle non-standard Date objects securely", () => {
            // Verify that non-standard Date objects are handled securely
            const fakeDate: Partial<Date> = {
                getTime: () => Date.now(),
                // Other Date methods are missing
            } as Partial<Date> & { getTime: () => number };
            expect(() => DateSchema.parse(fakeDate as Date)).toThrow(ZodError);
        });

        it("should ignore additional properties on Date objects", () => {
            // Verify that additional properties on Date objects are ignored
            const dateWithExtraProp = Object.assign(new Date(), { extra: "property" }) as Date & { extra?: string };
            const parsedDate = DateSchema.parse(dateWithExtraProp);
            expect(parsedDate).toBeInstanceOf(Date);
            expect((parsedDate as unknown as { extra?: string }).extra).toBeUndefined(); // 'extra' property should be ignored
        });

        it("should throw an error when additional properties are present on Date objects using StrictDateSchema", () => {
            // Verify that additional properties are not allowed when using a strict schema
            const StrictDateSchema = z.object({
                date: z.date()
            }).strict();

            const dateWithExtraProp = { date: new Date(), extra: "property" };
            expect(() => StrictDateSchema.parse(dateWithExtraProp)).toThrow(ZodError);
        });
    });
});
