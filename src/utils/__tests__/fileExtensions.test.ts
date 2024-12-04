import { allowedFileTypes, AllowedFileType, AllowedFilePair } from '../fileExtensions';

describe('allowedFileTypes', () => {
    it('should contain correct image file types', () => {
        const expectedImageTypes: AllowedFilePair<'image'>[] = [
            { extension: "jpg", mimeType: "image/jpeg" },
            { extension: "jpeg", mimeType: "image/jpeg" },
            { extension: "png", mimeType: "image/png" },
            { extension: "gif", mimeType: "image/gif" },
        ];
        expectedImageTypes.forEach(expected => {
            expect(allowedFileTypes.image).toContainEqual(expected);
        });
    });

    it('should contain correct document file types', () => {
        const expectedDocumentTypes: AllowedFilePair<'document'>[] = [
            { extension: "pdf", mimeType: "application/pdf" },
            { extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            { extension: "txt", mimeType: "text/plain" },
        ];
        expectedDocumentTypes.forEach(expected => {
            expect(allowedFileTypes.document).toContainEqual(expected);
        });
    });

    it('should contain correct all file types', () => {
        const expectedAllTypes: AllowedFilePair<'all'>[] = [
            { extension: "jpg", mimeType: "image/jpeg" },
            { extension: "jpeg", mimeType: "image/jpeg" },
            { extension: "png", mimeType: "image/png" },
            { extension: "gif", mimeType: "image/gif" },
            { extension: "pdf", mimeType: "application/pdf" },
            { extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            { extension: "txt", mimeType: "text/plain" },
        ];
        expectedAllTypes.forEach(expected => {
            expect(allowedFileTypes.all).toContainEqual(expected);
        });
    });

    it('all should include all image and document file types without duplicates', () => {
        const imageTypes = allowedFileTypes.image.map(type => type.extension);
        const documentTypes = allowedFileTypes.document.map(type => type.extension);
        const allTypes = allowedFileTypes.all.map(type => type.extension);

        const expectedAllTypes = [...imageTypes, ...documentTypes];

        // Check if all expected types are present in allTypes
        expectedAllTypes.forEach(ext => {
            expect(allTypes).toContain(ext);
        });

        // Check no duplicates in allTypes
        const uniqueAllTypes = Array.from(new Set(allTypes));
        expect(uniqueAllTypes.length).toBe(allTypes.length);
    });

    it('should not have any extra file types in all', () => {
        const imageTypes = allowedFileTypes.image.map(type => type.extension);
        const documentTypes = allowedFileTypes.document.map(type => type.extension);
        const allTypes = allowedFileTypes.all.map(type => type.extension);

        const expectedAllTypes = [...imageTypes, ...documentTypes];

        expect(allTypes.sort()).toEqual(expectedAllTypes.sort());
    });

    it('should ensure that each file type has a valid MIME type', () => {
        allowedFileTypes.all.forEach(fileType => {
            expect(typeof fileType.mimeType).toBe('string');
            // Simple regex to match MIME type format
            expect(fileType.mimeType).toMatch(/^[a-z]+\/[a-z0-9.+-]+$/i);
        });
    });

    it('should have unique MIME types for different extensions where applicable', () => {
        const mimeTypes = allowedFileTypes.all.map(type => type.mimeType);
        const uniqueMimeTypes = Array.from(new Set(mimeTypes));
        expect(uniqueMimeTypes.length).toBe(mimeTypes.length);
    });

    it('should have correct type keys', () => {
        const keys = Object.keys(allowedFileTypes) as AllowedFileType[];
        expect(keys).toEqual(['image', 'document', 'all']);
    });

    it('should not include unsupported file types', () => {
        const unsupportedExtensions = ["exe", "bat", "sh", "js", "html", "svg"];
        const allExtensions = allowedFileTypes.all.map(type => type.extension);
        unsupportedExtensions.forEach(ext => {
            expect(allExtensions).not.toContain(ext);
        });
    });

    // allowedFileTypesは定数として変更されることを想定していないため、空にするテストは不要
});
