// TODO 環境の調整 >> テスト実行可能にできるか検証
import { CryptoUtils } from "../utils/cryptoUtils";

describe("CryptoUtils", () => {
    const sampleText = "This is a sample memo for encryption.";
    const emptyText = "";
    const longText = "A".repeat(10000); // Very long string

    let encryptedData: string;

    beforeAll(async () => {
        // Encrypt the sample text before running tests
        encryptedData = await CryptoUtils.encrypt(sampleText);
    });

    test("should encrypt and decrypt correctly for normal text", async () => {
        const decryptedText = await CryptoUtils.decrypt(encryptedData);
        expect(decryptedText).toBe(sampleText);
    });

    test("should handle empty strings", async () => {
        const encryptedEmpty = await CryptoUtils.encrypt(emptyText);
        const decryptedEmpty = await CryptoUtils.decrypt(encryptedEmpty);
        expect(decryptedEmpty).toBe(emptyText);
    });

    test("should handle very long strings", async () => {
        const encryptedLong = await CryptoUtils.encrypt(longText);
        const decryptedLong = await CryptoUtils.decrypt(encryptedLong);
        expect(decryptedLong).toBe(longText);
    });

    test("should fail decryption with tampered ciphertext", async () => {
        // Modify one character in the encrypted data
        const tamperedData =
            encryptedData.slice(0, 10) +
            (encryptedData[10] === "A" ? "B" : "A") +
            encryptedData.slice(11);

        await expect(CryptoUtils.decrypt(tamperedData)).rejects.toThrow(
            /OperationError|decryption failed/i
        );
    });

    test("should fail decryption with missing salt", async () => {
        // Remove the salt from the encrypted data
        const saltBase64Length = CryptoUtils["arrayBufferToBase64"](
            new Uint8Array(16).buffer
        ).length; // 16-byte salt
        const modifiedData =
            encryptedData.slice(0, 5) +
            encryptedData.slice(5 + saltBase64Length);

        await expect(CryptoUtils.decrypt(modifiedData)).rejects.toThrow();
    });

    test("should fail decryption with missing IV", async () => {
        // Remove the IV from the encrypted data
        const ivBase64Length = CryptoUtils["arrayBufferToBase64"](
            new Uint8Array(12).buffer
        ).length; // 12-byte IV
        const modifiedData =
            encryptedData.slice(0, 15) +
            encryptedData.slice(15 + ivBase64Length);

        await expect(CryptoUtils.decrypt(modifiedData)).rejects.toThrow();
    });

    test("should fail decryption with missing key", async () => {
        // Remove the key from the encrypted data
        const keyBase64Length = CryptoUtils["arrayBufferToBase64"](
            new Uint8Array(32).buffer
        ).length; // 32-byte key
        const modifiedData =
            encryptedData.slice(0, 25) +
            encryptedData.slice(25 + keyBase64Length);

        await expect(CryptoUtils.decrypt(modifiedData)).rejects.toThrow();
    });

    test("should fail decryption with incorrect salt", async () => {
        // Replace the salt with random data
        const saltBase64Length = CryptoUtils["arrayBufferToBase64"](
            new Uint8Array(16).buffer
        ).length; // 16-byte salt
        const randomSalt = CryptoUtils["arrayBufferToBase64"](
            window.crypto.getRandomValues(new Uint8Array(16)).buffer
        );
        const tamperedData =
            encryptedData.slice(0, 5) +
            randomSalt +
            encryptedData.slice(5 + saltBase64Length);

        await expect(CryptoUtils.decrypt(tamperedData)).rejects.toThrow();
    });

    test("should fail decryption with incorrect IV", async () => {
        // Replace the IV with random data
        const ivBase64Length = CryptoUtils["arrayBufferToBase64"](
            new Uint8Array(12).buffer
        ).length; // 12-byte IV
        const randomIV = CryptoUtils["arrayBufferToBase64"](
            window.crypto.getRandomValues(new Uint8Array(12)).buffer
        );
        const tamperedData =
            encryptedData.slice(0, 15) +
            randomIV +
            encryptedData.slice(15 + ivBase64Length);

        await expect(CryptoUtils.decrypt(tamperedData)).rejects.toThrow();
    });

    test("should fail decryption with incorrect key", async () => {
        // Replace the key with random data
        const keyBase64Length = CryptoUtils["arrayBufferToBase64"](
            new Uint8Array(32).buffer
        ).length; // 32-byte key
        const randomKey = CryptoUtils["arrayBufferToBase64"](
            window.crypto.getRandomValues(new Uint8Array(32)).buffer
        );
        const tamperedData =
            encryptedData.slice(0, 25) +
            randomKey +
            encryptedData.slice(25 + keyBase64Length);

        await expect(CryptoUtils.decrypt(tamperedData)).rejects.toThrow();
    });

    test("should fail decryption when insertion positions are incorrect", async () => {
        // Shift the insertion positions by one character
        const modifiedData =
            encryptedData.slice(0, 6) +
            encryptedData.slice(5, 6) + // Insert duplicate character
            encryptedData.slice(6);

        await expect(CryptoUtils.decrypt(modifiedData)).rejects.toThrow();
    });

    test("should ensure that encrypted data has increased entropy", async () => {
        // Basic check: encrypted data should be longer due to inserted salt, IV, and key
        const originalLength = sampleText.length;
        const encryptedLength = encryptedData.length;
        expect(encryptedLength).toBeGreaterThan(originalLength);
    });
});
