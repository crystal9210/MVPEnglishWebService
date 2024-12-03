import { ZodSchema } from "zod";

export const validateWithSchema = <T>(schema: ZodSchema<T>, data: unknown): string | null => {
    const validation = schema.safeParse(data);
    if (!validation.success) {
        return validation.error.errors[0].message;
    }
    return null;
}

// --- use case example ---
// import { FileUploadSchema } from "@/schemas/FileSchema";
// import { validateWithSchema } from "@/utils/validators";

// const handleFileUpload = (file: File) => {
//     const fileData = {
//         name: file.name,
//         extension: file.name.split(".").pop() || "",
//     };

//     // `validateWithSchema` を利用してデータを検証
//     const errorMessage = validateWithSchema(FileUploadSchema, fileData);

//     if (errorMessage) {
//         console.error("File validation failed:", errorMessage);
//         return; // 検証失敗時の処理
//     }

//     console.log("File validation succeeded!");
// };
// ----
