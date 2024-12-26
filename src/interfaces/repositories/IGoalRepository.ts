import { GoalStatus } from "@/constants/sessions/sessions";
import { Goal } from "@/schemas/goalSchemas";

export interface IGoalRepository {
    /**
     * Creates a new goal.
     * @param userId The ID of the user creating the goal.
     * @param goal The goal data.
     * @returns The ID of the newly created goal.
     */
    createGoal(userId: string, goal: Goal): Promise<string>;

    /**
     * Gets a goal by ID.
     * @param userId The ID of the user who owns the goal.
     * @param goalId The ID of the goal to retrieve.
     * @returns The goal data, or null if not found.
     */
    getGoal(userId: string, goalId: string): Promise<Goal | null>;

    /**
     * Updates an existing goal.
     * @param userId The ID of the user who owns the goal.
     * @param goalId The ID of the goal to update.
     * @param updates The fields to update.
     */
    updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void>;

    /**
     * Deletes a goal.
     * @param userId The ID of the user who owns the goal.
     * @param goalId The ID of the goal to delete.
     */
    deleteGoal(userId: string, goalId: string): Promise<void>;

    /**
     * Gets all goals for a user.
     * @param userId The ID of the user to retrieve goals for.
     * @returns An array of goals.
     */
    getAllGoals(userId: string): Promise<Goal[]>;

    /**
     * Gets all active goals for a user.
     * @param userId The ID of the user to retrieve active goals for.
     * @returns An array of active goals.
     */
    getAllActiveGoals(userId: string): Promise<Goal[]>;

    /**
     * Gets goals by status for a user.
     * @param userId The ID of the user to retrieve goals for.
     * @param status The status of the goals to retrieve.
     * @returns An array of goals.
     */
    getGoalsByStatus(userId: string, status: GoalStatus): Promise<Goal[]>;
}
