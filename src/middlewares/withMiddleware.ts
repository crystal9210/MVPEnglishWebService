// src/middlewares/withValidationAndSanitization.ts
import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { validate, sanitize } from './validateAndSanitize';

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
    sanitizeFields?: string[]
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
