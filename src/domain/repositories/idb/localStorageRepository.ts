import { IdSotrage } from "@/interfaces/repositories/IdStorage";

export class LocalStorageProvider implements IdSotrage {
    private storageKey: string;

    constructor(storageKey: string = "existingSessionIds") {
        this.storageKey = storageKey;
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    async addId(id: string): Promise<void> {
        const ids = await this.getAllIds();
        ids.push(id);
        localStorage.setItem(this.storageKey, JSON.stringify(ids));
    }

    async hasId(id: string): Promise<boolean> {
        const ids = await this.getAllIds();
        return ids.includes(id);
    }

    async removeId(id: string): Promise<void> {
        let ids = await this.getAllIds();
        ids = ids.filter(existingId => existingId !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(ids));
    }

    async reset(): Promise<void> {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
    }

    private async getAllIds(): Promise<string[]> {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }
}
