import { integer, integerNonNegative } from "./numbers";

describe("integer() test suite", () => {
    const schema = integer();

    it("should accept safe integers", () => {
        // In-range integers, both positive and negative
        expect(() => schema.parse(0)).not.toThrow();
        expect(() => schema.parse(100)).not.toThrow();
        expect(() => schema.parse(-9999999999)).not.toThrow();
    });

    // checking exact MIN_SAFE_INTEGER, MAX_SAFE_INTEGER, and +/- 1
    it("should accept boundary integer values exactly", () => {
        // Exactly Number.MIN_SAFE_INTEGER
        expect(() => schema.parse(Number.MIN_SAFE_INTEGER)).not.toThrow();
        // One above MIN_SAFE_INTEGER
        expect(() => schema.parse(Number.MIN_SAFE_INTEGER + 1)).not.toThrow();

        // Exactly Number.MAX_SAFE_INTEGER
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER)).not.toThrow();
        // One below MAX_SAFE_INTEGER
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER - 1)).not.toThrow();
    });

    it("should reject values outside safe integer range", () => {
        // Beyond Number.MAX_SAFE_INTEGER
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow();
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER * 2)).toThrow();
        // Below Number.MIN_SAFE_INTEGER
        expect(() => schema.parse(Number.MIN_SAFE_INTEGER - 1)).toThrow();
        expect(() => schema.parse(Number.MIN_SAFE_INTEGER * 2)).toThrow();
    });

    it("should reject decimal numbers", () => {
        // .int(...) check
        expect(() => schema.parse(12.34)).toThrow("Value must be an integer.");
        expect(() => schema.parse(-3.14)).toThrow("Value must be an integer.");
    });

    it("should reject non-number types", () => {
        // Strings, booleans, null, etc.
        expect(() => schema.parse("100")).toThrow();
        expect(() => schema.parse(true)).toThrow();
        expect(() => schema.parse(null)).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
        expect(() => schema.parse({})).toThrow();
        expect(() => schema.parse([])).toThrow();
    });

    it("should allow further chained constraints", () => {
        // confirmation of integer schema being able to chain duplicate methods like .min(), .max(), or .default().
        const extended = schema.min(0).max(100);
        expect(() => extended.parse(50)).not.toThrow(); // valid
        expect(() => extended.parse(101)).toThrow();    // above max
        expect(() => extended.parse(-1)).toThrow();     // below min
    });
});

describe("integerNonNegative() test suite", () => {
    const schema = integerNonNegative();

    it("should accept non-negative safe integers", () => {
        expect(() => schema.parse(0)).not.toThrow();
        expect(() => schema.parse(500000)).not.toThrow();
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    it("should accept boundary integer values exactly", () => {
        // 0 is already tested, but we show explicit boundary checks
        // One above 0
        expect(() => schema.parse(1)).not.toThrow();

        // Exactly Number.MAX_SAFE_INTEGER
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER)).not.toThrow();
        // One below Number.MAX_SAFE_INTEGER
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER - 1)).not.toThrow();
    });

    it("should reject negative integers", () => {
        // integerNonNegative schema needs value >= 0
        expect(() => schema.parse(-1)).toThrow("Value must be >= 0.");
        expect(() => schema.parse(-9999)).toThrow();
        expect(() => schema.parse(Number.MIN_SAFE_INTEGER * 2)).toThrow();
    });

    it("should reject values above MAX_SAFE_INTEGER", () => {
        // Over Number.MAX_SAFE_INTEGER
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow();
        expect(() => schema.parse(Number.MAX_SAFE_INTEGER * 2)).toThrow();
    });

    it("should reject decimal numbers", () => {
        expect(() => schema.parse(1.23)).toThrow("Value must be an integer.");
        expect(() => schema.parse(-0.1)).toThrow("Value must be an integer.");
    });

    it("should reject non-number types", () => {
        expect(() => schema.parse("123")).toThrow();
        expect(() => schema.parse(null)).toThrow();
        expect(() => schema.parse(undefined)).toThrow();
        expect(() => schema.parse({})).toThrow();
        expect(() => schema.parse([])).toThrow();
    });

    it("allows chaining extra constraints", () => {
        // For instance: requiring value <= 100
        const limited = schema.max(100, "Value must be <= 100.");
        expect(() => limited.parse(50)).not.toThrow();
        expect(() => limited.parse(101)).toThrow("Value must be <= 100.");
    });
});
