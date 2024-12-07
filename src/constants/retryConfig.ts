interface RetryConfig {
    defaultRetries: number;
    defaultDelay: number;
    defaultFactor: number;
}

const retryConfig: RetryConfig = {
    defaultRetries: parseInt(process.env.RETRY_RETRIES || "3", 10),
    defaultDelay: parseInt(process.env.RETRY_DELAY || "1000", 10), // ミリ秒
    defaultFactor: parseFloat(process.env.RETRY_FACTOR || "2")
};

export default retryConfig;
