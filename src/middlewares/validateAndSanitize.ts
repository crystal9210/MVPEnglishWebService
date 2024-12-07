import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

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

/**
 * APIハンドラーにバリデーションとサニタイズを適用する高階関数
 * @param handler APIハンドラー関数
 * @param schema バリデーションに使用するZodスキーマ
 * @param sanitizeFields サニタイズ対象のフィールド名
 * @returns 新しいAPIハンドラー関数
 */
export function withValidationAndSanitization<T>(
    handler: (req: Request, context: { params: any, validatedBody: T }) => Promise<Response>,
    schema?: ZodSchema<T>,
    sanitizeFields?: (keyof T)[]
) {
    return async (req: Request, context: any) => {
        let data: T | undefined;

        // リクエストボディの取得
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            try {
                data = await req.json();
            } catch (error) {
                return NextResponse.json(
                    { error: 'Invalid JSON' },
                    { status: 400 }
                );
            }

            // バリデーション
            if (schema) {
                try {
                    data = validate(schema, data);
                } catch (error) {
                    if (error instanceof ZodError) {
                        return NextResponse.json(
                            { error: 'Validation Error', details: error.errors },
                            { status: 400 }
                        );
                    }
                    return NextResponse.json(
                        { error: 'Internal Server Error' },
                        { status: 500 }
                    );
                }
            }

            // サニタイズ
            if (sanitizeFields) {
                try {
                    if (!data) return;
                    data = sanitize(data, sanitizeFields);
                } catch (error) {
                    return NextResponse.json(
                        { error: 'Sanitization Error' },
                        { status: 400 }
                    );
                }
            }

            // APIハンドラーにサニタイズ・バリデーション済みのデータを渡す
            context.validatedBody = data;
        }

        // ハンドラーの実行
        return handler(req, context);
    };
}
