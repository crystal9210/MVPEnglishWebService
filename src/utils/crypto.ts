// TODO 暗号化ロジック + 使用してる各ロジックの堅牢性 + 調整
// 設計
// AES-GCMアルゴリズム: 高いセキュリティ・認証付きの暗号化
// IV(initialization vector): 各暗号化操作でランダムなivを生成しセキュリティを向上させる
export const encryptData = async (data: string, key: CryptoKey): Promise<string> => {
    const encoded = new TextEncoder().encode(data);
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: window.crypto.getRandomValues(new Uint8Array(12)),
        },
        key,
        encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
};

export const decryptData = async (ciphertext: string, key: CryptoKey): Promise<string> => {
    const data = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: data.slice(0, 12)
        },
        key,
        data.slice(12)
    );

    return new TextDecoder().decode(decrypted);
};

const generateKey = async (): Promise<CryptoKey> => {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
};


export const importKey = async (rawKey: ArrayBuffer): Promise<CryptoKey> => {
    return await window.crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM"},
        true,
        ["encrypt", "decrypt"]
    );
};



// --- use case sample ----
// --ex: src/services/AuthService.ts --

// import { encryptData, decryptData, generateKey, importKey } from "@/utils/crypto";

// class AuthService {
//     private static instance: AuthService;
//     private cryptoKey: CryptoKey | null = null;

//     private constructor() {
//         // キーの初期化
//         this.initializeKey();
//     }

//     public static getInstance(): AuthService {
//         if (!AuthService.instance) {
//             AuthService.instance = new AuthService();
//         }
//         return AuthService.instance;
//     }

//     private async initializeKey(): Promise<void> {
//         // キーを生成またはインポート
//         this.cryptoKey = await generateKey();
//     }

//     public async storeToken(token: string): Promise<void> {
//         if (!this.cryptoKey) throw new Error("CryptoKey not initialized");
//         const encryptedToken = await encryptData(token, this.cryptoKey);
//         localStorage.setItem("authToken", encryptedToken);
//     }

//     public async getToken(): Promise<string | null> {
//         const encryptedToken = localStorage.getItem("authToken");
//         if (!encryptedToken || !this.cryptoKey) return null;
//         try {
//             const decryptedToken = await decryptData(encryptedToken, this.cryptoKey);
//             return decryptedToken;
//         } catch (error) {
//             console.error("Token decryption failed", error);
//             return null;
//         }
//     }
// }

// export default AuthService;

