import { z } from "zod";
import { sanitizeInput } from "@/utils/sanitizeInput";

export const sanitizedString = (maxLength: number) =>
    z.string()
        .min(1, "Fieled is required")
        .max(maxLength, `Max length is ${maxLength}`)
        .transform(sanitizeInput);
