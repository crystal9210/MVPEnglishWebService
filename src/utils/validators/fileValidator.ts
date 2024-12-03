import { z } from "zod";
import { sanitizeInput } from "../sanitizeInput";
import { allowedFileExtensions, allowedMimeTypes } from "../fileExtensions";

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


export const validateFile = (
    file: File,
    type: keyof typeof allowedFileExtensions
): string | null => {
    const fileData = {
        name: file.name,
        extension: file.name.split(".").pop() || "",
        mimeType: file.type,
    };

    const schema = fileValidator(type);

    const validation = schema.safeParse(fileData);
    if (!validation.success) {
        return validation.error.errors[0].message;
    }
    return null;
}
