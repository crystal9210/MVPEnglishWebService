import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { NextResponse } from 'next/server';

/**
 * 入力データをサニタイズするミドルウェア
 * サーバサイド専用の処理を追加
 * @param fields サニタイズ対象のフィールド名
 * @returns NextMiddleware
 */
export function sanitizeMiddleware(fields: string[]) {
    return async (req: Request) => {
        try {
            const body = await req.json();

            // サーバサイドでのみ JSDOM を使用して DOMPurify をセットアップ
            const purify = typeof window === "undefined" ? DOMPurify(new JSDOM('').window) : null;

            fields.forEach(field => {
                if (body[field] && typeof body[field] === 'string') {
                    body[field] = purify ? purify.sanitize(body[field]) : body[field];
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
