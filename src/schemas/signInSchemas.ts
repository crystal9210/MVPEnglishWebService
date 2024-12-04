// auth.js v5
import { AdapterAccount, AdapterUser } from "next-auth/adapters";
import { z } from "zod";

export interface AccountSchema extends AdapterAccount {
    access_token: z.string(),
    refresh_token: z.string().optional(),
    provider: z.string(),
    providerAccountId: z.string(),
    userId: z.string(),
    scope: z.string(),
    token_type: z.string(),
    type: z.string(),
    expires_at: z.number().optional(),
    id_token: z.string().optional(),
    // AdapterAccountに基づくその他のフィールド
});

const UserSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    image: z.string().url().optional(),
});

const ProfileSchema = z.object({
    displayName: z.string(),
    bio: z.string().optional(),
    location: z.string().optional(),
    websites: z.array(z.string().url()).optional(),
    isPremium: z.boolean(),
    subscriptionPlan: z.string(),
    settings: z.object({
        privacy: z.object({
            profileVisibility: z.enum(["public", "private"]),
            allowFollowers: z.boolean(),
        }),
        notifications: z.object({
            emailNotifications: z.boolean(),
            pushNotifications: z.boolean(),
        })
    })
})
