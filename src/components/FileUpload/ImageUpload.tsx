import React from "react";
import { AbstractFileUpload } from "./AbstractFileUpload";
import { fileValidator } from "@/utils/validators/fileValidator";
import { allowedFileTypes } from "@/utils/fileExtensions";
import { MAX_IMAGE_FILE_SIZE_MB } from "@/utils/fileUtils";

export const ImageUpload = (): JSX.Element => {
    const handleFileSelect = (fileData: {
        name: string;
        extension: string;
        mimeType: string;
    }) => {
        console.log("Image uploaded successfully:", fileData);
        // TODO: アップロード処理をここに実装（例：API 呼び出し）
    };

    return (
        <div>
        <h2>Upload an Image</h2>
        <AbstractFileUpload
            schema={fileValidator("image")}
            onFileSelect={handleFileSelect}
            allowedExtensions={allowedFileTypes.image.map((file) => file.extension)}
            maxSize={MAX_IMAGE_FILE_SIZE_MB}
        />
        </div>
    );
};
