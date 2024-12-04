// TODO
import { textValidator, validateText } from '../validators/textValidator';
import { sanitizeInput } from '../sanitizeInput';

jest.mock('../sanitizeInput', () => ({
    sanitizeInput: jest.fn((text: string) => text),
}));

describe('textValidator', () => {
    const maxLength = 100;
    const minLength = 5;
    const schema = textValidator(maxLength, minLength);

    it('should validate a valid text', () => {
        const validText = 'This is a valid text.';
        const result = schema.safeParse(validText);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(validText);
        }
    });

    it('should reject text shorter than the minimum length', () => {
        const shortText = 'abcd';
        const error = validateText(schema, shortText);
        expect(error).toBe(`Text must be at least ${minLength} characters long.`);
    });

    it('should reject text longer than the maximum length', () => {
        const longText = 'a'.repeat(maxLength + 1);
        const error = validateText(schema, longText);
        expect(error).toBe(`Text must be no more than ${maxLength} characters long`);
    });

    it('should sanitize the input text', () => {
        const unsanitizedText = '<script>alert("XSS")</script>';
        const sanitizedText = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
        (sanitizeInput as jest.Mock).mockReturnValueOnce(sanitizedText);

        const result = schema.safeParse(unsanitizedText);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(sanitizedText);
        }
    });

    it('should handle empty text gracefully', () => {
        const emptyText = '';
        const error = validateText(schema, emptyText);
        expect(error).toBe(`Text must be at least ${minLength} characters long.`);
    });

    it('should handle text with only whitespace', () => {
        const whitespaceText = '     ';
        const sanitizedWhitespaceText = sanitizeInput(whitespaceText.trim());
        const error = validateText(schema, sanitizedWhitespaceText);
        expect(error).toBe(`Text must be at least ${minLength} characters long.`);
    });

    it('should handle text at exact boundaries', () => {
        const exactMinText = 'a'.repeat(minLength);
        const exactMaxText = 'a'.repeat(maxLength);

        const minResult = schema.safeParse(exactMinText);
        const maxResult = schema.safeParse(exactMaxText);

        expect(minResult.success).toBe(true);
        expect(maxResult.success).toBe(true);
    });

    it('should reject invalid types (non-string)', () => {
        const invalidData = 12345;
        const error = validateText(schema, invalidData as unknown as string);
        expect(error).toBe('Expected string, received number');
    });
});
