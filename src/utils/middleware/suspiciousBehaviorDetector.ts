/**
 * Detects suspicious behavior based on IP history.
 */
export class SuspiciousBehaviorDetector {
    private ipHistoryLimit: number;

    /**
     * Creates an instance of SuspiciousBehaviorDetector.
     * @param ipHistoryLimit - The maximum number of unique IP addresses allowed for a given fingerprint.
     */
    constructor(ipHistoryLimit: number) {
        this.ipHistoryLimit = ipHistoryLimit;
    }

    /**
     * Checks if the current IP address is suspicious based on the history.
     * @param history - The set of IP addresses associated with a fingerprint.
     * @param currentIp - The current IP address.
     * @returns True if the behavior is suspicious, false otherwise.
     */
    isSuspicious(history: Set<string>, currentIp: string): boolean {
        if (!history.has(currentIp)) {
            history.add(currentIp);
            if (history.size > this.ipHistoryLimit) {
                return true; // Too many different IPs for the same fingerprint
            }
        }
        return false;
    }
}
