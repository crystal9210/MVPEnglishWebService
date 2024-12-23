// --- sample code ---
// TODO implement id-storages like below.
import { IdSotrage } from "@/interfaces/repositories/IdStorage";

export class SecureLocalStorageProvider implements IdSotrage {
    private storageKey: string;
    private encryptionKey: CryptoKey;

    constructor(storageKey: string = "secureExistingSessionIds") {
        this.storageKey = storageKey;
        this.encryptionKey = this.generateKey();
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, this.encryptData(JSON.stringify([])));
        }
    }

    private async generateKey(): Promise<CryptoKey> {
        return await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    private async encryptData(data: string): Promise<string> {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            this.encryptionKey,
            encoder.encode(data)
        );
        const buffer = new Uint8Array(encrypted);
        const combined = new Uint8Array(iv.length + buffer.length);
        combined.set(iv);
        combined.set(buffer, iv.length);
        return btoa(String.fromCharCode(...combined));
    }

    private async decryptData(data: string): Promise<string> {
        const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            this.encryptionKey,
            encrypted
        );
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }

    async addId(id: string): Promise<void> {
        const ids = await this.getAllIds();
        ids.push(id);
        const encryptedData = await this.encryptData(JSON.stringify(ids));
        localStorage.setItem(this.storageKey, encryptedData);
    }

    async hasId(id: string): Promise<boolean> {
        const ids = await this.getAllIds();
        return ids.includes(id);
    }

    async removeId(id: string): Promise<void> {
        let ids = await this.getAllIds();
        ids = ids.filter(existingId => existingId !== id);
        const encryptedData = await this.encryptData(JSON.stringify(ids));
        localStorage.setItem(this.storageKey, encryptedData);
    }

    async reset(): Promise<void> {
        const encryptedData = await this.encryptData(JSON.stringify([]));
        localStorage.setItem(this.storageKey, encryptedData);
    }

    private async getAllIds(): Promise<string[]> {
        const encryptedData = localStorage.getItem(this.storageKey);
        if (!encryptedData) return [];
        const decryptedData = await this.decryptData(encryptedData);
        return JSON.parse(decryptedData);
    }
}
