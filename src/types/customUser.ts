export interface CustomUserProfile {
    displayName: string;
    bio?: string;
    location?: string;
    websites?: string[];
    isPremium: boolean;
    subscriptionPlan: string;
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
}
