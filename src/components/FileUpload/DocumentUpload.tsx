import React from "react";
import { AbstractFileUpload } from "./AbstractFileUpload";
import { fileValidator } from "@/utils/validators/fileValidator";
import { allowedFileTypes, AllowedFilePair } from "@/utils/fileExtensions";
import { MAX_DOCUMENT_FILE_SIZE_MB } from "@/utils/fileUtils";


export const DocumentUpload = (): JSX.Element => {
    const handleFileSelect = (fileData: AllowedFilePair<"document">) => {
        console.log("Document uploaded successfully:", fileData);
        // TODO アップロード処理実装 - API呼び出しなど
    };

    return (
        <div>
            <h2>Upload a Document</h2>
            <AbstractFileUpload
                schema={fileValidator("document")}
                onFileSelect={handleFileSelect}
                allowedExtensions={allowedFileTypes.document.map((file) => file.extension)}
                maxSize={MAX_DOCUMENT_FILE_SIZE_MB}
                />
        </div>
    );
};
