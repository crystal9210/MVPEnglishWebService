// undefinedが渡せないケースに関しては undefined as unkown as stringとして回避 - そのような万が一の攻撃ケースも想定
import { DateTimeProvider } from "./dateTimeGenerator";
import { DateTime, DurationUnit } from "luxon";

describe("DateTimeProvider", () => {
    let provider: DateTimeProvider;

    beforeEach(() => {
        provider = new DateTimeProvider();
    });

    /* -----------------------------------------------------
     * Basic functionality and boundary checks
     * ----------------------------------------------------- */

    it("should return the current DateTime", () => {
        const now = provider.now();
        expect(now).toBeInstanceOf(DateTime);
        expect(now.isValid).toBe(true);
    });

    it("should throw an error for invalid, empty, or null timezone in nowISO", () => {
        expect(() => provider.nowISO("")).toThrow("Timezone cannot be an empty string.");
        expect(() => provider.nowISO("Invalid/Timezone")).toThrow("Invalid timezone provided.");

        // null・undefined: processed with default value of timezone.
        expect(() => provider.nowISO(null as unknown as string)).not.toThrow();
        expect(() => provider.nowISO(undefined)).not.toThrow();

        // confirmation of processing of null・undefined values.
        const nowISOWithNull = provider.nowISO(null as unknown as string);
        const nowISOWithUndefined = provider.nowISO(undefined);

        expect(typeof nowISOWithNull).toBe("string");
        expect(typeof nowISOWithUndefined).toBe("string");

        const dateTimeWithNull = DateTime.fromISO(nowISOWithNull);
        const dateTimeWithUndefined = DateTime.fromISO(nowISOWithUndefined);

        expect(dateTimeWithNull.zoneName).toBe("Asia/Tokyo");
        expect(dateTimeWithUndefined.zoneName).toBe("Asia/Tokyo");
    });

    it("should return the current time in a specific timezone", () => {
        const nowISO = provider.nowISO("America/New_York");
        const dateTime = DateTime.fromISO(nowISO, { zone: "America/New_York" });
        expect(dateTime.isValid).toBe(true);
        expect(dateTime.zoneName).toBe("America/New_York");
    });

    /* -----------------------------------------------------
     * fromISO
     * ----------------------------------------------------- */

    it("should convert ISO string to DateTime in the default timezone", () => {
        const isoString = "2024-06-19T15:30:00.000+09:00";
        const dateTime = provider.fromISO(isoString);
        expect(dateTime.isValid).toBe(true);
        expect(dateTime.toISO()).toBe(isoString);
    });

    it("should throw an error for invalid, empty, or null ISO string in fromISO", () => {
        expect(() => provider.fromISO("")).toThrow("Invalid ISO string provided.");
        expect(() => provider.fromISO(null as unknown as string)).toThrow("Invalid ISO string provided.");
        expect(() => provider.fromISO(undefined as unknown as string)).toThrow("Invalid ISO string provided.");
    });

    it("should convert ISO string to DateTime in a specific timezone", () => {
        const isoString = "2024-06-19T15:30:00.000+09:00";
        const dateTime = provider.fromISO(isoString, "America/New_York");
        expect(dateTime.isValid).toBe(true);
        expect(dateTime.zoneName).toBe("America/New_York");
    });

    /* -----------------------------------------------------
     * toISO
     * ----------------------------------------------------- */

    it("should convert a DateTime object to ISO string", () => {
        const now = provider.now();
        const isoString = provider.toISO(now);
        expect(typeof isoString).toBe("string");
        expect(DateTime.fromISO(isoString).isValid).toBe(true);
    });

    it("should throw an error for invalid DateTime object in toISO", () => {
        const invalidDateTime = DateTime.invalid("Invalid reason");
        expect(() => provider.toISO(invalidDateTime)).toThrow("Invalid DateTime object provided.");
    });

    /* -----------------------------------------------------
     * add / subtract
     * ----------------------------------------------------- */

    it("should add a duration to a DateTime object", () => {
        const now = provider.now();
        const newDate = provider.add(now, { days: 1 });
        expect(newDate.diff(now, "days").days).toBeCloseTo(1);
    });

    it("should subtract a duration from a DateTime object", () => {
        const now = provider.now();
        const newDate = provider.subtract(now, { days: 1 });
        expect(now.diff(newDate, "days").days).toBeCloseTo(1);
    });

    /* -----------------------------------------------------
     * diff
     * ----------------------------------------------------- */

    it("should calculate the difference between two DateTime objects in hours and minutes", () => {
        const start = provider.now();
        const end = provider.add(start, { hours: 2, minutes: 30 });
        const diff = provider.diff(start, end, ["hours", "minutes"]);
        expect(diff.hours).toBeCloseTo(2);
        expect(diff.minutes).toBeCloseTo(30);
    });

    it("should calculate the difference when start is after end", () => {
        const start = provider.now();
        const end = provider.subtract(start, { hours: 2 });
        const diff = provider.diff(start, end, ["hours", "minutes"]);
        expect(diff.hours).toBeCloseTo(-2);
    });

    it("should calculate the difference in seconds with casual accuracy", () => {
        const start = provider.now();
        const end = provider.add(start, { hours: 2 });
        const diff = provider.diff(start, end, "seconds", { conversionAccuracy: "casual" });
        expect(diff.seconds).toBeCloseTo(7200); // input value = 2 hours
    });

    it("should calculate the difference for non-integer durations with casual accuracy", () => {
        const start = provider.now();
        const end = provider.add(start, { hours: 1.5 });
        const diff = provider.diff(start, end, "seconds", { conversionAccuracy: "casual" });
        expect(diff.seconds).toBeCloseTo(5400); // input value = 1.5 hours
    });

    it("should calculate the difference in seconds with longterm accuracy", () => {
        const start = provider.now();
        const end = provider.add(start, { hours: 2 });
        const diff = provider.diff(start, end, "seconds", { conversionAccuracy: "longterm" });
        expect(diff.seconds).toBeCloseTo(7200);
    });

    it("should calculate the difference for negative intervals with longterm accuracy", () => {
        const start = provider.now();
        const end = provider.subtract(start, { hours: 2 });
        const diff = provider.diff(start, end, "seconds", { conversionAccuracy: "longterm" });
        expect(diff.seconds).toBeCloseTo(-7200); // -2 hours
    });

    it("should calculate the difference for intervals within the allowed range", () => {
        const start = provider.now();
        const end = provider.add(start, { years: 99 });
        const diff = provider.diff(start, end, "years");
        expect(diff.years).toBeCloseTo(99);

        const negativeEnd = provider.subtract(start, { years: 99 });
        const negativeDiff = provider.diff(start, negativeEnd, "years");
        expect(negativeDiff.years).toBeCloseTo(-99);
    });

    it("should throw an error for intervals exceeding the allowed range", () => {
        const start = provider.now();
        const end = provider.add(start, { years: 101 });
        expect(() => provider.diff(start, end, "years")).toThrow("Interval exceeds the allowed range of 100 years");

        const negativeEnd = provider.subtract(start, { years: 101 });
        expect(() => provider.diff(start, negativeEnd, "years")).toThrow("Interval exceeds the allowed range of 100 years");
    });

    it("should calculate the difference in seconds for large but valid intervals", () => {
        const start = provider.now();
        const end = provider.add(start, { years: 100 });
        const diff = provider.diff(start, end, "seconds");
        expect(diff.seconds).toBeGreaterThan(0);

        const negativeEnd = provider.subtract(start, { years: 100 });
        const negativeDiff = provider.diff(start, negativeEnd, "seconds");
        expect(negativeDiff.seconds).toBeLessThan(0);
    });

    it("should throw an error for invalid DateTime objects in diff", () => {
        const invalidDateTime = DateTime.invalid("Invalid reason");
        expect(() => provider.diff(invalidDateTime, provider.now())).toThrow();
    });

    /* -----------------------------------------------------
     * format / getFormattedNow
     * ----------------------------------------------------- */

    it("should format a DateTime object", () => {
        const now = provider.now();
        const formatted = provider.format(now, "yyyy-MM-dd HH:mm:ss");
        expect(typeof formatted).toBe("string");
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it("should get formatted current time in a specific timezone", () => {
        const formatted = provider.getFormattedNow("yyyy-MM-dd HH:mm:ss", "America/New_York");
        expect(typeof formatted).toBe("string");
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    /* -----------------------------------------------------
     * timezone management
     * ----------------------------------------------------- */

    it("should get user's timezone", () => {
        // As originally written, returns "America/New_York" for user1
        const timezone = provider.getUserTimezone("user1");
        expect(timezone).toBe("America/New_York");
    });

    it("should return default timezone for null or undefined user ID", () => {
        expect(provider.getUserTimezone(null as unknown as string)).toBe("Asia/Tokyo");
        expect(provider.getUserTimezone(undefined as unknown as string)).toBe("Asia/Tokyo");
    });

    it("should return the default timezone if user timezone is not found", () => {
        const timezone = provider.getUserTimezone("nonexistentUser");
        expect(timezone).toBe("Asia/Tokyo");
    });

    it("should get the default timezone", () => {
        expect(provider.timezone).toBe("Asia/Tokyo");
    });

    /* -----------------------------------------------------
     * Additional test cases in English
     * Non-standard, boundary, and extreme timezones
     * ----------------------------------------------------- */

    // Valid but extreme timezones
    it("should handle valid but non-standard timezones in nowISO", () => {
        const nowISO = provider.nowISO("Etc/GMT+12");
        const dateTime = DateTime.fromISO(nowISO, { zone: "Etc/GMT+12" });
        expect(dateTime.isValid).toBe(true);
        expect(dateTime.zoneName).toBe("Etc/GMT+12");

        const nowISOExtreme = provider.nowISO("Etc/GMT-14");
        const dateTimeExtreme = DateTime.fromISO(nowISOExtreme, { zone: "Etc/GMT-14" });
        expect(dateTimeExtreme.isValid).toBe(true);
        expect(dateTimeExtreme.zoneName).toBe("Etc/GMT-14");
    });

    // Boundary timezones (the earliest and near-latest "named" ones)
    it("should handle boundary timezones like Pacific/Kiritimati (UTC+14) and Pacific/Pago_Pago (UTC-11)", () => {
        const kiritimatiISO = provider.nowISO("Pacific/Kiritimati");
        const kiritimatiDateTime = DateTime.fromISO(kiritimatiISO, { zone: "Pacific/Kiritimati" });
        expect(kiritimatiDateTime.isValid).toBe(true);
        expect(kiritimatiDateTime.zoneName).toBe("Pacific/Kiritimati");

        const pagoPagoISO = provider.nowISO("Pacific/Pago_Pago");
        const pagoPagoDateTime = DateTime.fromISO(pagoPagoISO, { zone: "Pacific/Pago_Pago" });
        expect(pagoPagoDateTime.isValid).toBe(true);
        expect(pagoPagoDateTime.zoneName).toBe("Pacific/Pago_Pago");
    });

    /* -----------------------------------------------------
     * Non-existent or edge-case dates
     * ----------------------------------------------------- */

    // This test checks invalid (non-existent) date
    it("should throw an error for non-existent dates in fromISO", () => {
        expect(() => provider.fromISO("2024-02-30T12:00:00Z")).toThrow("Invalid ISO string provided.");
    });

    // Example: edge-case with leap day
    it("should handle a leap day correctly in fromISO", () => {
        // 2024 is a leap year, so 02-29 is valid
        const isoString = "2024-02-29T12:00:00Z";
        const dateTime = provider.fromISO(isoString);
        expect(dateTime.isValid).toBe(true);
        expect(dateTime.day).toBe(29);
    });

    /* -----------------------------------------------------
     * Extreme intervals tests
     * ----------------------------------------------------- */

    // ★ ここを修正 (±100 年以上はエラーを投げる仕様を守る)
    it("should calculate the difference for extremely large intervals", () => {
        // "10000 years" clearly exceeds the allowed range of 100 years => should throw an error
        const start = provider.now();
        const end = provider.add(start, { years: 10000 }); // extreme future
        expect(() => provider.diff(start, end, "years"))
            .toThrow("Interval exceeds the allowed range of 100 years");

        const negativeEnd = provider.subtract(start, { years: 10000 }); // extreme past
        expect(() => provider.diff(start, negativeEnd, "years"))
            .toThrow("Interval exceeds the allowed range of 100 years");
    });

    // Unsupported units
    it("should throw an error for unsupported units in diff", () => {
        const start = provider.now();
        const end = provider.add(start, { hours: 2 });
        expect(() => provider.diff(start, end, "fortnights" as unknown as DurationUnit))
            .toThrow("Invalid unit fortnights");
    });

    /* -----------------------------------------------------
     * Extended format testing
     * ----------------------------------------------------- */

    // Non-standard date formats
    it("should handle non-standard date formats in format", () => {
        const now = provider.now();
        const formatted = provider.format(now, "EEEE, MMMM dd yyyy HH:mm:ss");
        expect(typeof formatted).toBe("string");
        // EEEE => day of the week (e.g., Monday)
        // MMMM => month name (e.g., January)
        // dd => two-digit day
        // yyyy => four-digit year
        // HH:mm:ss => time
        expect(formatted).toMatch(/^\w+, \w+ \d{1,2} \d{4} \d{2}:\d{2}:\d{2}$/);
    });

    // Empty format string
    it("should throw an error for empty format string in format", () => {
        const now = provider.now();
        expect(() => provider.format(now, "")).toThrow("Format string cannot be empty.");
    });

    /* -----------------------------------------------------
     * DST transition example (optional if Luxon is enough)
     * ----------------------------------------------------- */
    it("should get 1 hour if we consider actual UTC difference", () => {
        const beforeDST = DateTime.fromISO("2024-03-10T01:30:00-08:00");
        const afterDST  = DateTime.fromISO("2024-03-10T03:30:00-07:00");
        const diff = provider.diff(beforeDST, afterDST, "hours", { conversionAccuracy: "casual" /* or anything */, useLocalDST: false });
        expect(Math.round(diff.hours!)).toBe(1);
    });
    it("should handle DST transitions (example) in America/Los_Angeles", () => {
        // Example date for DST start (Spring forward) in 2024: March 10, 2024
        // The transition usually happens at 2:00 AM local time -> 3:00 AM.
        const isoBeforeDST = "2024-03-10T01:30:00-08:00"; // PST
        const isoAfterDST  = "2024-03-10T03:30:00-07:00"; // PDT
        const beforeDST = DateTime.fromISO(isoBeforeDST).setZone("America/Los_Angeles");
        const afterDST = DateTime.fromISO(isoAfterDST).setZone("America/Los_Angeles");

        // Confirm both times are valid in their respective offsets.
        expect(beforeDST.isValid).toBe(true);
        expect(afterDST.isValid).toBe(true);

        // Using provider.diff() to check the difference.
        // From 1:30 AM PST to 3:30 AM PDT is effectively 2 hours (even though clock jumps).
        const diff = provider.diff(beforeDST, afterDST, "hours", { useLocalDST: true });
        // Some libraries handle ambiguous times differently, so an approximate check is used.
        expect(Math.round(diff.hours!)).toBe(2);
    });
});
