// TODO
import { FirebaseAdmin } from "./firebaseAdmin";
import { Firestore } from "firebase-admin/firestore";
import { injectable, inject } from "tsyringe";
import { UserBookmarkItemSchema, UserBookmarkItem } from "../schemas/userSchemas";
import { Logger } from "@/services/loggerService";

@injectable()
export class UserBookmarkService {
    private firestore: Firestore;

    constructor(@inject(FirebaseAdmin) private firebaseAdmin: FirebaseAdmin) {
        this.firestore = this.firebaseAdmin.firestore;
    }

    async getUserBookmarks(uid: string): Promise<UserBookmarkItem[]> {
        try {
        const bookmarksRef = this.firestore.collection("users").doc(uid).collection("bookmarks");
        const querySnapshot = await bookmarksRef.get();

        const bookmarks: UserBookmarkItem[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const parsed = UserBookmarkItemSchema.safeParse(data);
            if (parsed.success) {
            bookmarks.push(parsed.data);
            } else {
            Logger.warn(`Invalid bookmark data for UID: ${uid}`);
            }
        });
        return bookmarks;
        } catch (error) {
        Logger.error(`Failed to get bookmarks for UID: ${uid}`, error);
        throw error;
        }
    }

    async addBookmark(uid: string, bookmarkItem: UserBookmarkItem): Promise<void> {
        try {
        const bookmarkRef = this.firestore.collection("users").doc(uid).collection("bookmarks").doc(bookmarkItem.problemId);
        await bookmarkRef.set(bookmarkItem, { merge: true });
        Logger.info(`Bookmark added for UID: ${uid}, Problem ID: ${bookmarkItem.problemId}`);
        } catch (error) {
        Logger.error(`Failed to add bookmark for UID: ${uid}`, error);
        throw error;
        }
    }

    async removeBookmark(uid: string, problemId: string): Promise<void> {
        try {
        const bookmarkRef = this.firestore.collection("users").doc(uid).collection("bookmarks").doc(problemId);
        await bookmarkRef.delete();
        Logger.info(`Bookmark removed for UID: ${uid}, Problem ID: ${problemId}`);
        } catch (error) {
        Logger.error(`Failed to remove bookmark for UID: ${uid}`, error);
        throw error;
        }
    }
}
