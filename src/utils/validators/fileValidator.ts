//  unknown -> ZodObjectとZodTypeの互換性をTypeScriptに指示 / 理論的な互換性保証

// --- use case ---
// const schema = fileValidator("image");
// const result = schema.safeParse({
//     name: "example.png",
//     extension: "png",
//     mimeType: "image/png",
// });
// if (!result.success) {
//     console.error(result.error.errors);
// } else {
//     console.log("Validation successful:", result.data);
// }

import { z, ZodType, ZodTypeDef } from "zod";
import { allowedFileTypes, AllowedFileType, AllowedFilePair } from "../fileExtensions";

export const fileValidator = <T extends AllowedFileType>(
    type: T
): ZodType<
    { name: string } & AllowedFilePair<T>, // name を含めた型
    ZodTypeDef,
    { name: string } & AllowedFilePair<T>
    > => {
    const validPairs = allowedFileTypes[type];

    return z.object({
        name: z
            .string()
            .max(255, "File name is too long"),
        extension: z
            .string()
            .refine(
                (ext): ext is AllowedFilePair<T>["extension"] => validPairs.some((pair) => pair.extension === ext),
                {
                    message: `Invalid file extension. Allowed extensions: ${validPairs.map((pair) => pair.extension).join(", ")}`,
                }
            ),
        mimeType: z
            .string()
            .refine(
                (mime): mime is AllowedFilePair<T>["mimeType"] => validPairs.some((pair) => pair.mimeType === mime),
                {
                    message: `Invalid MIME type. Allowed types: ${validPairs.map((pair) => pair.mimeType).join(", ")}`,
                }
            ),
    }) as ZodType<
        { name: string } & AllowedFilePair<T>,
        ZodTypeDef,
        { name: string } & AllowedFilePair<T>
    >;
};
