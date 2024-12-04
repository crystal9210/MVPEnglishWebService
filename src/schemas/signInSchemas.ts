// auth.js v5
import { AdapterAccount, AdapterUser } from "next-auth/adapters";
import { z } from "zod";

export const accountDataSchema: z.ZodSchema<AdapterAccount> = z.object({
    userId: z.string().min(1, "User ID is required"),
    provider: z.string().min(1, "Provider is required."),
    providerAccountId: z.string().min(1, "Provider Account ID is required."),
    access_token: z.string().min(1, "Access token is required."),
    refresh_token: z.string().nullable(),
    id_token: z.string().nullable(),
    token_type: z.string().min(1, "Token type is required"),
    scope: z.string().min(1, "Scope is required"),
    expires_at: z.number().nullable(),
    type: z.string().min(1, "Type is required"),
}).strict();

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
