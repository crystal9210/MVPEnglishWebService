/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import type { IProblemRepository } from "@/interfaces/repositories/IProblemRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { Problem } from "@/schemas/problemSchemas";
import { ProblemSchema } from "@/schemas/problemSchemas";

@injectable()
export class ProblemRepository implements IProblemRepository {
    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    private collection(serviceId: string) {
        const firestore = this.firebaseAdmin.getFirestore();
        return firestore.collection("problemServices").doc(serviceId).collection("problems");
    }

    private validateData(data: unknown): Problem | null {
        const parsed = ProblemSchema.safeParse(data);
        if (parsed.success) {
            return parsed.data;
        }
        this.logger.warn("Invalid problem data", { errors: parsed.error.errors });
        return null;
    }

    async getProblemById(serviceId: string, problemId: string): Promise<Problem | null> {
        const docSnap = await this.collection(serviceId).doc(problemId).get();
        if (!docSnap.exists) {
            this.logger.warn(`Problem not found: serviceId=${serviceId}, PID=${problemId}`);
            return null;
        }
        const problem = this.validateData(docSnap.data());
        if (!problem) {
            this.logger.warn(`Invalid problem at ID=${problemId} in serviceId=${serviceId}`);
            return null;
        }
        return problem;
    }

    async findProblemsByCategory(serviceId: string, category: string): Promise<Problem[]> {
        const querySnap = await this.collection(serviceId).where("category", "==", category).get();
        const problems: Problem[] = [];
        querySnap.forEach(doc => {
            const p = this.validateData(doc.data());
            if (p) problems.push(p);
        });
        return problems;
    }

    async findProblemsByDifficulty(serviceId: string, difficulty: string): Promise<Problem[]> {
        const querySnap = await this.collection(serviceId).where("difficulty", "==", difficulty).get();
        const problems: Problem[] = [];
        querySnap.forEach(doc => {
            const p = this.validateData(doc.data());
            if (p) problems.push(p);
        });
        return problems;
    }

    async findAllProblems(serviceId: string): Promise<Problem[]> {
        const querySnap = await this.collection(serviceId).get();
        const problems: Problem[] = [];
        querySnap.forEach(doc => {
            const p = this.validateData(doc.data());
            if (p) problems.push(p);
        });
        return problems;
    }

    async findProblemsByCategories(serviceId: string, categories: string[]): Promise<Problem[]> {
        // FirestoreにORクエリ（複数条件）を直接書くにはlimitがあるので複数クエリを行い合体する必要がある
        // ここでは単純にcategoriesをループして合体
        let allProblems: Problem[] = [];
        for (const cat of categories) {
            const catProblems = await this.findProblemsByCategory(serviceId, cat);
            allProblems = allProblems.concat(catProblems);
        }
        return allProblems;
    }

    async findProblemsByDifficulties(serviceId: string, difficulties: string[]): Promise<Problem[]> {
        let allProblems: Problem[] = [];
        for (const diff of difficulties) {
            const diffProblems = await this.findProblemsByDifficulty(serviceId, diff);
            allProblems = allProblems.concat(diffProblems);
        }
        return allProblems;
    }

    async findProblemsWithFilters(serviceId: string, filters: {categories?: string[], difficulties?: string[]}): Promise<Problem[]> {
        // categories, difficultiesが両方指定された場合はAND条件とする
        // Firestoreは複数whereでANDは可能だがORは難しい
        // ここでは複数クエリ+合体後にフィルタするロジック
        let problems = await this.findAllProblems(serviceId);

        if (filters.categories) {
            problems = problems.filter(p => filters.categories!.includes(p.category));
        }

        if (filters.difficulties) {
            problems = problems.filter(p => filters.difficulties!.includes(p.difficulty));
        }

        return problems;
    }
}
