import { z } from "zod"
import { sanitizedString } from "@/schemas/baseSchemas";

// 現時点での仕様: 1メモあたり最大1000文字
// フィールドにoptional() i.e. undefinedまたはnullを許容するとハンドリング処理がn+1倍となりかつハンドリングの実装ミスによるバグが可能性として高くなるため基本的に使用しない


// TODO 各フィールドにおけるバイパスや攻撃のエントリポイントとなりうる可能性の脅威モデリング - 普通にユーティリティ化してベースモデルとなるサニタイズ処理等を実装したベーススキーマをextendするように - スキーマのプロトコル設計
export const MemoSchema = z.object({
    id: z.string(),
    content: sanitizedString(1000), // TODO sanitization and made and pass test of the utility until 12/12
    createdAt: z.date(),
    lastUpdatedAt: z.date(),
    tags: z.array(z.string()).default([]),
    // ownerId: z.string(),
    deleted: z.boolean().default(false), // optionalとすると"true" | "false" | "undefined"となり扱う状態の数とハンドリング不足によるバグの可能性が増えるためデフォルト:"false"としてスキーマを固定化、undefined, nullの時はバグとしてエラーハンドリング
    deletedAt: z.date().default(new Date(0)), // default value: "000000..."みたいな感じ
});

export const MemoArraySchema = z.array(MemoSchema);

// TODO ドキュメントに記述:変数の命名規則 - メソッドあり:I+(型名)、なし:(型名(下記のように))
export type Memo = z.infer<typeof MemoSchema>;
