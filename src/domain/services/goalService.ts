/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import type { IGoalRepository } from "@/interfaces/repositories/IGoalRepository";
import { IGoalService } from "@/interfaces/services/IGoalService";
import { Goal } from "@/schemas/goalSchemas";
import { GoalStatus } from "@/constants/sessions/sessions";

@injectable()
export class GoalService implements IGoalService {
    constructor(@inject("IGoalRepository") private goalRepository: IGoalRepository) {}

    async createGoal(userId: string, goal: Goal): Promise<string> {
        return this.goalRepository.createGoal(userId, goal);
    }

    async getGoal(userId: string, goalId: string): Promise<Goal | null> {
        return this.goalRepository.getGoal(userId, goalId);
    }

    async updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void> {
        await this.goalRepository.updateGoal(userId, goalId, updates);
    }

    async deleteGoal(userId: string, goalId: string): Promise<void> {
        await this.goalRepository.deleteGoal(userId, goalId);
    }

    async getAllGoals(userId: string): Promise<Goal[]> {
        return this.goalRepository.getAllGoals(userId);
    }

    async getGoalsByStatus(userId: string, status: GoalStatus): Promise<Goal[]> {
        return this.goalRepository.getGoalsByStatus(userId, status);
    }
}
