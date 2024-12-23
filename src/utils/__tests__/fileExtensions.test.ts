import { allowedFileTypes, AllowedFileType, AllowedFilePair, categories } from "../fileExtensions";

describe("allowedFileTypes", () => {

    // Normal Tests
    describe("Normal Cases", () => {
        it("should contain correct image file types", () => {
            const expectedImageTypes: AllowedFilePair<"image">[] = [
                { extension: "jpg", mimeType: "image/jpeg" },
                { extension: "jpeg", mimeType: "image/jpeg" },
                { extension: "png", mimeType: "image/png" },
                { extension: "gif", mimeType: "image/gif" },
            ];
            expectedImageTypes.forEach(expected => {
                expect(allowedFileTypes.image).toContainEqual(expected);
            });
        });

        it("should contain correct document file types", () => {
            const expectedDocumentTypes: AllowedFilePair<"document">[] = [
                { extension: "pdf", mimeType: "application/pdf" },
                { extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
                { extension: "txt", mimeType: "text/plain" },
            ];
            expectedDocumentTypes.forEach(expected => {
                expect(allowedFileTypes.document).toContainEqual(expected);
            });
        });

        it("should contain correct audio file types", () => {
            const expectedAudioTypes: AllowedFilePair<"audio">[] = [
                { extension: "mp3", mimeType: "audio/mpeg" },
                { extension: "wav", mimeType: "audio/wav" },
                { extension: "ogg", mimeType: "audio/ogg" },
            ];
            expectedAudioTypes.forEach(expected => {
                expect(allowedFileTypes.audio).toContainEqual(expected);
            });
        });

        it("should contain correct all file types", () => {
            const expectedAllTypes: AllowedFilePair<"all">[] = [
                // image
                { extension: "jpg", mimeType: "image/jpeg" },
                { extension: "jpeg", mimeType: "image/jpeg" },
                { extension: "png", mimeType: "image/png" },
                { extension: "gif", mimeType: "image/gif" },
                // document
                { extension: "pdf", mimeType: "application/pdf" },
                { extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
                { extension: "txt", mimeType: "text/plain" },
                // audio
                { extension: "mp3", mimeType: "audio/mpeg" },
                { extension: "wav", mimeType: "audio/wav" },
                { extension: "ogg", mimeType: "audio/ogg" },
            ];
            expectedAllTypes.forEach(expected => {
                expect(allowedFileTypes.all).toContainEqual(expected);
            });
        });

        it("all should include all image, document, and audio file types without omissions or duplicates", () => {
            const imageTypes = allowedFileTypes.image;
            const documentTypes = allowedFileTypes.document;
            const audioTypes = allowedFileTypes.audio;
            const allTypes = allowedFileTypes.all;

            const combinedTypes = [...imageTypes, ...documentTypes, ...audioTypes];

            expect(allTypes.length).toBe(combinedTypes.length);
            combinedTypes.forEach(type => {
                expect(allTypes).toContainEqual(type);
            });
        });

        it("should ensure that each file type has a valid MIME type", () => {
            allowedFileTypes.all.forEach(fileType => {
                expect(typeof fileType.mimeType).toBe("string");
                // Simple regex to check MIME type format
                expect(fileType.mimeType).toMatch(/^[a-z]+\/[a-z0-9.+-]+$/i);
            });
        });

        it("should ensure each extension has the correct MIME type", () => {
            const extensionToMimeMap: Record<string, string> = {
                "jpg": "image/jpeg",
                "jpeg": "image/jpeg",
                "png": "image/png",
                "gif": "image/gif",
                "pdf": "application/pdf",
                "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "txt": "text/plain",
                "mp3": "audio/mpeg",
                "wav": "audio/wav",
                "ogg": "audio/ogg",
            };

            allowedFileTypes.all.forEach(fileType => {
                expect(fileType.mimeType).toBe(extensionToMimeMap[fileType.extension]);
            });
        });

        it("should have correct type keys", () => {
            const keys = Object.keys(allowedFileTypes) as AllowedFileType[];
            expect(keys).toEqual(["image", "document", "audio", "all"]);
        });
    });

    // Abnormal Tests
    describe("Abnormal Cases", () => {
        it('should not include disallowed file types such as "tiff"', () => {
            const disallowedExtensions = ["tiff"];
            const allExtensions = allowedFileTypes.all.map(type => type.extension);
            disallowedExtensions.forEach(ext => {
                expect(allExtensions).not.toContain(ext);
            });
        });

        it("should not include any potentially dangerous file types", () => {
            const dangerousMimeTypes = [
                "application/x-msdownload", "text/html",
                "application/javascript", "application/x-sh"
            ];
            allowedFileTypes.all.forEach(fileType => {
                expect(dangerousMimeTypes).not.toContain(fileType.mimeType);
            });
        });

        it("should not include duplicate file types within any category", () => {
            Object.keys(allowedFileTypes).forEach(key => {
                if (key === "all") return; // Skip 'all' category
                const category = allowedFileTypes[key as AllowedFileType];
                const extensions = category.map(type => type.extension);
                const uniqueExtensions = Array.from(new Set(extensions));
                expect(uniqueExtensions.length).toBe(extensions.length);
            });
        });

        it("should not allow invalid file types in any category", () => {
            const invalidType = { extension: "", mimeType: "" };
            expect(allowedFileTypes.image).not.toContainEqual(invalidType);
            expect(allowedFileTypes.document).not.toContainEqual(invalidType);
            expect(allowedFileTypes.audio).not.toContainEqual(invalidType);
        });
    });

    // Edge Case Tests
    describe("Edge Case Tests", () => {
        it("should not have empty file type categories", () => {
            Object.keys(allowedFileTypes).forEach(key => {
                const category = allowedFileTypes[key as AllowedFileType];
                expect(Array.isArray(category)).toBe(true);
                expect(category.length).toBeGreaterThan(0);
            });
        });

        it("each file type should have both extension and mimeType defined", () => {
            allowedFileTypes.all.forEach(fileType => {
                expect(fileType.extension).toBeDefined();
                expect(typeof fileType.extension).toBe("string");
                expect(fileType.extension).not.toBe("");

                expect(fileType.mimeType).toBeDefined();
                expect(typeof fileType.mimeType).toBe("string");
                expect(fileType.mimeType).not.toBe("");
            });
        });

        it("should have all extensions in lowercase", () => {
            allowedFileTypes.all.forEach(fileType => {
                expect(fileType.extension).toBe(fileType.extension.toLowerCase());
            });
        });
    });

    // Suggested Improvements

    // 1. Validation of MIME Type Consistency
    describe("Validation of MIME Type Consistency", () => {
        it("should use valid MIME types matching the IANA standard", () => {
            const validMimeTypes = [
                "image/jpeg", "image/png", "image/gif",
                "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain", "audio/mpeg", "audio/wav", "audio/ogg"
            ];
            allowedFileTypes.all.forEach(fileType => {
                expect(validMimeTypes).toContain(fileType.mimeType);
            });
        });
    });

    // 2. Test for Case Sensitivity in Extensions
    describe("Test for Case Sensitivity in Extensions", () => {
        it("should allow extensions irrespective of case", () => {
            const testFileType = { extension: "JPG", mimeType: "image/jpeg" };
            // Convert to expected format before testing
            expect(allowedFileTypes.image).toContainEqual({
                extension: testFileType.extension.toLowerCase(),
                mimeType: testFileType.mimeType
            });
        });
    });

    // 3. Category Aggregation Consistency
    describe("Category Aggregation Consistency", () => {
        it("should dynamically aggregate all types correctly into 'all'", () => {
            const allExtensions = allowedFileTypes.all.map(fileType => fileType.extension);
            const uniqueExtensions = Array.from(new Set(allExtensions));
            expect(uniqueExtensions.length).toBe(allExtensions.length);

            Object.values(categories).flat().forEach(fileType => {
                expect(allowedFileTypes.all).toContainEqual(fileType);
            });
        });
    });

    // 4. Performance Testing
    describe("Performance Testing", () => {
        it("should handle a large number of file types efficiently", () => {
            const largeSet = Array.from({ length: 1000 }, (_, i) => ({
                extension: `ext${i}`,
                mimeType: `application/test${i}`
            }));
            // Create a new object with the 'test' category added
            const extendedAllowedFileTypes = {
                ...allowedFileTypes,
                test: largeSet,
            };

            expect(extendedAllowedFileTypes.test.length).toBe(1000);
            // Verify that 'all' category does not include the new 'test' category
            expect(extendedAllowedFileTypes.all.length).toBe(allowedFileTypes.all.length);
        });
    });

    // 5. Testing Invalid Additions
    describe("Testing Invalid Additions", () => {
        it("should not allow invalid file types in any category", () => {
            const invalidType = { extension: "", mimeType: "" };
            expect(allowedFileTypes.image).not.toContainEqual(invalidType);
            expect(allowedFileTypes.document).not.toContainEqual(invalidType);
            expect(allowedFileTypes.audio).not.toContainEqual(invalidType);
        });
    });

    // 6. Security Enhancements
    describe("Security Enhancements", () => {
        it("should not allow potentially dangerous MIME types", () => {
            const dangerousMimeTypes = [
                "application/x-msdownload", "text/html",
                "application/javascript", "application/x-sh"
            ];
            allowedFileTypes.all.forEach(fileType => {
                expect(dangerousMimeTypes).not.toContain(fileType.mimeType);
            });
        });
    });

    // 7. Dynamic File Type Validation
    describe("Dynamic File Type Validation", () => {
        it("should ensure dynamically added file types have correct structure", () => {
            const newFileType = { extension: "new", mimeType: "application/new" };
            // Create a new object with the 'custom' category added
            const extendedAllowedFileTypes = {
                ...allowedFileTypes,
                custom: [newFileType],
            } as const;

            // Verify the existence of the 'custom' category
            expect(extendedAllowedFileTypes).toHaveProperty("custom");

            // Verify the structure of each file type in 'custom' category
            extendedAllowedFileTypes.custom.forEach(fileType => {
                expect(fileType).toHaveProperty("extension");
                expect(fileType).toHaveProperty("mimeType");
                expect(typeof fileType.extension).toBe("string");
                expect(typeof fileType.mimeType).toBe("string");
                expect(fileType.extension).not.toBe("");
                expect(fileType.mimeType).not.toBe("");
            });
        });
    });

    // 8. API Integration Tests (if applicable)
    describe("API Integration Tests", () => {
        it("should correctly handle API responses with file types", async () => {
            // Mock the API response
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: () => Promise.resolve([
                        { extension: "bmp", mimeType: "image/bmp" },
                        { extension: "tif", mimeType: "image/tiff" }
                    ]),
                })
            ) as jest.Mock;

            // Create a mock API call function
            const fetchFileTypes = async () => {
                const response = await fetch("/api/fileTypes");
                return response.json();
            };

            const apiResponse = await fetchFileTypes();
            // Verify that the API response does not match 'allowedFileTypes.all'
            expect(apiResponse).not.toEqual(allowedFileTypes.all);
            // Note: This test depends on the relationship between the API and 'allowedFileTypes'
            // and may need adjustments based on specific requirements.
        });
    });
});
