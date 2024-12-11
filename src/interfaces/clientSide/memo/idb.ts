import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { DBSchema } from "idb";

// TODO アクティビティマネージャでもidbを利用する形式になっている、というか基本的にコンテキスト系の実装ロジックが関わる機能に関してはデータの永続性のためにidbを利用するが互いに衝突をする可能性がないか

export interface MyDB extends DBSchema {
    memoList: {
        key: string;
        value: Memo;
        // TODO indexesに関してこれはメモの検索機能に関連するフィールドだが"by-tags"におけるテキストリストからのabc順におけるソート処理などは想定しなくていいのか ＋ ソートをするためにタグのリストをユーザごとに用意してソートか何かで保持するようにするのはコスパ的にどうか検証・仕様設計
        indexes: {
            "by-createdAt": Date;
            "by-tags": string[];
        }
    };
    trashedMemoList: {
        key: string;
        value: Memo;
        indexes: {
            "by-deletedAt": Date;
        };
    };
};
