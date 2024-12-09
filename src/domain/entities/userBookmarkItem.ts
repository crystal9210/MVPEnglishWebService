import { UserBookmarkItemSchema, UserBookmarkItem as UserBookmarkItemType } from "@/schemas/userSchemas";

export class UserBookmarkItem implements UserBookmarkItemType {
    problemId: string;
    category: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    addedAt: string | Date;

    constructor(data: UserBookmarkItemType) {
        // Zodスキーマによるバリデーション
        const parseResult = UserBookmarkItemSchema.safeParse(data);
        if (!parseResult.success) {
        throw new Error(`Invalid UserBookmarkItem data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        // データの割り当て
        this.problemId = parseResult.data.problemId;
        this.category = parseResult.data.category;
        this.difficulty = parseResult.data.difficulty;
        this.addedAt = parseResult.data.addedAt;
    }

    /**
     * Firestoreに保存するためのシリアライズメソッド
     */
    toFirestore(): Record<string, any> {
        return {
        problemId: this.problemId,
        category: this.category,
        difficulty: this.difficulty,
        addedAt: this.addedAt instanceof Date ? this.addedAt.toISOString() : this.addedAt,
        };
    }

    /**
     * Firestoreから取得したデータを元にUserBookmarkItemエンティティを生成するファクトリメソッド
     */
    static fromFirestore(data: Record<string, any>): UserBookmarkItem {
        return new UserBookmarkItem({
        problemId: data.problemId,
        category: data.category,
        difficulty: data.difficulty,
        addedAt: data.addedAt,
        });
    }
}
