export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateFileSize = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
        return `File is too large. Maximum size allowed is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`;
    }
    return null;
}
