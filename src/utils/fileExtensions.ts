// TODO ファイル拡張子ごとのセキュリティ上の脆弱性調査・追加実装
export const allowedFileExtensions: Record<string, string[]> = {
    image: ["jpg", "jpeg", "png", "gif"],
    document: ["pdf", "docx", "word", "txt"],
    all: ["jpg", "jpeg", "png", "gif", "pdf", "docx", "word", "txt"]
};
