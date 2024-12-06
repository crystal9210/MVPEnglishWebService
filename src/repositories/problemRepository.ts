import { injectable, inject } from "tsyringe";
import { CollectionReference, DocumentData, QuerySnapshot } from "firebase-admin/firestore";
import { ProblemSchema, Problem, PartialProblemSchema } from "../schemas/problemSchemas";
import { Firestore } from "firebase-admin/firestore";
import { LoggerService } from "@/services/loggerService";
import { IProblemRepository } from "@/interfaces/repositories/IProblemRepository";

@injectable()
export class ProblemRepository implements IProblemRepository {
    private problemsCollection: CollectionReference<DocumentData>;

    constructor(
        @inject("Firestore") private firestore: Firestore,
        @inject(LoggerService) private logger: LoggerService
    ) {
        this.problemsCollection = firestore.collection("problems");
    }

    async findByCategory(category: string): Promise<Problem[]> {
        try {
            const querySnapshot: QuerySnapshot<DocumentData> = await this.problemsCollection.where("category", "==", category).get();

            const problems: Problem[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const parsed = ProblemSchema.safeParse(data);
                if (parsed.success) {
                    problems.push(parsed.data);
                } else {
                    this.logger.warn(`Invalid problem data: ${docSnap.id}`, { errors: parsed.error.errors });
                }
            });
            return problems;
        } catch (error) {
            this.logger.error("Failed to find problems by category", { error });
            throw error;
        }
    }

    async findByDifficulty(difficulty: string): Promise<Problem[]> {
        try {
            const querySnapshot: QuerySnapshot<DocumentData> = await this.problemsCollection.where("difficulty", "==", difficulty).get();

            const problems: Problem[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const parsed = ProblemSchema.safeParse(data);
                if (parsed.success) {
                    problems.push(parsed.data);
                } else {
                    this.logger.warn(`Invalid problem data: ${docSnap.id}`, { errors: parsed.error.errors });
                }
            });
            return problems;
        } catch (error) {
            this.logger.error("Failed to find problems by difficulty", { error });
            throw error;
        }
    }

    async findById(id: string): Promise<Problem | null> {
        try {
            const problemRef = this.problemsCollection.doc(id);
            const docSnap = await problemRef.get();
            if (docSnap.exists) {
                const data = docSnap.data();
                const parsed = ProblemSchema.safeParse(data);
                if (parsed.success) {
                    return parsed.data;
                } else {
                    this.logger.warn(`Invalid problem data: ${id}`, { errors: parsed.error.errors });
                }
            }
            return null;
        } catch (error) {
            this.logger.error(`Failed to find problem by ID: ${id}`, { error });
            throw error;
        }
    }

    async create(problemData: Problem): Promise<string> {
        try {
            const parsed = ProblemSchema.safeParse(problemData);
            if (!parsed.success) {
                this.logger.warn("Invalid problem data", { errors: parsed.error.errors });
                throw new Error("Invalid problem data");
            }
            const docRef = await this.problemsCollection.add(parsed.data);
            this.logger.info(`Problem added with ID: ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            this.logger.error("Failed to add problem", { error });
            throw error;
        }
    }

    async update(id: string, problemData: Partial<Problem>): Promise<void> {
        try {
            const problemRef = this.problemsCollection.doc(id);
            const parsed = PartialProblemSchema.safeParse(problemData);
            if (!parsed.success) {
                this.logger.warn("Invalid problem data for update", { errors: parsed.error.errors });
                throw new Error("Invalid problem data for update");
            }
            await problemRef.update(parsed.data);
            this.logger.info(`Problem updated with ID: ${id}`);
        } catch (error) {
            this.logger.error(`Failed to update problem with ID: ${id}`, { error });
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const problemRef = this.problemsCollection.doc(id);
            await problemRef.delete();
            this.logger.info(`Problem deleted with ID: ${id}`);
        } catch (error) {
            this.logger.error(`Failed to delete problem with ID: ${id}`, { error });
            throw error;
        }
    }
}
