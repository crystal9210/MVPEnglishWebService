import type { LoggerInterface } from "./index";
import fetch from "node-fetch";

export class LogtailLogger implements LoggerInterface {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    async info(msg: string, meta?: any) {
        await this.sendLog("info", msg, meta);
    }

    async error(msg: string, meta?: any) {
        await this.sendLog("error", msg, meta);
    }

    // TODO >> Is it really needed in the prod env? (If not needed, delete this method.)
    async debug(msg: string, meta?: any) {
        await this.sendLog("debug", msg, meta);
    }

    private async sendLog(level: string, message: string, meta?: any) {
        const payload = {
            dt: new Date().toISOString(),
            level,
            message,
            ...meta,
        };
        try {
            await fetch("https://in.logtail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.token}`,
                },
                body: JSON.stringify([payload]),
            });
        } catch (err) {
            console.error("[LogtailLogger] Failed to send log:", err);
        }
    }
}
