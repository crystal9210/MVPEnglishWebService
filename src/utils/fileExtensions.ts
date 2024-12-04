export const allowedFileTypes = {
    image: [
        { extension: "jpg", mimeType: "image/jpeg" },
        { extension: "jpeg", mimeType: "image/jpeg" },
        { extension: "png", mimeType: "image/png" },
        { extension: "gif", mimeType: "image/gif" },
    ] as const,
    document: [
        { extension: "pdf", mimeType: "application/pdf" },
        { extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
        { extension: "txt", mimeType: "text/plain" },
    ] as const,
    all: [
        { extension: "jpg", mimeType: "image/jpeg" },
        { extension: "jpeg", mimeType: "image/jpeg" },
        { extension: "png", mimeType: "image/png" },
        { extension: "gif", mimeType: "image/gif" },
        { extension: "pdf", mimeType: "application/pdf" },
        { extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
        { extension: "txt", mimeType: "text/plain" },
    ] as const,
} as const;

export type AllowedFileType = keyof typeof allowedFileTypes; // "image" | "document" | "all"

// ファイル情報の型
export type AllowedFilePair<T extends AllowedFileType> = typeof allowedFileTypes[T][number];
