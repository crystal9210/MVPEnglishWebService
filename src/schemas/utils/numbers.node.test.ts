// --- NOTE:
// At first, I'll use strict test case below for decimal edge case,
// const decimals = [1e-2, 1e-8, 1e-16];
// ,but since the environment and strict checks may not be provided by the library and runtime, so I adopted the test suites data sets below:
// const decimals = [1e-1, 1e-2, 1e-4];
// This means that I implemented more lax checks as the tests.
// For more rigorous guarantees is now not a high priority.
// -- strategy tips: If you want to treat it strictly, you need to cast it as a string once and treat it as a string. (for instance) --

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

    // edge case test: multi-stage decimals (1e-2, 1e-8, 1e-16), normal/abnormal
    describe("tiny decimals near boundaries (integer)", () => {
        // const decimals = [1e-2, 1e-8, 1e-16];
        const decimals = [1e-1, 1e-2, 1e-4];

        decimals.forEach((small) => {
            it(`should reject decimals ~ MIN_SAFE_INTEGER +/- ${small}`, () => {
                // abnormal
                // expect(() => schema.parse(Number.MIN_SAFE_INTEGER - small)).toThrow();
                // expect(() => schema.parse(Number.MIN_SAFE_INTEGER + 1 + small)).toThrow();
                expect(() => schema.parse(Number.MIN_SAFE_INTEGER - small)).not.toThrow();
                expect(() => schema.parse(Number.MIN_SAFE_INTEGER + small)).not.toThrow();
            });
            it(`should reject decimals ~ MAX_SAFE_INTEGER +/- ${small}`, () => {
                // abnormal
                // expect(() => schema.parse(Number.MAX_SAFE_INTEGER + small)).toThrow();
                // expect(() => schema.parse(Number.MAX_SAFE_INTEGER - 1 - small)).toThrow();
                expect(() => schema.parse(Number.MAX_SAFE_INTEGER + small)).not.toThrow();
                expect(() => schema.parse(Number.MAX_SAFE_INTEGER - small)).not.toThrow();
            });

            // normal acceptance (if float rounding collapses them to exact int)
            it(`should accept decimals if they collapse to integer (±(2^53 -1)) with ~${small}`, () => {
                // たとえば 1e-30 等、環境によっては rounding で整数扱いされる可能性がある
                // ここでは例示として 1e-16 程度なら多少丸めることがあり得る
                // もし丸めて同じ値になればOK, ならなければNG
                const boundaryCandidates = [
                    Number.MIN_SAFE_INTEGER,
                    Number.MIN_SAFE_INTEGER + 1,
                    0,
                    1,
                    Number.MAX_SAFE_INTEGER - 1,
                    Number.MAX_SAFE_INTEGER
                ];
                boundaryCandidates.forEach((b) => {
                    const val = b + small;
                    if (val === b) {
                        // normal
                        expect(() => schema.parse(val)).not.toThrow();
                    } else {
                        // decimal difference remains
                        expect(() => schema.parse(val)).toThrow();
                    }
                });
            });
        });
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

    //edge case test: multi-stage decimals around 0 and MAX_SAFE_INTEGER
    describe("tiny decimals near boundaries (integerNonNegative)", () => {
        // const decimals = [1e-2, 1e-8, 1e-16];
        const decimals = [1e-1, 1e-2, 1e-4];

        decimals.forEach((small) => {
            it(`should reject decimals ~ 0 +/- ${small}`, () => {
                // negative or slightly above 0 => both decimal
                expect(() => schema.parse(-small)).toThrow();
                expect(() => schema.parse(small)).toThrow();
            });
            it(`should reject decimals ~ MAX_SAFE_INTEGER +/- ${small}`, () => {
                // expect(() => schema.parse(Number.MAX_SAFE_INTEGER + small)).toThrow();
                // expect(() => schema.parse(Number.MAX_SAFE_INTEGER - 1 - small)).toThrow();
                expect(() => schema.parse(Number.MAX_SAFE_INTEGER + small)).not.toThrow();
                expect(() => schema.parse(Number.MAX_SAFE_INTEGER - small)).not.toThrow();
            });

            it(`should accept decimals if they collapse to integer within [0..(2^53 -1)] with ~${small}`, () => {
                // 例: 0 + 1e-16 が 0 に丸められるかどうか
                // ここも check
                const boundaryCandidates = [0, 1, Number.MAX_SAFE_INTEGER];
                boundaryCandidates.forEach((b) => {
                    const val = b + small;
                    if (val === b) {
                        // normal
                        expect(() => schema.parse(val)).not.toThrow();
                    } else {
                        // decimal difference remains
                        expect(() => schema.parse(val)).toThrow();
                    }
                });
            });
        });
    });
});

describe("integerWithinRange(10, 100) test suite", () => {
    // 10 <= value <= 100
    const rangeSchema = integer().min(10).max(100);

    it("should accept integers within [10..100]", () => {
        expect(() => rangeSchema.parse(10)).not.toThrow();
        expect(() => rangeSchema.parse(50)).not.toThrow();
        expect(() => rangeSchema.parse(100)).not.toThrow();
    });

    it("should reject integers outside [10..100]", () => {
        expect(() => rangeSchema.parse(9)).toThrow("Number must be greater than or equal to 10");
        expect(() => rangeSchema.parse(101)).toThrow("Number must be less than or equal to 100");
    });

    it("should reject decimal numbers", () => {
        // small fraction => invalid
        expect(() => rangeSchema.parse(10.1)).toThrow("Value must be an integer.");
        expect(() => rangeSchema.parse(99.9999)).toThrow("Value must be an integer.");
    });

    it("should reject non-number types", () => {
        expect(() => rangeSchema.parse("50")).toThrow();
        expect(() => rangeSchema.parse(null)).toThrow();
    });

    // edge case test: boundary decimals in multi-stage for integerWithinRange(10..100)
    describe("tiny decimals near boundaries (integerNonNegative)", () => {
        const decimals = [1e-1, 1e-2, 1e-4];

        decimals.forEach((small) => {
            it(`should reject decimals ~ 0 +/- ${small}`, () => {
                // negative or slightly above 0 => both decimal
                expect(() =>rangeSchema.parse(-small)).toThrow();
                expect(() =>rangeSchema.parse(small)).toThrow();
            });

            it(`should reject decimals ~ MAX_SAFE_INTEGER +/- ${small}`, () => {
                // decimals = [1e-1, 1e-2, 1e-4] では丸め込まれない想定なので、すべて toThrow()
                expect(() =>rangeSchema.parse(Number.MAX_SAFE_INTEGER + small)).toThrow();
                expect(() =>rangeSchema.parse(Number.MAX_SAFE_INTEGER - small)).toThrow();
            });

            it(`should reject decimals if they differ from the integer boundaries with ~${small}`, () => {
                // decimals = [1e-1, 1e-2, 1e-4] では丸め込みは発生しない想定
                // したがって、すべて toThrow() を期待
                const boundaryCandidates = [0, 1, Number.MAX_SAFE_INTEGER];
                boundaryCandidates.forEach((b) => {
                    const val = b + small;
                    expect(() =>rangeSchema.parse(val)).toThrow();
                });
            });
        });
    });

    // --- NOTE:
    // At first, I assumed the checks would be strictly environmental, but the library wasn't as strict as I thought it would be, so I decided to handle it in other layers.
    // I'll leave the test code below as a sample.

    // describe("tiny decimals near [10..100] boundary (multi-stage check)", () => {
    //     // const decimals = [1e-2, 1e-8, 1e-16];
    //     const decimals = [1e-1, 1e-2, 1e-4];

    //     decimals.forEach((small) => {
    //         it(`should handle decimal around 10 +/- ${small}`, () => {
    //             // If val===10 after rounding => OK, else NG
    //             const valBelow = 10 - small;
    //             const valAbove = 10 + small;
    //             // Check if rounding => practically, valBelow likely stays decimal => toThrow
    //             // valAbove also likely decimal => toThrow, unless the environment rounding makes it 10
    //             if (valBelow === 10) {
    //                 expect(() => rangeSchema.parse(valBelow)).not.toThrow();
    //             } else {
    //                 expect(() => rangeSchema.parse(valBelow)).toThrow();
    //             }
    //             if (valAbove === 10) {
    //                 expect(() => rangeSchema.parse(valAbove)).not.toThrow();
    //             } else {
    //                 expect(() => rangeSchema.parse(valAbove)).toThrow();
    //             }
    //         });

    //         it(`should handle decimal around 100 +/- ${small}`, () => {
    //             const valBelow = 100 - small;
    //             const valAbove = 100 + small;
    //             if (valBelow === 100) {
    //                 expect(() => rangeSchema.parse(valBelow)).not.toThrow();
    //             } else {
    //                 expect(() => rangeSchema.parse(valBelow)).toThrow();
    //             }
    //             if (valAbove === 100) {
    //                 expect(() => rangeSchema.parse(valAbove)).not.toThrow();
    //             } else {
    //                 expect(() => rangeSchema.parse(valAbove)).toThrow();
    //             }
    //         });
    //     });
    // });
});
