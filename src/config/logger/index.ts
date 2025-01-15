import { EdgeLogger } from "./edgeLogger";
import { NodeLogger } from "./nodeLogger";
import { LogtailLogger } from "./logtailLogger";

export interface LoggerInterface {
    info(msg: string, meta?: any): Promise<void>;
    error(msg: string, meta?: any): Promise<void>;
    debug(msg: string, meta?: any): Promise<void>;
}

function detectRuntime(): "edge" | "node" {
    // Edge Runtimeの場合、Vercelなら process.env.NEXT_RUNTIME === "edge"
    // あるいは "globalThis.EdgeRuntime" をチェックする方法も
    if (process.env.NEXT_RUNTIME === "edge") {
        return "edge";
    }
    return "node";
}

let logger: LoggerInterface;

// ランタイムやNODE_ENVで判断
const runtime = detectRuntime();
const isProduction = process.env.NODE_ENV === "production";

// ※ 下記はあくまでも一例
if (runtime === "edge") {
    // Edgeでは外部サービス(Logtail)に直送 or メモリ保持 → バッチ送信などが多い
    // 今回は簡単にEdgeLoggerを用意した例
    logger = new EdgeLogger();
} else {
    // Node.jsの場合
    if (isProduction) {
        // 本番でLogtail等の外部サービスへ送信
        logger = new LogtailLogger(process.env.LOGTAIL_TOKEN!);
    } else {
        // 開発中はNodeLoggerでコンソール出力のみ等
        logger = new NodeLogger();
    }
}

export { logger };
