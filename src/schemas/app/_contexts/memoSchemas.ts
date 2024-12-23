import { z } from "zod"
// import { sanitizedString } from "@/schemas/baseSchemas";
import { DateSchema, OptionalDateSchema } from "@/schemas/utils/dates";

// 現時点での仕様: 1メモあたり最大1000文字
// フィールドにoptional() i.e. undefinedまたはnullを許容するとハンドリング処理がn+1倍となりかつハンドリングの実装ミスによるバグが可能性として高くなるため基本的に使用しない

export const MemoSchema = z.object({
    id: z.string(),
    content: z.string().min(0).max(1000), // encryption data
    createdAt: DateSchema,
    lastUpdatedAt: DateSchema,
    tags: z.array(z.string()).default([]),
    // ownerId: z.string(),
    deleted: z.boolean().default(false),
    deletedAt: OptionalDateSchema,
});

export const MemoArraySchema = z.array(MemoSchema);

export type Memo = z.infer<typeof MemoSchema>;


// --- NOTE: 見かけた中で面白そうだったので下記メモ / ただしきちんと動作はしなかったので上の通りハードコーディングした。inferを使うと型情報が失われるので注意
// Memo型からデフォルト値を持つプロパティを除外した型を作成
// type MemoWithoutDefaults = Omit<Memo,"createdAt" | "lastUpdatedAt" | "tags" | "deleted" | "deletedAt">;
// // デフォルト値を持つプロパティを必須にした型を作成
// type MemoDefaults = Required<Pick<Memo,"createdAt" | "lastUpdatedAt" | "tags" | "deleted" | "deletedAt">>;
// // MemoWithoutDefaultsとMemoDefaultsを組み合わせて、デフォルト値が考慮された新しいMemo型を作成
// export type MemoWithDefaults = MemoWithoutDefaults & MemoDefaults;
