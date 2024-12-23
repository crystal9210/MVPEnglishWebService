/**
 * allowedFileTypes defines the permitted file types categorized by their usage.
 *
 * Categories:
 * - image: Image files
 * - document: Document files
 * - audio: Audio files
 * - all: All of the above file types
 *
 * Each file type is defined by its extension and corresponding MIME type.
 *
 * To add a new category:
 * 1. Define a new array of file types.
 * 2. Add the new category to the categories object.
 * 3. 'all' will automatically include the new file types.
 * 4. Add corresponding test cases to verify the new category.
 */

/**
 * Defines allowed image file types with their extensions and MIME types.
 */
export const imageFileTypes = [
    { extension: "jpg", mimeType: "image/jpeg" },
    { extension: "jpeg", mimeType: "image/jpeg" },
    { extension: "png", mimeType: "image/png" },
    { extension: "gif", mimeType: "image/gif" },
] as const;

/**
 * Defines allowed document file types with their extensions and MIME types.
 */
export const documentFileTypes = [
    { extension: "pdf", mimeType: "application/pdf" },
    { extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    { extension: "txt", mimeType: "text/plain" },
] as const;

/**
 * Defines allowed audio file types with their extensions and MIME types.
 */
export const audioFileTypes = [
    { extension: "mp3", mimeType: "audio/mpeg" },
    { extension: "wav", mimeType: "audio/wav" },
    { extension: "ogg", mimeType: "audio/ogg" },
] as const;

/**
 * Aggregates all file type categories.
 */
export const categories = {
    image: imageFileTypes,
    document: documentFileTypes,
    audio: audioFileTypes,
} as const;

/**
 * Aggregates all file types across categories.
 */
const allFileTypes = [
    ...imageFileTypes,
    ...documentFileTypes,
    ...audioFileTypes
] as const;

/**
 * Defines the allowed file types including all categories.
 */
export const allowedFileTypes = {
    ...categories,
    all: allFileTypes,
} as const;

/**
 * Represents the keys of the allowedFileTypes object.
 * "image" | "document" | "audio" | "all"
 */
export type AllowedFileType = keyof typeof allowedFileTypes;

/**
 * Represents a single allowed file type pair with its extension and MIME type.
 */
type ImageFilePair = typeof imageFileTypes[number];
type DocumentFilePair = typeof documentFileTypes[number];
type AudioFilePair = typeof audioFileTypes[number];
type AllFilePair = typeof allFileTypes[number];

/**
 * Represents an allowed file pair based on the category.
 *
 * @template T - The category of the file type ("image", "document", "audio", "all")
 */
export type AllowedFilePair<T extends AllowedFileType> =
    T extends "image" ? ImageFilePair :
    T extends "document" ? DocumentFilePair :
    T extends "audio" ? AudioFilePair :
    AllFilePair;
