export const allowedFileTypes = {
    image: {
        extensions: ["jpg", "jpeg", "png", "gif"] as const,
        mimeTypes: ["image/jpeg", "image/png", "image/gif"] as const,
    },
    document: {
        extensions: ["pdf", "docx", "txt"] as const,
        mimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ] as const,
    },
    all: {
        extensions: ["jpg", "jpeg", "png", "gif", "pdf", "docx", "txt"] as const,
        mimeTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ] as const,
    },
} as const;

// キーの型を定義
export type AllowedFileType = keyof typeof allowedFileTypes; // "image" | "document" | "all"

// 各プロパティの型推論
export type FileExtensions<T extends AllowedFileType> = typeof allowedFileTypes[T]["extensions"];
export type MimeTypes<T extends AllowedFileType> = typeof allowedFileTypes[T]["mimeTypes"];
