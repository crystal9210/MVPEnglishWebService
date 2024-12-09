import { UserSchema, User as UserType } from "@/schemas/userSchemas";

export class User implements UserType {
    uid: string;
    email: string;
    name: string;
    image: string;
    createdAt: string | Date;
    updatedAt: string | Date;

    constructor(data: UserType) {
        // Zodスキーマによるバリデーション
        const parseResult = UserSchema.safeParse(data);
        if (!parseResult.success) {
            throw new Error(`Invalid User data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        // データ割り当て
        this.uid = parseResult.data.uid;
        this.email = parseResult.data.email;
        this.name = parseResult.data.name;
        this.image = parseResult.data.image;
        this.createdAt = parseResult.data.createdAt;
        this.updatedAt = parseResult.data.updatedAt;
    }

    /**
     * Firestoreに保存するためのシリアライズメソッド
     */
    toFirestore(): Record<string, any> {
        return {
            uid: this.uid,
            email: this.email,
            name: this.name,
            image: this.image,
            createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt,
            updatedAt: this.updatedAt instanceof Date ? this.updatedAt.toISOString() : this.updatedAt,
        };
    }

    /**
     * Firestoreから取得したデータを元にUserエンティティを生成するファクトリメソッド
     */
    static fromFirestore(data: Record<string, any>): User {
        return new User({
            uid: data.uid,
            email: data.email,
            name: data.name,
            image: data.image,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }
}
