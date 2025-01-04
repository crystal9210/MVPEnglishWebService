import {
    IEncryptionStrategy,
    AESGCMStrategy,
} from "./aesGcmEncryptionStrategy";
import { deriveKey } from "./keyDerivation";
import {
    EncryptionOptions,
    // EncryptionAlgorithm,
} from "@/constants/cryptoTypes";

/**
 * EncryptionFactory creates instances of IEncryptionStrategy based on the provided EncryptionOptions.
 */
export class EncryptionFactory {
    /**
     * Creates an encryption strategy based on the provided options.
     * @param options EncryptionOptions including algorithm and passphrase
     * @returns A promise that resolves to an IEncryptionStrategy instance
     */
    static async createStrategy(
        options: EncryptionOptions
    ): Promise<IEncryptionStrategy> {
        switch (options.algorithm) {
            case "AES-GCM":
                // Derive the key using PBKDF2
                const deriveOptions = {
                    passphrase: options.passphrase,
                    saltLength: options.saltLength,
                    iterations: options.iterations,
                    hash: options.hash,
                    keyLength: options.keyLength,
                };
                const { key } = await deriveKey(deriveOptions);
                // Initialize and return the AES-GCM strategy
                return new AESGCMStrategy(key);

            // Add cases for other algorithms here
            // case "RSA-OAEP":
            //     // Implement RSA-OAEP strategy
            //     break;

            default:
                throw new Error(
                    `Unsupported encryption algorithm: ${options.algorithm}`
                );
        }
    }
}
