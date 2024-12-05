// src/services/patternService.ts

import { firestore } from "./firebaseClient";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    DocumentData,
} from "firebase/firestore";
import { PatternSchema, Pattern } from "../schemas/problemSchemas";
import { injectable } from "tsyringe";
import { Logger } from "@/utils/logger";

@injectable()
export class PatternService {
    private patternsCollection = collection(firestore, "patterns");

    async getAllPatterns(): Promise<Pattern[]> {
        try {
        const querySnapshot = await getDocs(this.patternsCollection);

        const patterns: Pattern[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data() as DocumentData;
            const parsed = PatternSchema.safeParse(data);
            if (parsed.success) {
            patterns.push(parsed.data);
            } else {
            Logger.warn(`Invalid pattern data: ${docSnap.id}`);
            }
        });
        return patterns;
        } catch (error) {
        Logger.error("Failed to get all patterns", error);
        throw error;
        }
    }

    async getPatternById(id: string): Promise<Pattern | null> {
        try {
        const patternRef = doc(this.patternsCollection, id);
        const docSnap = await getDoc(patternRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const parsed = PatternSchema.safeParse(data);
            if (parsed.success) {
            return parsed.data;
            } else {
            Logger.warn(`Invalid pattern data: ${id}`);
            }
        }
        return null;
        } catch (error) {
        Logger.error(`Failed to get pattern by ID: ${id}`, error);
        throw error;
        }
    }

    async addPattern(patternData: Pattern): Promise<string> {
        try {
        const parsed = PatternSchema.safeParse(patternData);
        if (!parsed.success) {
            throw new Error("Invalid pattern data");
        }
        const docRef = await addDoc(this.patternsCollection, parsed.data);
        Logger.info(`Pattern added with ID: ${docRef.id}`);
        return docRef.id;
        } catch (error) {
        Logger.error("Failed to add pattern", error);
        throw error;
        }
    }

    async updatePattern(id: string, patternData: Partial<Pattern>): Promise<void> {
        try {
        const patternRef = doc(this.patternsCollection, id);
        const parsed = PatternSchema.partial().safeParse(patternData);
        if (!parsed.success) {
            throw new Error("Invalid pattern data for update");
        }
        await updateDoc(patternRef, parsed.data);
        Logger.info(`Pattern updated with ID: ${id}`);
        } catch (error) {
        Logger.error(`Failed to update pattern with ID: ${id}`, error);
        throw error;
        }
    }

    async deletePattern(id: string): Promise<void> {
        try {
        const patternRef = doc(this.patternsCollection, id);
        await deleteDoc(patternRef);
        Logger.info(`Pattern deleted with ID: ${id}`);
        } catch (error) {
        Logger.error(`Failed to delete pattern with ID: ${id}`, error);
        throw error;
        }
    }
}
