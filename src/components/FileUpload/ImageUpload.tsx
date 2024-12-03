import React from "react";
import { AbstractFileUpload } from "./AbstractFileUpload";
import { allowedFileTypes } from "@/utils/fileExtensions";
import { fileValidator } from "@/utils/validators/fileValidator";

const ImageFileSchema = fileValidator("image");

export const ImageUpload = (): JSX.Element => {
  const handleFileSelect = (fileData: {
    name: string;
    extension: string;
    mimeType: string;
  }) => {
    console.log("Image uploaded successfully:", fileData);
  };

  return (
    <div>
      <h2>Upload an Image</h2>
      <AbstractFileUpload
        schema={ImageFileSchema}
        onFileSelect={handleFileSelect}
        allowedExtensions={allowedFileTypes.image.extensions}
        maxSize={5}
      />
    </div>
  );
};
