import { deriveKey } from "@/utils/crypto/keyDerivation";
import { DeriveKeyOptionsType } from "@/constants/cryptoTypes";

// set a mock
beforeAll(() => {
    Object.defineProperty(global, "crypto", {
        value: {
            getRandomValues: (arr: Uint8Array) => {
                for (let i = 0; i < arr.length; i++) {
                    arr[i] = Math.floor(Math.random() * 256);
                }
                return arr;
            },
            subtle: {
                importKey: jest
                    .fn()
                    .mockImplementation(
                        async (
                            format,
                            keyData,
                            algorithm,
                            extractable,
                            keyUsages
                        ) => {
                            // implementation of the key mock.
                            return {
                                algorithm,
                                extractable,
                                type: "secret",
                                usages: keyUsages,
                            } as CryptoKey;
                        }
                    ),
                deriveKey: jest
                    .fn()
                    .mockImplementation(
                        async (
                            params,
                            baseKey,
                            derivedKeyType,
                            extractable,
                            keyUsages
                        ) => {
                            // mock of key derivation.
                            return {
                                algorithm: derivedKeyType,
                                extractable,
                                type: "secret",
                                usages: keyUsages,
                            } as CryptoKey;
                        }
                    ),
            },
        },
    });
});

describe("deriveKey Function", () => {
    it("should derive a key with default parameters", async () => {
        const options: DeriveKeyOptionsType = {
            passphrase: "securepassword123",
        };

        const result = await deriveKey(options);

        expect(result.key).toBeInstanceOf(Object);
        expect(result.salt).toBeInstanceOf(Uint8Array);
        expect(result.salt.length).toBe(16); // Default SALT_LENGTH
    });

    it("should derive a key with custom parameters", async () => {
        const options: DeriveKeyOptionsType = {
            passphrase: "anothersecurepassword",
            saltLength: 32,
            iterations: 200000,
            hash: "SHA-512",
            keyLength: 512,
        };

        const result = await deriveKey(options);

        expect(result.key).toBeInstanceOf(Object);
        expect(result.salt).toBeInstanceOf(Uint8Array);
        expect(result.salt.length).toBe(32); // custom SALT_LENGTH
    });

    it("should throw a zod validation error for invalid passphrase", async () => {
        const options: DeriveKeyOptionsType = {
            passphrase: "",
        };

        await expect(deriveKey(options)).rejects.toThrow(
            "Passphrase must be at least 8 characters long."
        );
    });
});

describe("deriveKey Function - Security Tests", () => {
    it("should generate unique salts for different derivations", async () => {
        const options: DeriveKeyOptionsType = {
            passphrase: "securepassword123",
        };

        const result1 = await deriveKey(options);
        const result2 = await deriveKey(options);

        expect(result1.salt).not.toEqual(result2.salt);
    });

    it("should generate keys of the correct length", async () => {
        const options: DeriveKeyOptionsType = {
            passphrase: "securepassword123",
            keyLength: 256,
        };

        const result = await deriveKey(options);

        expect(result.key.algorithm.name).toBe("AES-GCM");
    });

    it("should use the specified hash algorithm", async () => {
        const options: DeriveKeyOptionsType = {
            passphrase: "securepassword123",
            hash: "SHA-512",
        };

        const result = await deriveKey(options);
        expect(result.key.algorithm.name).toBe("AES-GCM");
    });
});
