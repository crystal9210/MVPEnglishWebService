// src/middlewares/validate.ts
import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

/**
 * Zodスキーマを用いたバリデーションミドルウェア
 * @param schema バリデーションに使用するZodスキーマ
 * @returns NextMiddleware
 */
export function validateMiddleware(schema: ZodSchema<any>) {
    return async (req: Request) => {
        try {
            const body = await req.json();
            const validatedBody = schema.parse(body);
            // 検証済みデータをリクエストオブジェクトに添付する場合は、
            // 独自の方法で管理する必要があります（例: カスタムヘッダーやストレージ）
            // ここでは検証成功後に次の処理へ進む
            return NextResponse.next();
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
    };
}
