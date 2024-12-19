import { z } from "zod";

export const SERVICE_IDS = {
    BASIS: "basis",
    WRITING: "writing",
    MULTIPLE_CHOICE: " multiple-choice",
} as const;

/**
 * SERVICE_IDS >> Zod schema
 */
export const ServiceIdEnum = z.enum(Object.values(SERVICE_IDS) as unknown as [typeof SERVICE_IDS[keyof typeof SERVICE_IDS]]);
export type ServiceId = z.infer<typeof ServiceIdEnum>;
