import type { LoggerInterface } from "./index";

export class NodeLogger implements LoggerInterface {
    async info(msg: string, meta?: any) {
        console.log(`[NodeLogger][INFO] ${msg}`, meta);
    }
    async error(msg: string, meta?: any) {
        console.error(`[NodeLogger][ERROR] ${msg}`, meta);
    }
    async debug(msg: string, meta?: any) {
        console.debug(`[NodeLogger][DEBUG] ${msg}`, meta);
    }
}
