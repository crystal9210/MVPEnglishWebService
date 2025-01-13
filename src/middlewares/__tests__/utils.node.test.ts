/**
 * Confirmed all tests have passed at 2025/01/12.
 */
import { getClientIp } from "../utils";
import { NextRequest } from "next/server";

describe("getClientIp", () => {
    /**
     * Test: Verify that the function correctly extracts the first IP from the "x-forwarded-for" header
     */
    test("should return the first IP from 'x-forwarded-for' header", () => {
        // Mock a request with "x-forwarded-for" header containing multiple IPs
        const req = {
            headers: new Headers({
                "x-forwarded-for": "192.168.1.1, 10.0.0.1, 172.16.0.1",
            }),
        } as unknown as NextRequest;

        const ip = getClientIp(req);

        expect(ip).toBe("192.168.1.1");
    });

    /**
     * Test: Verify that the function returns the IP from "x-real-ip" header when "x-forwarded-for" is absent
     */
    test("should return IP from 'x-real-ip' header when 'x-forwarded-for' is not present", () => {
        // Mock a request with "x-real-ip" header
        const req = {
            headers: new Headers({
                "x-real-ip": "203.0.113.1",
            }),
        } as unknown as NextRequest;

        const ip = getClientIp(req);

        expect(ip).toBe("203.0.113.1");
    });

    /**
     * Test: Verify that the function prioritizes "x-forwarded-for" over "x-real-ip"
     */
    test("should prioritize 'x-forwarded-for' over 'x-real-ip' when both are present", () => {
        // Mock a request with both "x-forwarded-for" and "x-real-ip" headers
        const req = {
            headers: new Headers({
                "x-forwarded-for": "198.51.100.1, 192.0.2.1",
                "x-real-ip": "203.0.113.1",
            }),
        } as unknown as NextRequest;

        const ip = getClientIp(req);

        expect(ip).toBe("198.51.100.1");
    });

    /**
     * Test: Verify that the function returns "unknown" when both headers are missing
     */
    test("should return 'unknown' when neither 'x-forwarded-for' nor 'x-real-ip' headers are present", () => {
        // Mock a request with no relevant headers
        const req = {
            headers: new Headers({}),
        } as unknown as NextRequest;

        const ip = getClientIp(req);

        expect(ip).toBe("unknown");
    });

    /**
     * Test: Verify that the function handles empty "x-forwarded-for" header gracefully
     */
    test("should return 'unknown' when 'x-forwarded-for' header is empty", () => {
        // Mock a request with an empty "x-forwarded-for" header
        const req = {
            headers: new Headers({
                "x-forwarded-for": "",
            }),
        } as unknown as NextRequest;

        const ip = getClientIp(req);

        expect(ip).toBe("unknown");
    });

    /**
     * Test: Verify that the function trims spaces from the extracted IP
     */
    test("should trim spaces from the extracted IP", () => {
        // Mock a request with "x-forwarded-for" header containing spaces
        const req = {
            headers: new Headers({
                "x-forwarded-for": "  203.0.113.1  , 192.0.2.1  ",
            }),
        } as unknown as NextRequest;

        const ip = getClientIp(req);

        expect(ip).toBe("203.0.113.1");
    });
});
