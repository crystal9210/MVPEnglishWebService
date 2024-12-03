import { z } from "zod";
import { sanitizeInput } from "../sanitizeInput";
import { allowedFileExtensions } from "../fileExtensions";

export const fileValidator = (
    type: keyof typeof allowedFileExtensions
) => {
    const validExtensions = allowedFileExtensions[type];
    return z.object({
        name: z.string().max(255, "File name is too long").transform(sanitizeInput),
        extension: z
        .string()
        .refine((ext) => validExtensions.includes(ext.toLowerCase()), {
            message: `Invalid file extension. Allowed extensions: ${validExtensions.join(",")}`,
        }),
    })
}
