import { UserProfileSchema, UserProfile as UserProfileType } from "@/schemas/userSchemas";

export class UserProfile implements UserProfileType {
    displayName: string;
    bio?: string;
    location?: string;
    websites?: string[];
    isPremium?: boolean;
    subscriptionPlan: "free" | "pro" | "enterprise";
    settings: {
        privacy: {
            profileVisibility: "public" | "private";
            allowFollowers: boolean;
        };
        notifications: {
            emailNotifications: boolean;
            pushNotifications: boolean;
        };
    };

    constructor(data: UserProfileType) {
        // Zodスキーマによるバリデーション
        const parseResult = UserProfileSchema.safeParse(data);
        if (!parseResult.success) {
            throw new Error(`Invalid UserProfile data: ${JSON.stringify(parseResult.error.errors)}`);
        }

        // データの割り当て
        this.displayName = parseResult.data.displayName;
        this.bio = parseResult.data.bio;
        this.location = parseResult.data.location;
        this.websites = parseResult.data.websites;
        this.isPremium = parseResult.data.isPremium;
        this.subscriptionPlan = parseResult.data.subscriptionPlan;
        this.settings = parseResult.data.settings;
    }

    /**
     * Firestoreに保存するためのシリアライズメソッド
     */
    toFirestore(): Record<string, any> {
        return {
            displayName: this.displayName,
            bio: this.bio,
            location: this.location,
            websites: this.websites,
            isPremium: this.isPremium,
            subscriptionPlan: this.subscriptionPlan,
            settings: {
                privacy: this.settings.privacy,
                notifications: this.settings.notifications,
            },
        };
    }

    /**
     * Firestoreから取得したデータを元にUserProfileエンティティを生成するファクトリメソッド
     */
    static fromFirestore(data: Record<string, any>): UserProfile {
        return new UserProfile({
            displayName: data.displayName,
            bio: data.bio,
            location: data.location,
            websites: data.websites,
            isPremium: data.isPremium,
            subscriptionPlan: data.subscriptionPlan,
            settings: data.settings,
        });
    }
}
