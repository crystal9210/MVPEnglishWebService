export const OBJECT_STORES = {
    MEMO_LIST: "memoList",
    TRASHED_MEMO_LIST: "trashedMemoList",
    ACTIVITY_SESSIONS: "activitySessions",
    HISTORY: "history",
} as const;

export type ObjectStoreName = typeof OBJECT_STORES[keyof typeof OBJECT_STORES]; // TODO

export interface IndexConfig {
    name: string;
    keyPath: string;
    options?: IDBIndexParameters;
}

export interface ObjectStoreConfig {
    name: ObjectStoreName;
    options: IDBObjectStoreParameters;
    indexes?: IndexConfig[];
}


export const OBJECT_STORE_CONFIGS: readonly ObjectStoreConfig[] = [
    {
        name: OBJECT_STORES.MEMO_LIST,
        options: { keyPath: "id" },
        indexes: [
            {
                name: "by-createdAt",
                keyPath: "createdAt"
            },
            {
                name: "by-tags",
                keyPath: "tags",
                options: { multiEntry: true }
            }
        ],
    },
    {
        name: OBJECT_STORES.TRASHED_MEMO_LIST,
        options: { keyPath: "id" },
        indexes: [
            { name: "by-deletedAt", keyPath: "deletedAt" },
        ],
    },
    {
        name: OBJECT_STORES.ACTIVITY_SESSIONS,
        options: { keyPath: "sessionId" },
        indexes: [],
    },
    {
        name: OBJECT_STORES.HISTORY,
        options: { keyPath: "id", autoIncrement: true },
        indexes: [
            { name: "by-sessionId", keyPath: "sessionId" },
        ],
    },
] as const;

export type ObjectStoreConfigs = typeof OBJECT_STORE_CONFIGS;

// --- NOTE ---
// type StoreNames = typeof OBJECT_STORE_CONFIGS[number]["name"];
// >> "memoList" | "trashedMemoList" | "activitySessions" | "history"
