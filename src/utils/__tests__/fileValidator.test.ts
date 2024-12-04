import { fileValidator } from '../validators/fileValidator';
import { allowedFileTypes } from '../fileExtensions';

describe('fileValidator', () => {
    Object.keys(allowedFileTypes).forEach((type) => {
        describe(`Validation for ${type} file type`, () => {
            const schema = fileValidator(type as keyof typeof allowedFileTypes);

            it('should validate a correct file', () => {
                const validFile = {
                    name: 'example.jpg',
                    extension: 'jpg',
                    mimeType: 'image/jpeg',
                };
                const result = schema.safeParse(validFile);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual(validFile);
                }
            });

            it('should reject an incorrect extension', () => {
                const invalidFile = {
                    name: 'example.txt',
                    extension: 'txt',
                    mimeType: 'image/jpeg',
                };
                const result = schema.safeParse(invalidFile);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.errors[0].message).toContain('Invalid file extension');
                }
            });

            it('should reject an incorrect MIME type', () => {
                const invalidFile = {
                    name: 'example.jpg',
                    extension: 'jpg',
                    mimeType: 'text/plain',
                };
                const result = schema.safeParse(invalidFile);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.errors[0].message).toContain('Invalid MIME type');
                }
            });

            it('should reject a file with a too long name', () => {
                const invalidFile = {
                    name: 'a'.repeat(256) + '.jpg',
                    extension: 'jpg',
                    mimeType: 'image/jpeg',
                };
                const result = schema.safeParse(invalidFile);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.errors[0].message).toBe('File name is too long');
                }
            });

            it('should handle unexpected fields gracefully', () => {
                const fileWithExtraFields = {
                    name: 'example.jpg',
                    extension: 'jpg',
                    mimeType: 'image/jpeg',
                    extraField: 'unexpected',
                };
                const result = schema.safeParse(fileWithExtraFields);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual({
                        name: 'example.jpg',
                        extension: 'jpg',
                        mimeType: 'image/jpeg',
                    });
                }
            });

            it('should reject files with missing required fields', () => {
                const missingFields = {
                    name: 'example.jpg',
                };
                const result = schema.safeParse(missingFields);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.errors).toHaveLength(2);
                }
            });
        });
    });
});
