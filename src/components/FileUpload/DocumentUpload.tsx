import React from "react";
import { AbstractFileUpload } from "./AbstractFileUpload";
import { DocumentFileSchema } from "@/schemas/FileSchemas";
import { allowedFileExtensions } from "@/utils/fileExtensions";
import { MAX_DOCUMENT_FILE_SIZE_MB } from "@/utils/fileUtils";

export const DocumentUpload = (): JSX.Element => {
    const handleFileSelect = (fileData: {
        name: string,
        extension: string;
        mimeType: string;
    }) => {
        console.log("Document uploaded successfully:", fileData);
        // TODO アップロード処理実装 - API呼び出しなど
    };

    return (
        <div>
            <h2>Upload a Document</h2>
            <AbstractFileUpload
                schema={DocumentFileSchema}
                onFileSelect={handleFileSelect}
                allowedExtensions={allowedFileExtensions.document}
                maxSize={MAX_DOCUMENT_FILE_SIZE_MB}
                />
        </div>
    );
};
