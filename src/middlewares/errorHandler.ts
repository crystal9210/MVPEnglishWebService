import { NextResponse } from 'next/server';

/**
 * エラーハンドリングミドルウェア
 * @param error エラーオブジェクト
 * @returns NextResponse
 */
export function errorHandlerMiddleware(error: Error) {
    console.error(error);
    return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
    );
}
