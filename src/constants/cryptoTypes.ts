import { z } from "zod";

/**
 * HASH_TYPES represents the supported hash algorithms for PBKDF2.
 */
export const HASH_TYPES = {
    SHA1: "SHA-1",
    SHA256: "SHA-256",
    SHA384: "SHA-384",
    SHA512: "SHA-512",
} as const;

/**
 * HashTypeEnum defines the Zod enum for hash algorithms.
 */
export const HashTypeEnum = z.enum(
    Object.values(HASH_TYPES) as unknown as [
        (typeof HASH_TYPES)[keyof typeof HASH_TYPES]
    ]
);

export type HashType = z.infer<typeof HashTypeEnum>;

/**
 * CRYPTO_PARAMETERS holds all cryptographic constants with initial default values.
 * It utilizes HASH_TYPES for defining the hash algorithm.
 */
export const CRYPTO_PARAMETERS = {
    SALT_LENGTH: 16, // Length of the salt in bytes
    PBKDF2_ITERATIONS: 200000, // Number of iterations for PBKDF2
    PBKDF2_HASH: HASH_TYPES.SHA512, // Hash algorithm for PBKDF2
    AES_KEY_LENGTH: 256, // Length of the AES key in bits
} as const;

/**
 * DeriveKeyOptions defines the options for the deriveKey function.
 * - passphrase: Required parameter and this field should be at least 8 characters.
 * - saltLength, iterations, hash, keyLength: Optional parameters with default values from CRYPTO_PARAMETERS.
 */
export interface DeriveKeyOptions {
    passphrase: string; // Required: The passphrase to derive the key from
    saltLength?: number; // Optional: Length of the salt in bytes
    iterations?: number; // Optional: Number of iterations for PBKDF2
    hash?: HashType; // Optional: Hash algorithm for PBKDF2
    keyLength?: number; // Optional: Length of the AES key in bits
}

/**
 * Zod schema for DeriveKeyOptions.
 * - passphrase is required.
 * - Other fields are optional with default values from CRYPTO_PARAMETERS.
 */
export const DeriveKeyOptionsSchema = z
    .object({
        passphrase: z
            .string()
            .min(8, "Passphrase must be at least 8 characters long."),
    })
    .merge(
        z.object({
            saltLength: z.number().optional(),
            iterations: z.number().optional(),
            hash: HashTypeEnum.optional(),
            keyLength: z.number().optional(),
        })
    );

/**
 * Type inferred from DeriveKeyOptionsSchema.
 */
export type DeriveKeyOptionsType = z.infer<typeof DeriveKeyOptionsSchema>;

/**
 * EncryptionAlgorithm defines the supported encryption algorithms.
 */
export type EncryptionAlgorithm = "AES-GCM"; // 将来的に他のアルゴリズムを追加可能

/**
 * EncryptionOptions defines the options for initializing encryption strategies.
 * - algorithm: The encryption algorithm to use.
 * - passphrase: The passphrase for key derivation.
 * - saltLength, iterations, hash, keyLength: Optional parameters for key derivation.
 */
export interface EncryptionOptions extends DeriveKeyOptions {
    algorithm: EncryptionAlgorithm; // Required: The encryption algorithm to use
}

export const DEFAULT_ENCRYPTION_OPTIONS: EncryptionOptions = {
    passphrase: "YourSecureDefaultPassphrase", // TODO ここはセキュリティ要件に応じて設定
    algorithm: "AES-GCM",
    saltLength: 16,
    iterations: 200000,
    hash: "SHA-512",
    keyLength: 256,
};

/**
 * An array of numbers, which indicate where to insert iv and salt strings in the encrypted data body string.
 * Each element of the array is an index of the insertion position.
 */
export const INSERT_POSITIONS: number[] = [5, 10];
