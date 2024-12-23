import { IdGenerator } from "./idGenerator";

export class IdManager {
    private idGenerator: IdGenerator;
    private existingIds: Set<string>;
    private maxRetries: number;

    constructor(idGenerator: IdGenerator, maxRetries: number = 100) {
        this.idGenerator = idGenerator;
        this.existingIds = new Set<string>();
        this.maxRetries = maxRetries;
    }

    /**
     * 重複確認を行いつつsessionIdを生成
     * @param existingIds - 既存のIDセット
     * @param format - 日時のフォーマット文字列 (デフォルト: "yyyyMMdd-HHmmss")
     * @returns 一意のsessionId
     * @example
     * const existingIds = new Set(["20240619-153045-123e4567-e89b-12d3-a456-426614174000"]);
     * const uniqueId = idGenerator.generateUniqueSessionId(existingIds);
     * console.log(uniqueId); // "20240619-153046-987e6543-b21a-34c5-d789-987654321000"
     */
    generateUniqueSessionId(
        format: string = "yyyyMMdd-HHmmss",
        batchSize: number = 1
    ): string {
        let retries = 0;

        while (retries < this.maxRetries) {
            const sessionIds = Array.from({ length: batchSize }, () => this.idGenerator.generateSessionId(format));
            const uniqueSessionId = sessionIds.find(id => !this.existingIds.has(id));
            if (uniqueSessionId) {
                this.existingIds.add(uniqueSessionId);
                return uniqueSessionId;
            }
            retries++;
        }

        throw new Error("Failed to generate a unique session ID after multiple attempts.");
    }

    /**
     * IDの重複チェック
     * @param id - チェックするID
     * @param existingIds - 既存のIDセット
     * @returns 重複しているかどうかの真偽値
     * @example
     * const existingIds = new Set(["20240619-153045-123e4567-e89b-12d3-a456-426614174000"]);
     * const isDuplicate = idGenerator.isDuplicateId("20240619-153045-123e4567-e89b-12d3-a456-426614174000", existingIds);
     * console.log(isDuplicate); // true
     */
    isDuplicateId(id: string): boolean {
        return this.existingIds.has(id);
    }

    addExistingId(id: string): void {
        this.existingIds.add(id);
    }

    // >> 必要に応じてexistingIdsをリセット
    resetIds(): void {
        this.existingIds.clear();
    }
}
