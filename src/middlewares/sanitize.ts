// src/middlewares/sanitize.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { NextResponse } from 'next/server';

/**
 * 入力データをサニタイズするミドルウェア
 * @param fields サニタイズ対象のフィールド名
 * @returns NextMiddleware
 */
export function sanitizeMiddleware(fields: string[]) {
    return async (req: Request) => {
        try {
            const body = await req.json();
            const window = new JSDOM('').window;
            const purify = DOMPurify(window);

            fields.forEach(field => {
                if (body[field] && typeof body[field] === 'string') {
                    body[field] = purify.sanitize(body[field]);
                }
            });

            // サニタイズ済みデータをリクエストオブジェクトに添付する場合は、
            // 独自の方法で管理する必要があります。
            // ここではサニタイズ成功後に次の処理へ進む
            return NextResponse.next();
        } catch (error) {
            return NextResponse.json(
                { error: 'Sanitization Error' },
                { status: 400 }
            );
        }
    };
}
