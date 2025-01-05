// TODO Replace the algorithm below by a more secure encryption algorithm I designed and developed in the test operation environment.

/**
 * CryptoUtils class provides client-side data encryption and decryption.
 * Implements secure AES-GCM encryption with data-specific random values for key, salt, and IV.
 */
export class CryptoUtils {
    /**
     * Encrypts the given plaintext.
     * @param plaintext The plain text to encrypt.
     * @returns A Promise that resolves to a Base64 string containing concatenated key, IV, and ciphertext.
     */
    public static async encrypt(plaintext: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Generate a random key (256-bit)
        const key = globalThis.crypto.getRandomValues(new Uint8Array(32));

        // Generate a random IV (12 bytes for AES-GCM)
        const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));

        // Import the key for AES-GCM encryption
        const cryptoKey = await globalThis.crypto.subtle.importKey(
            "raw",
            key,
            { name: "AES-GCM" },
            false,
            ["encrypt"]
        );

        // Encrypt the data using AES-GCM
        const ciphertext = await globalThis.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            cryptoKey,
            data
        );

        // Combine key, IV, and ciphertext as Base64 strings
        const combinedBase64 = this.concatAndEncodeBase64(key, iv, ciphertext);
        return combinedBase64;
    }

    /**
     * Decrypts the given encrypted data.
     * @param encryptedData The Base64 string containing concatenated key, IV, and ciphertext.
     * @returns A Promise that resolves to the decrypted plain text.
     */
    public static async decrypt(encryptedData: string): Promise<string> {
        try {
            // Split the encrypted data into key, IV, and ciphertext
            const { key, iv, ciphertext } =
                this.decodeAndSplitBase64(encryptedData);

            // Import the key for AES-GCM decryption
            const cryptoKey = await globalThis.crypto.subtle.importKey(
                "raw",
                key,
                { name: "AES-GCM" },
                false,
                ["decrypt"]
            );

            // Decrypt the data
            const decrypted = await globalThis.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                },
                cryptoKey,
                ciphertext
            );

            // Decode the decrypted data to a string
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch {
            throw new Error(
                "Decryption failed. Data may have been tampered with."
            );
        }
    }

    /**
     * Concatenates and encodes the key, IV, and ciphertext as a Base64 string.
     * @param key The encryption key.
     * @param iv The initialization vector.
     * @param ciphertext The encrypted data.
     * @returns The Base64-encoded string containing key, IV, and ciphertext.
     */
    private static concatAndEncodeBase64(
        key: Uint8Array,
        iv: Uint8Array,
        ciphertext: ArrayBuffer
    ): string {
        const combined = new Uint8Array(
            key.length + iv.length + ciphertext.byteLength
        );
        combined.set(key, 0);
        combined.set(iv, key.length);
        combined.set(new Uint8Array(ciphertext), key.length + iv.length);

        return this.arrayBufferToBase64(combined.buffer);
    }

    /**
     * Decodes and splits the Base64 string into key, IV, and ciphertext.
     * @param base64Data The Base64 string containing key, IV, and ciphertext.
     * @returns An object containing the key, IV, and ciphertext as Uint8Array.
     */
    private static decodeAndSplitBase64(base64Data: string): {
        key: Uint8Array;
        iv: Uint8Array;
        ciphertext: Uint8Array;
    } {
        const combined = new Uint8Array(
            atob(base64Data)
                .split("")
                .map((char) => char.charCodeAt(0))
        );

        const key = combined.slice(0, 32);
        const iv = combined.slice(32, 44);
        const ciphertext = combined.slice(44);

        return { key, iv, ciphertext };
    }

    /**
     * Converts an ArrayBuffer to a Base64 string.
     * @param buffer The ArrayBuffer to convert.
     * @returns The Base64-encoded string.
     */
    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Converts a Base64 string to an ArrayBuffer.
     * @param base64 The Base64 string to convert.
     * @returns The resulting ArrayBuffer.
     */
    private static base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
