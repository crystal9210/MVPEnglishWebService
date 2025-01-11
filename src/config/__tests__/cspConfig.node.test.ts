/**
 * All tests have passed at 2025/01/11.
 */

import { generateCspString } from "../cspConfig";
import { isDev } from "../envConfig";

jest.mock("../envConfig", () => ({
    isDev: jest.fn(),
}));

describe("generateCspString", () => {
    const fixedNonce = "test-nonce";

    it("should return CSP_DEV when isDev is true", () => {
        (isDev as jest.Mock).mockReturnValue(true);
        const csp = generateCspString(fixedNonce);
        expect(csp).toContain("'unsafe-inline'");
        expect(csp).toContain(`'nonce-${fixedNonce}'`);
    });

    it("should return CSP_PROD when isDev is false", () => {
        (isDev as jest.Mock).mockReturnValue(false);
        const csp = generateCspString(fixedNonce);
        expect(csp).not.toContain("'unsafe-inline'");
        expect(csp).toContain(`'nonce-${fixedNonce}'`);
    });
});
