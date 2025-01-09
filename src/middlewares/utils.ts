import { NextRequest } from "next/server";

/**
 * NextRequestからIPアドレスを取得するヘルパー関数
 * 公式ドキュメントでも `req.ip` は安定しない可能性があるため
 * x-forwarded-for ヘッダーを優先使用
 */
export function getClientIp(req: NextRequest): string {
    // req.ip は将来的にEdge環境等でサポートされる可能性あり
    // ただし現時点では常にundefinedになるケースも
    // そのため x-forwarded-for を優先しつつ fallback
    const ipFromHeader = req.headers.get("x-forwarded-for");
    return ipFromHeader || "unknown";
}
