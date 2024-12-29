import { SessionStatistics } from "@/schemas/statisticSchemas";

export class SessionStatisticsEntity implements SessionStatistics {
    period: "daily" | "weekly" | "monthly"; // TODO >> make constants file
    totalSessions: number;
    totalSpentTime: number;
    averageSpentTime: number;
    averageCorrectRate: number;
    goalsAchieved: number;
    problemCorrectRates: Record<string, number>;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: SessionStatistics) {
        this.period = data.period;
        this.totalSessions = data.totalSessions;
        this.totalSpentTime = data.totalSpentTime;
        this.averageSpentTime = data.averageSpentTime;
        this.averageCorrectRate = data.averageCorrectRate;
        this.goalsAchieved = data.goalsAchieved;
        this.problemCorrectRates = data.problemCorrectRates;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
