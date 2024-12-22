// 本ファイルモジュール要求定義
// MyIDBが欲しい >> MyIDBの要件
// MyIDBの要件:
// ok: IDBにアクセスするための基本スキーマを拡張(依存スキーマに持つ) >> 依存スキーマのメソッドなど構造的な特徴を継承することでIDBの処理との互換性を維持
// TODO オブジェクトストアの型を規定ファイルモジュール(@/constants/clientSide/idb/objectStores.ts)ファイルのIDB_OBJECT_STORESから動的に取得してそこの変更による影響を0に担保する
// >> そのための中間処理がチラチラと書いてある
import { DBSchema } from "idb";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { IActivitySessionHistoryItem } from "@/schemas/activity/clientSide/activitySessionHistoryItemSchema";
import { IDB_OBJECT_STORE_CONFIGS, IdbObjectStoreConfigs, IdbObjectStoreName } from "@/constants/clientSide/idb/objectStores";
import { ValueType } from "tailwindcss/types/config";
import { z } from "zod";

// TODO アクティビティマネージャでもidbを利用する形式になっている、というか基本的にコンテキスト系の実装ロジックが関わる機能に関してはデータの永続性のためにidbを利用するが互いに衝突をする可能性がないか
// TODO indexesに関してこれはメモの検索機能に関連するフィールドだが"by-tags"におけるテキストリストからのabc順におけるソート処理などは想定しなくていいのか ＋ ソートをするためにタグのリストをユーザごとに用意してソートか何かで保持するようにするのはコスパ的にどうか検証・仕様設計

// --- NOTE: TSの型システム:配列の順序は型の構造に影響せず、型レベルでの操作:構造的な一致に基づいて行われるため、配列内の要素の順序は無関係
type ExtractKeyPathType<KeyPath> =
    KeyPath extends string
        ? KeyPath extends "id"
            ? string | number
            : string
        : KeyPath extends (infer P)[]
            ? P
            : never;

type GetKeyType<T extends readonly (IdbObjectStoreConfigs)[], K extends IdbObjectStoreName> =
    // Extract<T[number], { name: K }>["options"] extends { keyPath: infer KeyPath } // TSの仕様 >> 1. コード全体のコンテキスト情報を型安全性の判定時に採用しない場合がある 2. Extractの使用上完全に型を絞るわけではない(i.e. 型安全性を保証しない)ため、TSが詳細を推論できない可能性がある >> ["options"]によりoptionsプロパティへの直接アクセスを拒否する可能性
    Extract<T[number], { name: K }> extends { options: { keyPath: infer KeyPath }}
        ? ExtractKeyPathType<KeyPath>
        : never;

// IDB_OBJECT_STORE_CONFIGSに基づき各オブジェクトストアの型情報を動的に生成
type DynamicObjectStoreTypes<T extends readonly IdbObjectStoreConfigs[]> = {
    [K in T[number]["name"]]: {
        key: GetKeyType<T, K>;
        value: StoreValueMap[K];
        indexes: StoreIndexMap[K];
    };
};

export type MyIDB = DBSchema & IdbObjectStoreConfigs;


type GenerateStoreValueMap<T extends readonly (IdbObjectStoreConfigs & { name: string })[]> = {
    // infer: 型条件式( + extends節)による推論処理内で扱う >> T extends ... 形式の方の宣言部分では使用不可
    [K in T[number]["name"]]: Extract<T[number], { name: K }> extends { schema: infer ValueType }
        ? ValueType
        : never;
};

// 各オブジェクトストアのインデックス名とkeyPathをマッピングする型を動的生成
type GenerateStoreIndexMap<T extends readonly (IdbObjectStoreConfigs[])> = {
    [K in T[number]["name"]]: Extract<T[number], { name: K }> extends infer Indexes
        ? Indexes extends IndexConfig<infer VT, keyof infer VI>[] // VTとVIをinferで取得
            ? {
                [I in (Indexes & IndexConfig<VT, keyof VI>)[number]["name"]]: Extract<(Indexes & IndexConfig<VT, keyof VI>)[number], { name: I }>["keyPath"]; // 交差型を使って型を絞り込む
            }
            : Record<string, never>
        : Record<string, never>;
};


type StoreValueMap = GenerateStoreValueMap<typeof IDB_OBJECT_STORE_CONFIGS[]>;
type StoreIndexMap = GenerateStoreIndexMap<typeof IDB_OBJECT_STORE_CONFIGS>;
