import { INSERT_POSITIONS } from "@/constants/cryptoTypes";

/**
 * CryptoUtils class provides client-side data encryption and decryption.
 * It generates a unique key, salt, and IV for each data entry without using a passphrase.
 */
export class CryptoUtils {
    // Store the key in memory; it will be lost upon page reload
    private static key: CryptoKey | null = null;

    /**
     * Encrypts the given plaintext.
     * @param plaintext The plain text to encrypt.
     * @returns A Promise that resolves to the Base64-encoded encrypted data string.
     */
    public static async encrypt(plaintext: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Generate a random key (256-bit)
        const keyData = window.crypto.getRandomValues(new Uint8Array(32));
        const key = await window.crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
        this.key = key; // Store the key in memory

        // Generate a random salt (16 bytes)
        const salt = window.crypto.getRandomValues(new Uint8Array(16));

        // Derive the key using PBKDF2 with the salt
        const derivedKey = await this.deriveKey(key, salt);

        // Generate a random IV (12 bytes)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Encrypt the data using AES-GCM
        const ciphertext = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            derivedKey,
            data
        );

        // Encode the ciphertext to Base64
        let ciphertextBase64 = this.arrayBufferToBase64(ciphertext);

        // Encode the salt and IV to Base64
        const saltBase64 = this.arrayBufferToBase64(salt.buffer);
        const ivBase64 = this.arrayBufferToBase64(iv.buffer);

        // Note: Embedding the key poses a security risk and is omitted.

        // Insert the salt and IV into specified positions
        ciphertextBase64 = this.insertDataAtPositions(
            ciphertextBase64,
            saltBase64,
            INSERT_POSITIONS
        );
        ciphertextBase64 = this.insertDataAtPositions(
            ciphertextBase64,
            ivBase64,
            INSERT_POSITIONS
        );

        return ciphertextBase64;
    }

    /**
     * Decrypts the given encrypted data.
     * @param encryptedData The Base64-encoded encrypted data string.
     * @returns A Promise that resolves to the decrypted plain text.
     */
    public static async decrypt(encryptedData: string): Promise<string> {
        // Calculate the lengths of the Base64-encoded salt and IV
        const saltBase64Length = this.arrayBufferToBase64(
            new Uint8Array(16).buffer
        ).length; // 16-byte salt
        const ivBase64Length = this.arrayBufferToBase64(
            new Uint8Array(12).buffer
        ).length; // 12-byte IV

        // Extract the salt and IV from specified positions
        let ciphertextBase64 = encryptedData;
        const extractedSalts: string[] = [];
        const extractedIVs: string[] = [];

        // Extract and remove the salt and IV from the ciphertext
        INSERT_POSITIONS.forEach((pos) => {
            const salt = ciphertextBase64.slice(pos, pos + saltBase64Length);
            const iv = ciphertextBase64.slice(
                pos + saltBase64Length,
                pos + saltBase64Length + ivBase64Length
            );

            extractedSalts.push(salt);
            extractedIVs.push(iv);

            // Remove the extracted parts from the ciphertext
            ciphertextBase64 =
                ciphertextBase64.slice(0, pos) +
                ciphertextBase64.slice(pos + saltBase64Length + ivBase64Length);
        });

        // Use the first extracted salt and IV (adjust if multiple insertions are present)
        const saltBase64 = extractedSalts[0];
        const ivBase64 = extractedIVs[0];

        // Convert Base64 to ArrayBuffer
        const salt = new Uint8Array(this.base64ToArrayBuffer(saltBase64));
        const iv = new Uint8Array(this.base64ToArrayBuffer(ivBase64));

        // Ensure the key exists in memory
        if (!this.key) {
            throw new Error("Encryption key not found in memory.");
        }

        // Derive the key using PBKDF2 with the extracted salt
        const derivedKey = await this.deriveKey(this.key, salt);

        // Convert the ciphertext from Base64 to ArrayBuffer
        const ciphertext = this.base64ToArrayBuffer(ciphertextBase64);

        // Decrypt the data using AES-GCM
        try {
            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                },
                derivedKey,
                ciphertext
            );

            // Decode the decrypted data to a string
            const decoder = new TextDecoder();
            const decryptedText = decoder.decode(decrypted);

            return decryptedText;
        } catch (error) {
            // Decryption failed (possibly due to tampering)
            throw new Error(
                "Decryption failed. Data may have been tampered with."
            );
        }
    }

    /**
     * Derives a key using PBKDF2.
     * @param baseKey The base CryptoKey.
     * @param salt The salt used for key derivation.
     * @returns A Promise that resolves to the derived CryptoKey.
     */
    private static async deriveKey(
        baseKey: CryptoKey,
        salt: Uint8Array
    ): Promise<CryptoKey> {
        const derivedKey = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 200000, // Number of iterations
                hash: "SHA-512", // Hash algorithm
            },
            baseKey,
            { name: "AES-GCM", length: 256 }, // AES-256 GCM
            false,
            ["encrypt", "decrypt"]
        );
        return derivedKey;
    }

    /**
     * Inserts data into specified positions within a Base64 string.
     * @param base64Str The original Base64 string.
     * @param data The data to insert.
     * @param positions The array of positions to insert the data.
     * @returns The modified Base64 string with inserted data.
     */
    private static insertDataAtPositions(
        base64Str: string,
        data: string,
        positions: number[]
    ): string {
        let modifiedStr = base64Str;
        // Filter out positions that exceed the string length
        const validPositions = positions.filter(
            (pos) => pos <= modifiedStr.length
        );
        // Sort positions in descending order to prevent shifting issues
        validPositions.sort((a, b) => b - a);

        validPositions.forEach((pos) => {
            modifiedStr =
                modifiedStr.slice(0, pos) + data + modifiedStr.slice(pos);
        });

        return modifiedStr;
    }

    /**
     * Converts an ArrayBuffer to a Base64 string.
     * @param buffer The ArrayBuffer to convert.
     * @returns The Base64-encoded string.
     */
    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        const binary = String.fromCharCode(...new Uint8Array(buffer));
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
