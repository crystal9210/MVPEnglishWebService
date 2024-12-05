import { z } from "zod";
import { sanitizedString } from "./BaseSchemas";

export const profileSchema = z.object({
    displayName: sanitizedString(50),
    bio: sanitizedString(300).optional(),
    location: sanitizedString(100).optional(),
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
});
