/**
 * NOW provides a default date value representing the current time at the time of object creation. (This field's value is determined dynamically when used.)
 * Usage: z.date().default(NOW)
 */
export const NOW = () => new Date();

/**
 * EPOCH_START represents the Unix epoch (January 1, 1970 00:00:00 UTC).
 * It serves as a default or placeholder value for dates when a specific date is not available or applicable. (This field's value is determined dynamically when used.)
 * Usage: z.date().default(EPOCH_START)
 */
export const EPOCH_START = () => new Date(0);
