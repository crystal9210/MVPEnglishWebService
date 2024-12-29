// TODO
import { Problem, ProblemSchema } from "@/schemas/problemSchemas";
import { SessionStatistics } from "@/schemas/statisticSchemas";
import { z } from "zod";

/**
 * Generate a problem set based on user statistics and preferences.
 * @param userStats - The user's historical performance data.
 * @param preferences - User-specified settings such as difficulty, categories, etc.
 * @returns A generated problem set.
 */
export const generateProblemSet = (userStats: SessionStatistics, preferences: z.infer<typeof ProblemSchema>) => {
  const problems: Problem[] = []; // Collect problems based on userStats and preferences

  // Example: Focus on categories with lower performance
  const lowPerformanceCategories = Object.entries(userStats.categoryPerformance)
    .filter(([_, performance]) => performance < preferences.difficultyThreshold)
    .map(([category]) => category);

  lowPerformanceCategories.forEach((category) => {
    // Fetch problems from database or schema
    const fetchedProblems = fetchProblemsForCategory(category, preferences);
    problems.push(...fetchedProblems);
  });

  return problems.slice(0, preferences.problemLimit || 10);
};

/**
 * Fetch problems for a specific category based on preferences.
 * @param category - The category to fetch problems for.
 * @param preferences - User preferences.
 * @returns An array of problems.
 */
const fetchProblemsForCategory = (category: string, preferences: any): Problem[] => {
  // Example implementation - Replace with actual database retrieval
  return [
    {
      id: "example-problem",
      questionType: "MULTIPLE_CHOICE",
      serviceId: "SERVICE_A",
      categoryId: category,
      title: "Example Problem Title",
      description: "Example problem description",
      difficulty: "EASY",
      tags: ["example", "test"],
    },
  ] as Problem[];
};
