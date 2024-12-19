import { v4 as uuidv4 } from "uuid";
import { DateTimeProvider } from "@/utils/generators/dateTimeGenerator";

export class IdGenerator {
    private dateTimeProvider: DateTimeProvider;

    constructor(timezone: string = "Asia/Tokyo") {
        this.dateTimeProvider = new DateTimeProvider(timezone);
    }

    /**
     * sessionIdの生成: 開始日時-UUID形式
     * @param format - 日時のフォーマット文字列 (デフォルト: "yyyyMMdd-HHmmss")
     * @returns 生成されたsessionId (例: "20240619-153045-123e4567-e89b-12d3-a456-426614174000")
     * @example
     * const sessionId = idGenerator.generateSessionId();
     * console.log(sessionId); // "20240619-153045-123e4567-e89b-12d3-a456-426614174000"
     */
    generateSessionId(format: string = "yyyyMMdd-HHmmss"): string {
        const now = this.dateTimeProvider.getFormattedNow(format);
        const uuid = uuidv4();
        return `${now}-${uuid}`;
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
    generateUniqueSessionId(existingIds: Set<string>, format: string = "yyyyMMdd-HHmmss"): string {
        let sessionId: string;
        do {
            sessionId = this.generateSessionId(format);
        } while (existingIds.has(sessionId)); // 重複していた場合再生成
        return sessionId;
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
    isDuplicateId(id: string, existingIds: Set<string>): boolean {
        return existingIds.has(id);
    }
}
