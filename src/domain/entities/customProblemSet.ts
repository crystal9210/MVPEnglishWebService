import { CustomProblemSetSchema, CustomProblemSet as CustomProblemSetType } from "@/schemas/userSchemas";

export class CustomProblemSet implements CustomProblemSetType {
    id: string;
    title: string;
    description?: string;
    problemIds: string[];
    createdAt: string | Date;

    constructor(data: CustomProblemSetType) {
        // Zodスキーマによるバリデーション
        const parseResult = CustomProblemSetSchema.safeParse(data);
        if (!parseResult.success) {
        throw new Error(`Invalid CustomProblemSet data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        // データの割り当て
        this.id = parseResult.data.id;
        this.title = parseResult.data.title;
        this.description = parseResult.data.description;
        this.problemIds = parseResult.data.problemIds;
        this.createdAt = parseResult.data.createdAt;
    }

    /**
     * Firestoreに保存するためのシリアライズメソッド
     */
    toFirestore(): Record<string, any> {
        return {
        id: this.id,
        title: this.title,
        description: this.description,
        problemIds: this.problemIds,
        createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt,
        };
    }

    /**
     * Firestoreから取得したデータを元にCustomProblemSetエンティティを生成するファクトリメソッド
     */
    static fromFirestore(data: Record<string, any>): CustomProblemSet {
        return new CustomProblemSet({
        id: data.id,
        title: data.title,
        description: data.description,
        problemIds: data.problemIds,
        createdAt: data.createdAt,
        });
    }
}
