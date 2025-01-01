import {
    CRYPTO_PARAMETERS,
    DeriveKeyOptions,
    DeriveKeyOptionsSchema,
} from "@/constants/cryptoTypes";

/**
 * DeriveKeyResult represents the result of the deriveKey function.
 */
export interface DeriveKeyResult {
    key: CryptoKey;
    salt: Uint8Array;
}

/**
 * deriveKey derives a cryptographic key from a passphrase using PBKDF2.
 * @param options DeriveKeyOptionsType including passphrase and optional parameters
 * @returns A promise that resolves to the derived key and salt
 */
export const deriveKey = async (
    options: DeriveKeyOptions
): Promise<DeriveKeyResult> => {
    const parsedOptions = DeriveKeyOptionsSchema.parse(options);

    const {
        passphrase,
        saltLength = CRYPTO_PARAMETERS.SALT_LENGTH,
        iterations = CRYPTO_PARAMETERS.PBKDF2_ITERATIONS,
        hash = CRYPTO_PARAMETERS.PBKDF2_HASH,
        keyLength = CRYPTO_PARAMETERS.AES_KEY_LENGTH,
    } = parsedOptions;

    const salt = window.crypto.getRandomValues(new Uint8Array(saltLength));

    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const key = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: iterations, // TODO modified the num for the best security and operation performance tradeoffs.
            hash: hash,
        },
        keyMaterial,
        { name: "AES-GCM", length: keyLength },
        false,
        ["encrypt", "decrypt"]
    );
    return { key, salt };
};
