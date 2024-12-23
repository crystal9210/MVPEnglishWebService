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
        try {
            const now = this.dateTimeProvider.getFormattedNow(format);
            const uuid = uuidv4();
            return `${now}-${uuid}`;
        } catch (error) {
            throw new Error(`Failed to generate session ID: ${error}`);
        }
    }
}
