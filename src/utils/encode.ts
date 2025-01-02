import { escape, unescape } from "querystring";

/**
 * @param str Encode Unicode string to Base64 encoding.
 * @param str Unicode string to be encoded.
 * @returns Base64 encoded string.
 */
export function encodeBase64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
}

/**
 * @param str Decode Base64-encoded string to Unicode string.
 * @param str Base64-encoded string to be decoded.
 * @returns Decoded Unicode string.
 */
export function decodeBase64(str: string): string {
    return decodeURIComponent(escape(atob(str)));
}
