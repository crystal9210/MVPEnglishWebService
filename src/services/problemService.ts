// src/services/problemService.ts

import { firestore } from "./firebaseClient";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
} from "firebase/firestore";
import { ProblemSchema, Problem, PartialProblemSchema } from "../schemas/problemSchemas";
import { injectable } from "tsyringe";
import { Logger } from "@/utils/logger";

@injectable()
export class ProblemService {
    private problemsCollection = collection(firestore, "problems");

    async getProblemsByCategory(category: string): Promise<Problem[]> {
        try {
        const q = query(this.problemsCollection, where("category", "==", category));
        const querySnapshot = await getDocs(q);

        const problems: Problem[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data() as DocumentData;
            const parsed = ProblemSchema.safeParse(data);
            if (parsed.success) {
            problems.push(parsed.data);
            } else {
            Logger.warn(`Invalid problem data: ${docSnap.id}`);
            }
        });
        return problems;
        } catch (error) {
        Logger.error("Failed to get problems by category", error);
        throw error;
        }
    }

    async getProblemsByDifficulty(difficulty: string): Promise<Problem[]> {
        try {
        const q = query(
            this.problemsCollection,
            where("difficulty", "==", difficulty)
        );
        const querySnapshot = await getDocs(q);

        const problems: Problem[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data() as DocumentData;
            const parsed = ProblemSchema.safeParse(data);
            if (parsed.success) {
            problems.push(parsed.data);
            } else {
            Logger.warn(`Invalid problem data: ${docSnap.id}`);
            }
        });
        return problems;
        } catch (error) {
        Logger.error("Failed to get problems by difficulty", error);
        throw error;
        }
    }

    async getProblemById(id: string): Promise<Problem | null> {
        try {
        const problemRef = doc(this.problemsCollection, id);
        const docSnap = await getDoc(problemRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const parsed = ProblemSchema.safeParse(data);
            if (parsed.success) {
            return parsed.data;
            } else {
            Logger.warn(`Invalid problem data: ${id}`);
            }
        }
        return null;
        } catch (error) {
        Logger.error(`Failed to get problem by ID: ${id}`, error);
        throw error;
        }
    }

    async addProblem(problemData: Problem): Promise<string> {
        try {
        const parsed = ProblemSchema.safeParse(problemData);
        if (!parsed.success) {
            throw new Error("Invalid problem data");
        }
        const docRef = await addDoc(this.problemsCollection, parsed.data);
        Logger.info(`Problem added with ID: ${docRef.id}`);
        return docRef.id;
        } catch (error) {
        Logger.error("Failed to add problem", error);
        throw error;
        }
    }

    async updateProblem(id: string, problemData: Partial<Problem>): Promise<void> {
        try {
        const problemRef = doc(this.problemsCollection, id);
        const parsed = PartialProblemSchema.safeParse(problemData);
        if (!parsed.success) {
            throw new Error("Invalid problem data for update");
        }
        await updateDoc(problemRef, parsed.data);
        Logger.info(`Problem updated with ID: ${id}`);
        } catch (error) {
        Logger.error(`Failed to update problem with ID: ${id}`, error);
        throw error;
        }
    }

    async deleteProblem(id: string): Promise<void> {
        try {
        const problemRef = doc(this.problemsCollection, id);
        await deleteDoc(problemRef);
        Logger.info(`Problem deleted with ID: ${id}`);
        } catch (error) {
        Logger.error(`Failed to delete problem with ID: ${id}`, error);
        throw error;
        }
    }
}
