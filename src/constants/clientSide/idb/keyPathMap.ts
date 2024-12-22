import { IDB_OBJECT_STORE_CONFIGS } from "./objectStores";

// KeyPathMap生成
type GenerateKeyPathType<
    Configs extends readonly { name: string | number | symbol; options: { keyPath: string | string[] } }[]
> = {
    [K in Configs[number]["name"]]: Extract<Configs[number], { name: K }>["options"]["keyPath"];
};

export type KeyPathMap = GenerateKeyPathType<typeof IDB_OBJECT_STORE_CONFIGS>;

export const KEY_PATHS = Object.fromEntries(
    Object.entries(IDB_OBJECT_STORE_CONFIGS).map(([key, config]) => [key, config.options.keyPath])
) as {
    [K in keyof KeyPathMap]: KeyPathMap[K];
};
