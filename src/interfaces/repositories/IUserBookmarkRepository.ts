/* eslint-disable no-unused-vars */
import type { UserBookmark } from "@/schemas/bookmarkSchemas";

export interface IUserBookmarkRepository {
    getBookmarks(userId: string): Promise<UserBookmark[]>;
    addBookmark(userId: string, bookmark: UserBookmark): Promise<void>;
    removeBookmark(userId: string, problemId: string): Promise<void>;
}
