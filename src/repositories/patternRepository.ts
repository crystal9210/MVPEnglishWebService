import { injectable, inject } from "tsyringe";
import { CollectionReference, DocumentData, QuerySnapshot } from "firebase-admin/firestore";
import { PatternSchema, Pattern } from "../schemas/problemSchemas";
import { Firestore } from "firebase-admin/firestore";
import { LoggerService } from "@/services/loggerService";
import { IPatternRepository } from "@/repositories/interfaces/IPatternRepository";

@injectable()
export class PatternRepository implements IPatternRepository {
    private patternsCollection: CollectionReference<DocumentData>;

    constructor(
        @inject("Firestore") private firestore: Firestore,
        @inject(LoggerService) private logger: LoggerService
    ) {
        this.patternsCollection = firestore.collection("patterns");
    }

    async findAll(): Promise<Pattern[]> {
        try {
            const querySnapshot: QuerySnapshot<DocumentData> = await this.patternsCollection.get();

            const patterns: Pattern[] = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const parsed = PatternSchema.safeParse(data);
                if (parsed.success) {
                    patterns.push(parsed.data);
                } else {
                    this.logger.warn(`Invalid pattern data: ${docSnap.id}`, { errors: parsed.error.errors });
                }
            });
            return patterns;
        } catch (error) {
            this.logger.error("Failed to find all patterns", { error });
            throw error;
        }
    }

    async findById(id: string): Promise<Pattern | null> {
        try {
            const patternRef = this.patternsCollection.doc(id);
            const docSnap = await patternRef.get();
            if (docSnap.exists) {
                const data = docSnap.data();
                const parsed = PatternSchema.safeParse(data);
                if (parsed.success) {
                    return parsed.data;
                } else {
                    this.logger.warn(`Invalid pattern data: ${id}`, { errors: parsed.error.errors });
                }
            }
            return null;
        } catch (error) {
            this.logger.error(`Failed to find pattern by ID: ${id}`, { error });
            throw error;
        }
    }

    async create(patternData: Pattern): Promise<string> {
        try {
            const parsed = PatternSchema.safeParse(patternData);
            if (!parsed.success) {
                this.logger.warn("Invalid pattern data", { errors: parsed.error.errors });
                throw new Error("Invalid pattern data");
            }
            const docRef = await this.patternsCollection.add(parsed.data);
            this.logger.info(`Pattern added with ID: ${docRef.id}`);
            return docRef.id;
        } catch (error) {
            this.logger.error("Failed to add pattern", { error });
            throw error;
        }
    }

    async update(id: string, patternData: Partial<Pattern>): Promise<void> {
        try {
            const patternRef = this.patternsCollection.doc(id);
            const parsed = PatternSchema.partial().safeParse(patternData);
            if (!parsed.success) {
                this.logger.warn("Invalid pattern data for update", { errors: parsed.error.errors });
                throw new Error("Invalid pattern data for update");
            }
            await patternRef.update(parsed.data);
            this.logger.info(`Pattern updated with ID: ${id}`);
        } catch (error) {
            this.logger.error(`Failed to update pattern with ID: ${id}`, { error });
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const patternRef = this.patternsCollection.doc(id);
            await patternRef.delete();
            this.logger.info(`Pattern deleted with ID: ${id}`);
        } catch (error) {
            this.logger.error(`Failed to delete pattern with ID: ${id}`, { error });
            throw error;
        }
    }
}
