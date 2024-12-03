export const MAX_IMAGE_FILE_SIZE_MB = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_FILE_SIZE_MB = 10; // [MD]

export const validateFileSize = (file: File, maxSizeMB: number): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
        return `File is too large. Maximum size allowed is ${maxSizeMB / (1024 * 1024)} MB.`;
    }
    return null;
}
