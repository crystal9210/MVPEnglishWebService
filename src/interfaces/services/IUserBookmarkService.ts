import type { UserBookmark } from "@/schemas/bookmarkSchemas";

export interface IUserBookmarkService {
    getUserBookmarks(userId: string): Promise<UserBookmark[]>;
    addUserBookmark(userId: string, bookmark: UserBookmark): Promise<void>;
    removeUserBookmark(userId: string, problemId: string): Promise<void>;
}
