/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import type { IUserBookmarkRepository } from "@/interfaces/repositories/IUserBookmarkRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { UserBookmark } from "@/schemas/bookmarkSchemas";
import { UserBookmarkSchema } from "@/schemas/bookmarkSchemas";

@injectable()
export class UserBookmarkRepository implements IUserBookmarkRepository {
    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    private getBookmarkCollection(userId: string) {
        const firestore = this.firebaseAdmin.getFirestore();
        return firestore.collection("users").doc(userId).collection("bookmarks");
    }

    async getBookmarks(userId: string): Promise<UserBookmark[]> {
        const collectionRef = this.getBookmarkCollection(userId);
        const snapshot = await collectionRef.get();

        const bookmarks: UserBookmark[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            const parsed = UserBookmarkSchema.safeParse(data);
            if (parsed.success) {
                bookmarks.push(parsed.data);
            } else {
                this.logger.warn(`Invalid bookmark data for UID=${userId}`, { errors: parsed.error.errors });
            }
        });

        return bookmarks;
    }

    async addBookmark(userId: string, bookmark: UserBookmark): Promise<void> {
        const collectionRef = this.getBookmarkCollection(userId);
        const docRef = collectionRef.doc(bookmark.problemId);
        await docRef.set(bookmark);
        this.logger.info(`Bookmark added for UID=${userId}, ProblemID=${bookmark.problemId}`);
    }

    async removeBookmark(userId: string, problemId: string): Promise<void> {
        const collectionRef = this.getBookmarkCollection(userId);
        const docRef = collectionRef.doc(problemId);
        await docRef.delete();
        this.logger.info(`Bookmark removed for UID=${userId}, ProblemID=${problemId}`);
    }
}
