import { z } from "zod";
import { fileValidator } from "@/utils/validators/fileValidator";

export const ImageFileSchema = fileValidator("image");
export const DocumentFileSchema = fileValidator("document");


/**
 * TODO カスタムファイルスキーマ
 * 任意の拡張子や MIME タイプを指定可能
 */
export const CustomFileSchema = z.object({
    name: z.string().max(255, "File name is too long"),
    extension: z.enum(["csv", "xlsx"]), // 例:CSV, Excel ファイルのみ許可
    mimeType: z.enum([
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]),
});
