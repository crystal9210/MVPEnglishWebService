import React from "react";
import { ZodSchema } from "zod";
import { validateWithSchema } from "@/utils/validateWithSchema";
import { validateFileSize } from "@/utils/fileUtils";

interface AbstractFileUploadProps<T> {
    schema: ZodSchema<T>; // TODO
    onFileSelect: (fileData: T) => void;
    allowedExtensions: readonly string[];
    maxSize: number; // [MB]
}

// TODO <T,>としないとエラーとなるのなぜか正確に把握できてない
export const AbstractFileUpload = <T,>({
    schema,
    onFileSelect,
    allowedExtensions,
    maxSize,
}: AbstractFileUploadProps<T>): JSX.Element => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const sizeError = validateFileSize(file, maxSize);
        if (sizeError) {
            alert(sizeError); // TODO エラー処理具体化しない方が良くね？
            return;
        }

        const extension = file.name.split(".").pop()?.toLowerCase();
        if (!allowedExtensions.includes(extension || "")) {
            alert(`Allowed extensions are: ${allowedExtensions.join(", ")}`);
            return;
        }

        const fileData = {
            name: file.name,
            extension: extension || "",
            mimeType: file.type,
        } as T;
        const errorMessage = validateWithSchema(schema, fileData);
        if (errorMessage) {
            alert(errorMessage);
            return;
        }

        onFileSelect(fileData as T);
    };

    return <input type="file" onChange={handleFileChange} />;
};



// ---- use case ---
{/* <AbstractFileUpload<{ name: string; extension: string; mimeType: string }>
    schema={someSchema}
    onFileSelect={(fileData) => console.log(fileData)}
/> */}
