// src/middlewares/validationSanitization.ts
import { ZodSchema, ZodError } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
// TODO 実装
/**
 * Zodスキーマを用いたバリデーション関数
 * @param schema バリデーションに使用するZodスキーマ
 * @param data 検証するデータ
 * @returns バリデーション済みのデータ
 * @throws ZodError
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * 入力データをサニタイズする関数
 * @param data サニタイズ対象のデータオブジェクト
 * @param fields サニタイズ対象のフィールド名
 * @returns サニタイズされたデータオブジェクト
 */
export function sanitize<T>(data: T, fields: (keyof T)[]): T {
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);

    fields.forEach(field => {
        const value = data[field];
        if (typeof value === 'string') {
            (data as any)[field] = purify.sanitize(value);
        }
    });

    return data;
}
