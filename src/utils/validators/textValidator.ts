import { z } from "zod";
import { sanitizeInput } from "../sanitizeInput";

export const textValidator = (maxLength: number, minLength: number = 1) => {
    return z
        .string()
        .min(minLength, `Text must be at least ${minLength} characters long.`)
        .max(maxLength, `Text must be no more than ${maxLength} characters long`)
        .transform((text) => sanitizeInput(text))
};

export const validateText = (schema: z.ZodString, data: string): string | null => {
    const  validation = schema.safeParse(data);
    if (!validation.success) {
        return validation.error.errors[0].message;
    }
    return null;
};
