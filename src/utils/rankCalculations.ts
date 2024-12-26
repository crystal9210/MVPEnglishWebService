import { UserRankType, USER_RANK_TYPES, ProblemDifficultyLevel, PROBLEM_DIFFICULTY_LEVEL_TYPES } from "@/constants/userStatisticTypes";
import { UserInput } from "@/schemas/activity/userInputSchemas";

/**
 * Determines the user rank based on total points.
 *
 * @param totalPoints - The total points accumulated by the user.
 * @returns The determined rank.
 */
export function determineUserRank(totalPoints: number): UserRankType {
    if (totalPoints >= 6000) return USER_RANK_TYPES.PLATINUM;
    if (totalPoints >= 3000) return USER_RANK_TYPES.GOLD;
    if (totalPoints >= 1000) return USER_RANK_TYPES.SILVER;
    return USER_RANK_TYPES.BRONZE;
}

/**
 * Calculates the average of an array of numbers.
 *
 * @param numbers - The array of numbers to average.
 * @returns The average value.
 */
export function calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum / numbers.length;
}

/**
 * Determines the rank for a problem based on difficulty and average response time.
 *
 * @param difficulty - The difficulty level of the problem.
 * @param averageResponseTime - The average response time in seconds.
 * @returns The determined rank for the problem.
 */
export function determineProblemRank(difficulty: ProblemDifficultyLevel, averageResponseTime: number): UserRankType {
    if (difficulty >= PROBLEM_DIFFICULTY_LEVEL_TYPES.VERY_HARD && averageResponseTime < 30) {
        return USER_RANK_TYPES.PLATINUM;
    } else if (difficulty >= PROBLEM_DIFFICULTY_LEVEL_TYPES.HARD && averageResponseTime < 60) {
        return USER_RANK_TYPES.GOLD;
    } else if (difficulty >= PROBLEM_DIFFICULTY_LEVEL_TYPES.MEDIUM && averageResponseTime < 90) {
        return USER_RANK_TYPES.SILVER;
    } else {
        return USER_RANK_TYPES.BRONZE;
    }
}

/**
 * Calculates the points for a problem based on its rank and difficulty.
 *
 * @param rank - The rank of the problem.
 * @param difficulty - The difficulty level of the problem.
 * @returns The points awarded for the problem.
 */
export function calculateProblemPoints(rank: UserRankType, difficulty: ProblemDifficultyLevel): number {
    switch (rank) {
        case USER_RANK_TYPES.BRONZE:
            return difficulty * 10;
        case USER_RANK_TYPES.SILVER:
            return difficulty * 20;
        case USER_RANK_TYPES.GOLD:
            return difficulty * 30;
        case USER_RANK_TYPES.PLATINUM:
            return difficulty * 50;
        default:
            return 0;
    }
}

/**
 * Evaluates user input quality and adjusts problem rank accordingly.
 *
 * @param userInput - The user's input data for a problem.
 * @returns The adjusted rank based on input quality.
 */
export function evaluateUserInputAndAdjustRank(userInput: UserInput): UserRankType {
    const correctAnswers = userInput.input.filter(input => input.isCorrect).length;
    const totalAnswers = userInput.input.length;
    const correctRate = (correctAnswers / totalAnswers) * 100;

    // TODO adjustment the logic
    if (correctRate >= 90) {
        return USER_RANK_TYPES.PLATINUM;
    } else if (correctRate >= 75) {
        return USER_RANK_TYPES.GOLD;
    } else if (correctRate >= 50) {
        return USER_RANK_TYPES.SILVER;
    } else {
        return USER_RANK_TYPES.BRONZE;
    }
}
