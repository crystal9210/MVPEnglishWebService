// sanitizeInputUniversal.ts

/**
 * 非同期で動的にインポート:
 *  - サーバーサイド => sanitizeInput.server.ts
 *  - クライアントサイド => sanitizeInput.client.ts
 * これによりクライアント時に 'jsdom' が静的解析されず bundleされにくい
 */

const isServer = typeof window === "undefined";

export async function sanitizeInputUniversal(input: string): Promise<string> {
  if (isServer) {
    const { sanitizeInputServer } = await import("./sanitizeInput.server");
    return sanitizeInputServer(input);
  } else {
    const { sanitizeInputClient } = await import("./sanitizeInput.client");
    return sanitizeInputClient(input);
  }
}
