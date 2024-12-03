import { fileValidator } from "@/utils/validators/fileValidator";

export const FileUploadSchema = fileValidator("image");
export const DocumentUploadSchema = fileValidator("document");
