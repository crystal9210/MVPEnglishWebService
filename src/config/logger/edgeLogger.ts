import type { LoggerInterface } from "./index";

export class EdgeLogger implements LoggerInterface {
    private logs: any[] = [];

    async info(msg: string, meta?: any) {
        console.log(`[EdgeLogger][INFO] ${msg}`, meta);
        this.logs.push({
            level: "info",
            msg,
            meta,
            ts: new Date().toISOString(),
        });
    }

    async error(msg: string, meta?: any) {
        console.error(`[EdgeLogger][ERROR] ${msg}`, meta);
        this.logs.push({
            level: "error",
            msg,
            meta,
            ts: new Date().toISOString(),
        });
        // もしLogtailや他サービスに送信したければ fetch(...) で送る
    }

    async debug(msg: string, meta?: any) {
        console.debug(`[EdgeLogger][DEBUG] ${msg}`, meta);
        this.logs.push({
            level: "debug",
            msg,
            meta,
            ts: new Date().toISOString(),
        });
    }
}
