import { IdSotrage } from "@/interfaces/repositories/IdStorage";
import { IdGenerator } from "./idGenerator";

// TODO id専用のサービス層は作成しなくていいと思う >> 各サービス層にて必要に応じてidManager呼び出し >> 今回一緒に仮実装したサンプルコード群を参考に設計をそのまま落とし込む >> クリーンアーキテクチャ >> idManager がリポジトリやサービス層に依存するように調整
// TODO セキュアモード実装 >> セキュアモードのロジックどの程度分離するか >> そもそもモジュール自体分離してもいい気がする >> 検知ロジックの細微な増大もあんまり良くない >> idを用いた処理を中心に扱うためのファイルモジュール群設計

export class IdManager {
    private idGenerator: IdGenerator;
    private storage: IdSotrage | undefined;
    private existingIds: Set<string>;
    private maxRetries: number;
    private secureMode: boolean;

    constructor(
        idGenerator: IdGenerator,
        storage: IdSotrage | undefined = undefined,
        maxRetries: number = 100,
        secureMode: boolean = false
    ) {
        this.idGenerator = idGenerator;
        if (storage) {
            this.storage = storage;
        }
        this.existingIds = new Set<string>();
        this.maxRetries = maxRetries;
        this.secureMode = secureMode;
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
                if (this.storage) {
                    this.storage.addId(uniqueSessionId);
                }
                this.existingIds.add(uniqueSessionId);
                return uniqueSessionId;
            }
            retries++;
        }

        throw new Error("Failed to generate a unique session ID after multiple attempts.");
    }


    /**
     * methods for handling ID sets in local scope or the session pool, in which this idManager is working.
     */

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


    /**
     * methods for handling the storage.
     */

    /**
     * Checks if the given ID is a duplicate.
     * assume the upper layer module is responsible for error handling.
     * @param id - ID to check
     * @returns Boolean indicating if the ID exists
     */
    async isDuplicateIdInStorage(id: string): Promise<boolean> {
        return await this.storage!.hasId(id);
    }

    /**
     * Adds an existing ID to the storage.
     * assume the upper layer module is responsible for error handling.
     * @param id - ID to add
     */
    async addExistingIdInStorage(id: string): Promise<void> {
        await this.storage!.addId(id);
    }

    /**
     * Resets all existing IDs in the storage.
     * assume the upper layer module is responsible for error handling.
     */
    async resetIdsInStorage(): Promise<void> {
        await this.storage!.reset();
    }

    /**
     * Enables secure mode, potentially altering storage behavior.
     */
    enableSecureMode(): void {
        this.secureMode = true;
        // Additional secure mode configurations can be added here
    }

    /**
     * Disables secure mode.
     */
    disableSecureMode(): void {
        this.secureMode = false;
        // Revert secure mode configurations if necessary
    }
}
