import { injectable, inject } from "tsyringe";
import type { IUserBookmarkService } from "@/interfaces/services/IUserBookmarkService";
import type { IUserBookmarkRepository } from "@/interfaces/repositories/IUserBookmarkRepository";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { UserBookmark } from "@/schemas/bookmarkSchemas";

@injectable()
export class UserBookmarkService implements IUserBookmarkService {
    constructor(
        // eslint-disable-next-line no-unused-vars
        @inject("IUserBookmarkRepository") private readonly bookmarkRepository: IUserBookmarkRepository,
        // eslint-disable-next-line no-unused-vars
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {}

    async getUserBookmarks(userId: string): Promise<UserBookmark[]> {
        this.logger.info(`Fetching bookmarks for UID=${userId}`);
        return this.bookmarkRepository.getBookmarks(userId);
    }

    async addUserBookmark(userId: string, bookmark: UserBookmark): Promise<void> {
        this.logger.info(`Adding bookmark for UID=${userId}, ProblemID=${bookmark.problemId}`);
        await this.bookmarkRepository.addBookmark(userId, bookmark);
    }

    async removeUserBookmark(userId: string, problemId: string): Promise<void> {
        this.logger.info(`Removing bookmark for UID=${userId}, ProblemID=${problemId}`);
        await this.bookmarkRepository.removeBookmark(userId, problemId);
    }
}
