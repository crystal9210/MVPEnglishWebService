import { CryptoUtils } from "./cryptoUtils";

jest.mock("@/constants/cryptoTypes", () => ({
    INSERT_POSITIONS: [5, 10],
}));

describe("CryptoUtils", () => {
    const plaintext = "This is a secret message.";

    it("should have crypto.subtle defined", () => {
        expect(global.crypto).toBeDefined();
        expect(global.crypto.subtle).toBeDefined();
    });

    it("should encrypt and decrypt correctly", async () => {
        const encryptedData = await CryptoUtils.encrypt(plaintext);
        expect(encryptedData).toBeDefined();
        expect(typeof encryptedData).toBe("string");

        const decryptedText = await CryptoUtils.decrypt(encryptedData);
        expect(decryptedText).toBe(plaintext);
    });

    it("should produce different ciphertexts for the same plaintext", async () => {
        const encryptedData1 = await CryptoUtils.encrypt(plaintext);
        const encryptedData2 = await CryptoUtils.encrypt(plaintext);

        expect(encryptedData1).toBeDefined();
        expect(encryptedData2).toBeDefined();
        expect(encryptedData1).not.toBe(encryptedData2);
    });

    it("should fail to decrypt tampered data", async () => {
        const encryptedData = await CryptoUtils.encrypt(plaintext);
        expect(encryptedData).toBeDefined();

        // 暗号文を改ざん >> 例として、最後の文字を変更
        const tamperedData =
            encryptedData.slice(0, -1) +
            (encryptedData.slice(-1) === "A" ? "B" : "A");

        await expect(CryptoUtils.decrypt(tamperedData)).rejects.toThrow(
            "Decryption failed. Data may have been tampered with."
        );
    });

    it("should handle empty string encryption and decryption", async () => {
        const emptyPlaintext = "";
        const encryptedData = await CryptoUtils.encrypt(emptyPlaintext);
        expect(encryptedData).toBeDefined();
        expect(typeof encryptedData).toBe("string");

        const decryptedText = await CryptoUtils.decrypt(encryptedData);
        expect(decryptedText).toBe(emptyPlaintext);
    });

    it("should handle large plaintext encryption and decryption", async () => {
        const largePlaintext = "A".repeat(10000); // >> 10,000文字のテキスト
        const encryptedData = await CryptoUtils.encrypt(largePlaintext);
        expect(encryptedData).toBeDefined();
        expect(typeof encryptedData).toBe("string");

        const decryptedText = await CryptoUtils.decrypt(encryptedData);
        expect(decryptedText).toBe(largePlaintext);
    });
});
