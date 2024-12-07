/**
 * リトライすべきエラーか判定する型ガード関数
 * @param error エラーオブジェクト
 * @returns リトライすべき場合は true
 */
export function isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
        // エラーの種類やメッセージに基づいてリトライの可否を判定
        const retryableMessages = [
            "NetworkError",
            "ServiceUnavailable",
            "Timeout",
            // その他リトライすべきエラーメッセージを追加
        ];

        return retryableMessages.some(msg => error.message.includes(msg));
    }
    return false;
}
