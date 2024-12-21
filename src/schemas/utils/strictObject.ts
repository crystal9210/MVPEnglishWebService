import { z } from "zod";


export function strictObject<T extends z.ZodRawShape>(schema: T): z.ZodObject<T> {
    return z.object(schema).strict();
}

// type StrictFieldsObj<T, K extends keyof T> = {
//     [P in K]: true;
// }

// type PickKeys<T, K extends keyof T> = {
//     [P in K]: P;
// }

// type OmitKeys<T, K extends keyof T> = {
//     [P in Exclude<keyof T, K>]: P;
// }[Exclude<keyof T, K>];

type StrictFields<T extends z.ZodRawShape> = {
  [K in keyof T]?: true;
};

export function partiallyStrictObject<T extends z.ZodRawShape>(
  schema: T,
  strictFields: StrictFields<T>
): z.ZodObject<T> {

  // 厳格にするフィールドのキーを取得
  const strictKeys = Object.keys(strictFields).filter(
    (key) => strictFields[key as keyof T] === true
  ) as (keyof T)[];

  // 厳格なスキーマ用のフィールドを抽出
  const strictFieldSchema: z.ZodRawShape = strictKeys.reduce((acc, key) => {
    acc[key as string] = schema[key] as z.ZodTypeAny;
    return acc;
  }, {} as z.ZodRawShape);

  // 柔軟なフィールドのキーを取得
  const flexibleKeys = Object.keys(schema).filter(
    (key) => !strictKeys.includes(key as keyof T)
  ) as (keyof T)[];

  // 柔軟なスキーマ用のフィールドを抽出
  const flexibleFieldSchema = flexibleKeys.reduce((acc, key) => {
    acc[key as string] = (schema[key] as z.ZodTypeAny).optional();
    return acc;
  }, {} as z.ZodRawShape);

  // 厳格スキーマの作成
  const strictSchema = z.object(strictFieldSchema).strict();

  // 柔軟スキーマの作成
  const flexibleSchema = z.object(flexibleFieldSchema);

  // 厳格スキーマと柔軟スキーマをマージ
  return strictSchema.merge(flexibleSchema) as z.ZodObject<T>;
}
