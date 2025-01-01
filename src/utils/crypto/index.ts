import { EncryptionFactory } from "./cryptoFactory";
import { EncryptionOptions } from "@/constants/cryptoTypes";
import { IEncryptionStrategy } from "./crypto";

/**
 * encryptionStrategy holds the current encryption strategy instance.
 */
let encryptionStrategy: IEncryptionStrategy | null = null;

/**
 * Initializes the encryption strategy with the provided options.
 * @param options EncryptionOptions including algorithm and passphrase
 */
export const initializeEncryption = async (
    options: EncryptionOptions
): Promise<void> => {
    encryptionStrategy = await EncryptionFactory.createStrategy(options);
};

/**
 * Encrypts data using the initialized encryption strategy.
 * @param data The plaintext data to encrypt
 * @returns The encrypted ciphertext as a Base64 string
 * @throws Error if encryption strategy is not initialized
 */
export const encryptData = async (data: string): Promise<string> => {
    if (!encryptionStrategy) {
        throw new Error("Encryption strategy is not initialized.");
    }
    return await encryptionStrategy.encrypt(data);
};

/**
 * Decrypts data using the initialized encryption strategy.
 * @param ciphertext The encrypted data as a Base64 string
 * @returns The decrypted plaintext
 * @throws Error if encryption strategy is not initialized
 */
export const decryptData = async (ciphertext: string): Promise<string> => {
    if (!encryptionStrategy) {
        throw new Error("Encryption strategy is not initialized.");
    }
    return await encryptionStrategy.decrypt(ciphertext);
};
