import { injectable, inject } from "tsyringe";
import type { IProblemRepository } from "@/interfaces/repositories/IProblemRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { Problem } from "@/schemas/problemSchemas";
import { ProblemSchema, PartialProblemSchema } from "@/schemas/problemSchemas";

@injectable()
export class ProblemRepository implements IProblemRepository {
    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    private collectionRef(serviceId: string) {
        const firestore = this.firebaseAdmin.getFirestore();
        return firestore.collection("problemServices").doc(serviceId).collection("problems");
    }

    async findByCategory(serviceId: string, category: string): Promise<Problem[]> {
        const colRef = this.collectionRef(serviceId);
        const querySnapshot = await colRef.where("category", "==", category).get();
        const problems: Problem[] = [];
        querySnapshot.forEach((docSnap) => {
            const parsed = ProblemSchema.safeParse(docSnap.data());
            if (parsed.success) {
                problems.push(parsed.data);
            } else {
                this.logger.warn(`Invalid problem data: ${docSnap.id}`, { errors: parsed.error.errors });
            }
        });
        return problems;
    }

    async findByDifficulty(serviceId: string, difficulty: string): Promise<Problem[]> {
        const colRef = this.collectionRef(serviceId);
        const querySnapshot = await colRef.where("difficulty", "==", difficulty).get();
        const problems: Problem[] = [];
        querySnapshot.forEach((docSnap) => {
            const parsed = ProblemSchema.safeParse(docSnap.data());
            if (parsed.success) {
                problems.push(parsed.data);
            } else {
                this.logger.warn(`Invalid problem data: ${docSnap.id}`, { errors: parsed.error.errors });
            }
        });
        return problems;
    }

    async findById(serviceId: string, id: string): Promise<Problem | null> {
        const colRef = this.collectionRef(serviceId);
        const docSnap = await colRef.doc(id).get();
        if (docSnap.exists) {
            const parsed = ProblemSchema.safeParse(docSnap.data());
            if (parsed.success) {
                return parsed.data;
            } else {
                this.logger.warn(`Invalid problem data: ${id}`, { errors: parsed.error.errors });
            }
        }
        return null;
    }

    async create(serviceId: string, problemData: Problem): Promise<string> {
        const colRef = this.collectionRef(serviceId);
        const parsed = ProblemSchema.safeParse(problemData);
        if (!parsed.success) {
            this.logger.warn("Invalid problem data", { errors: parsed.error.errors });
            throw new Error("Invalid problem data");
        }
        const docRef = await colRef.add(parsed.data);
        this.logger.info(`Problem added: ${docRef.id} under serviceId=${serviceId}`);
        return docRef.id;
    }

    async update(serviceId: string, id: string, problemData: Partial<Problem>): Promise<void> {
        const colRef = this.collectionRef(serviceId);
        const parsed = PartialProblemSchema.safeParse(problemData);
        if (!parsed.success) {
            this.logger.warn("Invalid problem data for update", { errors: parsed.error.errors });
            throw new Error("Invalid problem data for update");
        }
        await colRef.doc(id).update(parsed.data);
        this.logger.info(`Problem updated: ${id} under serviceId=${serviceId}`);
    }

    async delete(serviceId: string, id: string): Promise<void> {
        const colRef = this.collectionRef(serviceId);
        await colRef.doc(id).delete();
        this.logger.info(`Problem deleted: ${id} under serviceId=${serviceId}`);
    }
}
