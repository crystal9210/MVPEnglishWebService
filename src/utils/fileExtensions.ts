// TODO ファイル拡張子ごとのセキュリティ上の脆弱性調査・追加実装
export const allowedFileExtensions: Record<string, string[]> = {
    image: ["jpg", "jpeg", "png", "gif"],
    document: ["pdf", "docx", "word", "txt"],
    all: ["jpg", "jpeg", "png", "gif", "pdf", "docx", "word", "txt"]
};

export const allowedMimeTypes: Record<string, string[]> = {
    image: ["image/jpeg", "image/png", "image/gif"],
    document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    all: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
};
