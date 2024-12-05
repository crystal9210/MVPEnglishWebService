import { Logger } from "./logger";

interface RetryOptions {
    retries?: number;
    delay?: number;
    factor?: number; // 遅延時間を増加させるための係数
}

export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { retries = 3, delay = 1000, factor = 2 } = options;
    let attempt = 0;
    let currentDelay = delay;

    while (attempt <= retries) {
        try {
        return await fn();
        } catch (error) {
        if (attempt === retries) {
            Logger.error(`Retry failed after ${retries + 1} attempts`, error);
            throw error;
        }
        Logger.warn(`Attempt ${attempt + 1} failed. Retrying in ${currentDelay}ms...`, error);
        await new Promise((res) => setTimeout(res, currentDelay));
        attempt++;
        currentDelay *= factor; // 遅延時間を増加
        }
    }

    // このコードには到達しないが、型のために必要
    throw new Error("Retry failed");
}
