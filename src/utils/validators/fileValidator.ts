import { z } from "zod";
import { allowedFileTypes, AllowedFileType } from "../fileExtensions";

export const fileValidator = (type: AllowedFileType) => {
  const validExtensions = allowedFileTypes[type].extensions;
  const validMimeTypes = allowedFileTypes[type].mimeTypes;

  return z.object({
    name: z.string().max(255, "File name is too long"),
    extension: z
      .string()
      .refine((ext) => validExtensions.includes(ext), {
        message: `Invalid file extension. Allowed extensions: ${validExtensions.join(", ")}`,
      }),
    mimeType: z
      .string()
      .refine((mime) => validMimeTypes.includes(mime), {
        message: `Invalid MIME type. Allowed types: ${validMimeTypes.join(", ")}`,
      }),
  });
};
