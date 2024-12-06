import { UserBookmarkItem } from "@/schemas/userSchemas";

export interface IUserBookmarkService {
    getUserBookmarks(uid: string): Promise<UserBookmarkItem[]>;
    addBookmark(uid: string, bookmarkItem: UserBookmarkItem): Promise<void>;
    removeBookmark(uid: string, problemId: string): Promise<void>;
}
