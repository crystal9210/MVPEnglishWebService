import { z } from "zod";

/**
 * NA_PATH_ID is a default identifier used when a specific ID is not applicable or unavailable.
 * It ensures that all ID fields maintain a consistent string type, avoiding the need for optional fields.
 */
export const NA_PATH_ID = "x" as const;

/**
 * SERVICE_IDS represents available service identifiers.
 */
export const SERVICE_IDS = {
    BASIS: "basis",
    WRITING: "writing",
    MULTIPLE_CHOICE: " multiple-choice",
    // N/A >> You should use constants defined below: NA_PATH_ID.
    NA_PATH_ID: NA_PATH_ID
} as const;

/**
 * ServiceIdEnum defines the Zod enum for service IDs.
 */
export const ServiceIdEnum = z.enum(Object.values(SERVICE_IDS) as unknown as [typeof SERVICE_IDS[keyof typeof SERVICE_IDS]]);
export type ServiceId = z.infer<typeof ServiceIdEnum>;
