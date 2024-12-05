// src/services/userService.ts

import { FirebaseAdmin } from "./firebaseAdmin";
import { Firestore, CollectionReference, DocumentData } from "firebase-admin/firestore";
import { injectable, inject } from "tsyringe";
import { UserSchema, User } from "../schemas/userSchemas";
import { UserHistoryItem, UserHistoryItemSchema } from "../schemas/userSchemas";
import { Logger } from "@/utils/logger";

@injectable()
export class UserService {
    private firestore: Firestore;
    private usersCollection: CollectionReference<DocumentData>;

    constructor(@inject(FirebaseAdmin) private firebaseAdmin: FirebaseAdmin) {
        this.firestore = this.firebaseAdmin.firestore;
        this.usersCollection = this.firestore.collection("users");
    }

    async getUserById(uid: string): Promise<User | null> {
        try {
        const userRef = this.usersCollection.doc(uid);
        const docSnap = await userRef.get();
        if (docSnap.exists) {
            const data = docSnap.data() as DocumentData;
            const parsed = UserSchema.safeParse(data);
            if (parsed.success) {
            return parsed.data;
            } else {
            Logger.warn(`Invalid user data: UID = ${uid}`);
            }
        }
        return null;
        } catch (error) {
        Logger.error(`Failed to get user by UID: ${uid}`, error);
        throw error;
        }
    }

    async updateUser(uid: string, userData: Partial<User>): Promise<void> {
        try {
        const userRef = this.usersCollection.doc(uid);
        const parsed = UserSchema.partial().safeParse(userData);
        if (!parsed.success) {
            throw new Error("Invalid user data for update");
        }
        await userRef.update(parsed.data);
        Logger.info(`User updated with UID: ${uid}`);
        } catch (error) {
        Logger.error(`Failed to update user with UID: ${uid}`, error);
        throw error;
        }
    }

    async getUserBookmarks(uid: string): Promise<string[]> {
        try {
        const bookmarksRef = this.usersCollection.doc(uid).collection("bookmarks");
        const querySnapshot = await bookmarksRef.get();

        const bookmarks: string[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.problemId) {
            bookmarks.push(data.problemId);
            }
        });
        return bookmarks;
        } catch (error) {
        Logger.error(`Failed to get bookmarks for UID: ${uid}`, error);
        throw error;
        }
    }

    async getUserHistory(uid: string): Promise<UserHistoryItem[]> {
        try {
        const historyRef = this.usersCollection.doc(uid).collection("history");
        const querySnapshot = await historyRef.get();

        const history: UserHistoryItem[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const parsed = UserHistoryItemSchema.safeParse(data);
            if (parsed.success) {
            history.push(parsed.data);
            } else {
            Logger.warn(`Invalid history data for UID: ${uid}`);
            }
        });
        return history;
        } catch (error) {
        Logger.error(`Failed to get history for UID: ${uid}`, error);
        throw error;
        }
    }

    async addBookmark(uid: string, problemId: string): Promise<void> {
        try {
        const bookmarkRef = this.usersCollection
            .doc(uid)
            .collection("bookmarks")
            .doc(problemId);
        await bookmarkRef.set({
            problemId,
            addedAt: new Date().toISOString(),
        });
        Logger.info(`Bookmark added for UID: ${uid}, problem ID: ${problemId}`);
        } catch (error) {
        Logger.error(`Failed to add bookmark for UID: ${uid}`, error);
        throw error;
        }
    }

    async removeBookmark(uid: string, problemId: string): Promise<void> {
        try {
        const bookmarkRef = this.usersCollection
            .doc(uid)
            .collection("bookmarks")
            .doc(problemId);
        await bookmarkRef.delete();
        Logger.info(`Bookmark removed for UID: ${uid}, problem ID: ${problemId}`);
        } catch (error) {
        Logger.error(`Failed to remove bookmark for UID: ${uid}`, error);
        throw error;
        }
    }

    async recordUserHistory(uid: string, historyItem: UserHistoryItem): Promise<void> {
        try {
        const historyRef = this.usersCollection
            .doc(uid)
            .collection("history")
            .doc(historyItem.problemId);
        const existingDoc = await historyRef.get();

        let attempts = historyItem.attempts;
        if (existingDoc.exists) {
            const existingData = existingDoc.data();
            attempts += existingData?.attempts || 0;
        }

        await historyRef.set(
            {
            ...historyItem,
            attempts,
            lastAttemptAt: historyItem.lastAttemptAt,
            },
            { merge: true }
        );

        Logger.info(
            `User history recorded for UID: ${uid}, problem ID: ${historyItem.problemId}`
        );
        } catch (error) {
        Logger.error(`Failed to record history for UID: ${uid}`, error);
        throw error;
        }
    }
}
