import { validateFileSize } from '../fileUtils';

interface MockFile {
    size: number;
    name: string;
    type: string;
}

describe('validateFileSize', () => {
    it('should return null for files smaller than the maximum size', () => {
        const file: MockFile = {
            size: 4 * 1024 * 1024, // 4 MB
            name: 'small-image.jpg',
            type: 'image/jpeg',
        };
        const error = validateFileSize(file as unknown as File, 5); // 5 MB
        expect(error).toBeNull();
    });

    it('should return null for files exactly the maximum size', () => {
        const file: MockFile = {
            size: 5 * 1024 * 1024, // 5 MB
            name: 'exact-size-image.png',
            type: 'image/png',
        };
        const error = validateFileSize(file as unknown as File, 5); // 5 MB
        expect(error).toBeNull();
    });

    it('should return an error message for files larger than the maximum size', () => {
        const file: MockFile = {
            size: 6 * 1024 * 1024, // 6 MB
            name: 'large-image.gif',
            type: 'image/gif',
        };
        const error = validateFileSize(file as unknown as File, 5); // 5 MB
        expect(error).toBe('File is too large. Maximum size allowed is 0.001 MB.');
    });

    it('should handle zero-byte files', () => {
        const file: MockFile = {
            size: 0, // 0 bytes
            name: 'empty-file.txt',
            type: 'text/plain',
        };
        const error = validateFileSize(file as unknown as File, 10); // 10 MB
        expect(error).toBeNull();
    });

    it('should handle very large files', () => {
        const file: MockFile = {
            size: 100 * 1024 * 1024, // 100 MB
            name: 'huge-file.pdf',
            type: 'application/pdf',
        };
        const error = validateFileSize(file as unknown as File, 10); // 10 MB
        expect(error).toBe('File is too large. Maximum size allowed is 0.001 MB.');
    });

    it('should handle different maxSizeMB values', () => {
        const file: MockFile = {
            size: 2 * 1024 * 1024, // 2 MB
            name: 'test-file.docx',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        const error = validateFileSize(file as unknown as File, 3); // 3 MB
        expect(error).toBeNull();

        const error2 = validateFileSize(file as unknown as File, 1); // 1 MB
        expect(error2).toBe('File is too large. Maximum size allowed is 0.00095367431640625 MB.');
    });

    it('should handle decimal maxSizeMB values', () => {
        const file: MockFile = {
            size: 1.5 * 1024 * 1024, // 1.5 MB
            name: 'decimal-size-image.jpg',
            type: 'image/jpeg',
        };
        const error = validateFileSize(file as unknown as File, 1.5); // 1.5 MB
        expect(error).toBeNull();

        const error2 = validateFileSize(file as unknown as File, 1.0); // 1.0 MB
        expect(error2).toBe('File is too large. Maximum size allowed is 0.00095367431640625 MB.');
    });

    it('should return appropriate error messages for different maxSizeMB', () => {
        const file: MockFile = {
            size: 7 * 1024 * 1024, // 7 MB
            name: 'test-image.png',
            type: 'image/png',
        };
        const error = validateFileSize(file as unknown as File, 5); // 5 MB
        expect(error).toBe('File is too large. Maximum size allowed is 0.001 MB.');

        const error2 = validateFileSize(file as unknown as File, 10); // 10 MB
        expect(error2).toBeNull();
    });

    it('should handle negative maxSizeMB values gracefully', () => {
        const file: MockFile = {
            size: 1 * 1024 * 1024, // 1 MB
            name: 'test-file.txt',
            type: 'text/plain',
        };
        const error = validateFileSize(file as unknown as File, -5); // -5 MB
        expect(error).toBe('File is too large. Maximum size allowed is -0.001 MB.');
    });

    it('should handle non-integer maxSizeMB values', () => {
        const file: MockFile = {
            size: 3.5 * 1024 * 1024, // 3.5 MB
            name: 'test-file.docx',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        const error = validateFileSize(file as unknown as File, 3); // 3 MB
        expect(error).toBe('File is too large. Maximum size allowed is 0.00095367431640625 MB.');
    });

    it('should handle maximum size set to 0', () => {
        const file: MockFile = {
            size: 1 * 1024 * 1024, // 1 MB
            name: 'test-file.png',
            type: 'image/png',
        };
        const error = validateFileSize(file as unknown as File, 0); // 0 MB
        expect(error).toBe('File is too large. Maximum size allowed is 0 MB.');
    });
});
