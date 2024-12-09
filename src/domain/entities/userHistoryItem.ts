import { UserHistoryItemSchema, UserHistoryItem as UserHistoryItemType } from "@/schemas/userHistorySchemas";

export class UserHistoryItem implements UserHistoryItemType {
    problemId: string;
    result: "correct" | "incorrect";
    attempts: number;
    lastAttemptAt: string | Date;
    notes?: string;

    constructor(data: UserHistoryItemType) {
        // Zodスキーマによるバリデーション
        const parseResult = UserHistoryItemSchema.safeParse(data);
        if (!parseResult.success) {
        throw new Error(`Invalid UserHistoryItem data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        // データの割り当て
        this.problemId = parseResult.data.problemId;
        this.result = parseResult.data.result;
        this.attempts = parseResult.data.attempts;
        this.lastAttemptAt = parseResult.data.lastAttemptAt;
        this.notes = parseResult.data.notes;
    }

    /**
     * Firestoreに保存するためのシリアライズメソッド
     */
    toFirestore(): Record<string, any> {
        return {
        problemId: this.problemId,
        result: this.result,
        attempts: this.attempts,
        lastAttemptAt: this.lastAttemptAt instanceof Date ? this.lastAttemptAt.toISOString() : this.lastAttemptAt,
        notes: this.notes,
        };
    }

    /**
     * Firestoreから取得したデータを元にUserHistoryItemエンティティを生成するファクトリメソッド
     */
    static fromFirestore(data: Record<string, any>): UserHistoryItem {
        return new UserHistoryItem({
        problemId: data.problemId,
        result: data.result,
        attempts: data.attempts,
        lastAttemptAt: data.lastAttemptAt,
        notes: data.notes,
        });
    }
}
