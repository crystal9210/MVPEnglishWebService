/* eslint-disable no-unused-vars */
/**
 * IEncryptionStrategy defines the interface for encryption strategies.
 */
export interface IEncryptionStrategy {
    encrypt(data: string): Promise<string>;
    decrypt(ciphertext: string): Promise<string>;
}

/**
 * AESGCMStrategy implements the IEncryptionStrategy interface using AES-GCM.
 */
export class AESGCMStrategy implements IEncryptionStrategy {
    private key: CryptoKey;
    private salt: Uint8Array;

    /**
     * Constructs an AESGCMStrategy.
     * @param key The AES-GCM CryptoKey
     */
    constructor(key: CryptoKey) {
        this.key = key;
    }

    /**
     * Encrypts plaintext data.
     * @param data The plaintext to encrypt
     * @returns The encrypted ciphertext as a Base64 string
     */
    async encrypt(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector

        const ciphertext = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            this.key,
            encodedData
        );

        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);

        // Convert to Base64 for storage/transmission
        return btoa(String.fromCharCode(...combined));
    }

    /**
     * Decrypts ciphertext data.
     * @param ciphertext The encrypted data as a Base64 string
     * @returns The decrypted plaintext
     */
    async decrypt(ciphertext: string): Promise<string> {
        const combined = Uint8Array.from(atob(ciphertext), (c) =>
            c.charCodeAt(0)
        );

        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            this.key,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }
}
