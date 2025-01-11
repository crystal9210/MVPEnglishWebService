/**
 * All tests have passed at 2025/01/11.
 */

import { isDev, isHttpForDev, shouldEnforceHttps } from "../envConfig";

describe("Environment Configuration Functions", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules(); // Clear cache
        process.env = { ...originalEnv }; // Clone original environment
    });

    afterAll(() => {
        process.env = originalEnv; // Restore original environment
    });

    /**
     * Test for isDev function.
     * Verifies that isDev returns true when NODE_ENV is not 'production'.
     */
    test("isDev should return true when NODE_ENV is not 'production'", () => {
        (process.env as any).NODE_ENV = "development";
        expect(isDev()).toBe(true);

        (process.env as any).NODE_ENV = "test";
        expect(isDev()).toBe(true);

        (process.env as any).NODE_ENV = undefined;
        expect(isDev()).toBe(true);
    });

    /**
     * Test for isDev function.
     * Verifies that isDev returns false when NODE_ENV is 'production'.
     */
    test("isDev should return false when NODE_ENV is 'production'", () => {
        (process.env as any).NODE_ENV = "production";
        expect(isDev()).toBe(false);
    });

    /**
     * Test for isHttpForDev function.
     * Verifies that isHttpForDev returns true when USE_HTTP_DEV is 'true'.
     */
    test("isHttpForDev should return true when USE_HTTP_DEV is 'true'", () => {
        (process.env as any).USE_HTTP_DEV = "true";
        expect(isHttpForDev()).toBe(true);
    });

    /**
     * Test for isHttpForDev function.
     * Verifies that isHttpForDev returns false when USE_HTTP_DEV is not 'true'.
     */
    test("isHttpForDev should return false when USE_HTTP_DEV is not 'true'", () => {
        (process.env as any).USE_HTTP_DEV = "false";
        expect(isHttpForDev()).toBe(false);

        (process.env as any).USE_HTTP_DEV = undefined;
        expect(isHttpForDev()).toBe(false);
    });

    /**
     * Test for shouldEnforceHttps function.
     * Verifies that shouldEnforceHttps returns true when not in development.
     */
    test("shouldEnforceHttps should return true when not in development", () => {
        (process.env as any).NODE_ENV = "production";
        expect(shouldEnforceHttps()).toBe(true);
    });

    /**
     * Test for shouldEnforceHttps function.
     * Verifies that shouldEnforceHttps returns false when in development.
     */
    test("shouldEnforceHttps should return false when in development", () => {
        (process.env as any).NODE_ENV = "development";
        expect(shouldEnforceHttps()).toBe(false);
    });
});
