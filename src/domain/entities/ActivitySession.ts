import { ActivitySessionSchema, ActivitySession as ActivitySessionType } from "@/schemas/activitySessionSchema";
import { User } from "./user";
import { UserProfile } from "./userProfile";
import { UserHistoryItem } from "./userHistoryItem";
import { UserBookmarkItem } from "./userBookmarkItem";
import { CustomProblemSet } from "./customProblemSet";

export class ActivitySession implements ActivitySessionType {
    sessionId: string;
    user: User;
    userProfile: UserProfile;
    history: UserHistoryItem[];
    bookmarks: UserBookmarkItem[];
    customProblemSets: CustomProblemSet[];
    startedAt: string | Date;
    endedAt: string | Date | null;

    constructor(data: ActivitySessionType) {
        // Zodスキーマによるバリデーション
        const parseResult = ActivitySessionSchema.safeParse(data);
        if (!parseResult.success) {
        throw new Error(`Invalid ActivitySession data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        // エンティティの生成
        this.sessionId = parseResult.data.sessionId;
        this.user = new User(parseResult.data.user);
        this.userProfile = new UserProfile(parseResult.data.userProfile);
        this.history = parseResult.data.history.map((item) => new UserHistoryItem(item));
        this.bookmarks = parseResult.data.bookmarks.map((item) => new UserBookmarkItem(item));
        this.customProblemSets = parseResult.data.customProblemSets.map((set) => new CustomProblemSet(set));
        this.startedAt = parseResult.data.startedAt;
        this.endedAt = parseResult.data.endedAt;
    }

    /**
     * Firestoreに保存するためのシリアライズメソッド
     */
    toFirestore(): Record<string, any> {
        return {
        sessionId: this.sessionId,
        user: this.user.toFirestore(),
        userProfile: this.userProfile.toFirestore(),
        history: this.history.map((item) => item.toFirestore()),
        bookmarks: this.bookmarks.map((item) => item.toFirestore()),
        customProblemSets: this.customProblemSets.map((set) => set.toFirestore()),
        startedAt: this.startedAt instanceof Date ? this.startedAt.toISOString() : this.startedAt,
        endedAt: this.endedAt ? (this.endedAt instanceof Date ? this.endedAt.toISOString() : this.endedAt) : null,
        };
    }

    /**
     * Firestoreから取得したデータを元にActivitySessionエンティティを生成するファクトリメソッド
     */
    static fromFirestore(data: Record<string, any>): ActivitySession {
        return new ActivitySession({
        sessionId: data.sessionId,
        user: data.user,
        userProfile: data.userProfile,
        history: data.history,
        bookmarks: data.bookmarks,
        customProblemSets: data.customProblemSets,
        startedAt: data.startedAt,
        endedAt: data.endedAt,
        });
    }
}
