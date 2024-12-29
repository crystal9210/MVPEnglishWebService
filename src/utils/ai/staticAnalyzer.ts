// TODO
import { SessionStatistics, ProblemStatistics } from "@/schemas/statisticSchemas";

/**
 * Analyze user statistics to generate insights.
 * @param stats - User's session statistics.
 * @returns Insights such as areas of weakness and trends.
 */
export const analyzeStatistics = (stats: SessionStatistics) => {
  const insights = {
    weakCategories: [] as string[],
    trends: {} as Record<string, string>,
  };

  // Identify weak categories
  insights.weakCategories = Object.keys(stats.categoryPerformance).filter(
    (category) => stats.categoryPerformance[category] < 50
  );

  // Detect trends (e.g., improvement or decline in performance)
  insights.trends = detectTrends(stats);

  return insights;
};

/**
 * Detect trends in the user's performance over time.
 * @param stats - User's statistics.
 * @returns Trends as a record of category and trend.
 */
const detectTrends = (stats: SessionStatistics): Record<string, string> => {
  const trends: Record<string, string> = {};

  stats.scoreHistory.forEach((score, index) => {
    if (index > 0) {
      const previousScore = stats.scoreHistory[index - 1];
      trends[`Attempt ${index}`] = score > previousScore ? "Improving" : "Declining";
    }
  });

  return trends;
};
