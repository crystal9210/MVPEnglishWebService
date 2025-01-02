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
 * Decrypts the given encrypted data using the provided encryption strategy.
 * @param encryptedData The encrypted data to decrypt.
 * @param encryptionStrategy The encryption strategy to use for decryption.
 * @returns The decrypted data as a string.
 */
export const decryptData = async (
    encryptedData: string,
    encryptionStrategy: IEncryptionStrategy
): Promise<string> => {
    return await encryptionStrategy.decrypt(encryptedData);
};
