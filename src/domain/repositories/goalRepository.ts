import { injectable } from "tsyringe";
import {
    Firestore,
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { Goal, GoalSchema } from "@/schemas/goalSchemas";
import { GOAL_STATUS, GoalStatus } from "@/constants/sessions/sessions";
import { IGoalRepository } from "@/interfaces/repositories/IGoalRepository";
@injectable()
export class GoalRepository implements IGoalRepository {
    private db: Firestore;

    constructor(db: Firestore) {
        this.db = db;
    }

    private getGoalsCollection(userId: string) {
        return collection(this.db, "users", userId, "goals");
    }

    async createGoal(userId: string, goal: Goal): Promise<string> {
        const goalsCol = this.getGoalsCollection(userId);
        const goalDoc = doc(goalsCol);
        const parsedGoal = GoalSchema.parse(goal);
        await setDoc(goalDoc, parsedGoal);
        return goalDoc.id;
    }

    async getGoal(userId: string, goalId: string): Promise<Goal | null> {
        const goalDoc = doc(this.getGoalsCollection(userId), goalId);
        const docSnap = await getDoc(goalDoc);
        if (docSnap.exists()) {
            return GoalSchema.parse(docSnap.data());
        }
        return null;
    }

    async updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void> {
        const goalDoc = doc(this.getGoalsCollection(userId), goalId);
        const existingGoal = await this.getGoal(userId, goalId);
        if (!existingGoal) {
            throw new Error("Goal not found");
        }
        const mergedGoal = GoalSchema.parse({ ...existingGoal, ...updates });

        await updateDoc(goalDoc, mergedGoal);
    }

    async deleteGoal(userId: string, goalId: string): Promise<void> {
        const goalDoc = doc(this.getGoalsCollection(userId), goalId);
        await deleteDoc(goalDoc);
    }

    async getAllGoals(userId: string): Promise<Goal[]> {
        const goalsCol = this.getGoalsCollection(userId);
        const querySnapshot = await getDocs(goalsCol);
        return querySnapshot.docs.map((docSnap) => GoalSchema.parse(docSnap.data()));
    }

    async getAllActiveGoals(userId: string): Promise<Goal[]> {
        const goalsCol = this.getGoalsCollection(userId);
        const q = query(goalsCol, where("status", "==", GOAL_STATUS.ACTIVE));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((docSnap) => GoalSchema.parse(docSnap.data()));
    }

    async getGoalsByStatus(userId: string, status: GoalStatus): Promise<Goal[]> {
        const goalsCollection = this.getGoalsCollection(userId);
        const q = query(goalsCollection, where("status", "==", status));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((docSnap) => GoalSchema.parse(docSnap.data()));
    }
}
