import { validateWithSchema } from '../validation';
import { z, ZodSchema } from 'zod';

describe('validateWithSchema', () => {
    // Sample schemas
    const userSchema: ZodSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        age: z.number().int().positive('Age must be a positive integer'),
        email: z.string().email('Invalid email address'),
    });

    const productSchema: ZodSchema = z.object({
        title: z.string().min(3, 'Title must be at least 3 characters'),
        price: z.number().nonnegative('Price cannot be negative'),
        tags: z.array(z.string()).optional(),
    });

    const nestedSchema: ZodSchema = z.object({
        user: userSchema,
        product: productSchema,
    });

    it('should return null for valid user data', () => {
        const validUser = {
            name: 'John Doe',
            age: 30,
            email: 'john.doe@example.com',
        };
        const error = validateWithSchema(userSchema, validUser);
        expect(error).toBeNull();
    });

    it('should return error message for invalid user data (missing name)', () => {
        const invalidUser = {
            age: 25,
            email: 'jane.doe@example.com',
        };
        const error = validateWithSchema(userSchema, invalidUser);
        expect(error).toBe('Name is required');
    });

    it('should return error message for invalid user data (invalid email)', () => {
        const invalidUser = {
            name: 'Jane Doe',
            age: 25,
            email: 'invalid-email',
        };
        const error = validateWithSchema(userSchema, invalidUser);
        expect(error).toBe('Invalid email address');
    });

    it('should return first error message for multiple invalid fields', () => {
        const invalidUser = {
            name: '',
            age: -5,
            email: 'invalid-email',
        };
        const error = validateWithSchema(userSchema, invalidUser);
        expect(error).toBe('Name is required'); // First error
    });

    it('should handle valid product data', () => {
        const validProduct = {
            title: 'Laptop',
            price: 999.99,
            tags: ['electronics', 'computers'],
        };
        const error = validateWithSchema(productSchema, validProduct);
        expect(error).toBeNull();
    });

    it('should return error message for invalid product data (short title)', () => {
        const invalidProduct = {
            title: 'PC',
            price: 500,
        };
        const error = validateWithSchema(productSchema, invalidProduct);
        expect(error).toBe('Title must be at least 3 characters');
    });

    it('should return error message for invalid product data (negative price)', () => {
        const invalidProduct = {
            title: 'Smartphone',
            price: -100,
        };
        const error = validateWithSchema(productSchema, invalidProduct);
        expect(error).toBe('Price cannot be negative');
    });

    it('should allow optional tags in product data', () => {
        const validProduct = {
            title: 'Monitor',
            price: 150,
        };
        const error = validateWithSchema(productSchema, validProduct);
        expect(error).toBeNull();
    });

    it('should handle nested schemas with valid data', () => {
        const validData = {
            user: {
                name: 'Alice',
                age: 28,
                email: 'alice@example.com',
            },
            product: {
                title: 'Keyboard',
                price: 45,
                tags: ['accessories'],
            },
        };
        const error = validateWithSchema(nestedSchema, validData);
        expect(error).toBeNull();
    });

    it('should handle nested schemas with invalid user data', () => {
        const invalidData = {
            user: {
                name: '',
                age: 28,
                email: 'alice@example.com',
            },
            product: {
                title: 'Keyboard',
                price: 45,
                tags: ['accessories'],
            },
        };
        const error = validateWithSchema(nestedSchema, invalidData);
        expect(error).toBe('Name is required');
    });

    it('should handle nested schemas with invalid product data', () => {
        const invalidData = {
            user: {
                name: 'Alice',
                age: 28,
                email: 'alice@example.com',
            },
            product: {
                title: 'KB',
                price: -45,
                tags: ['accessories'],
            },
        };
        const error = validateWithSchema(nestedSchema, invalidData);
        expect(error).toBe('Title must be at least 3 characters');
    });

    it('should handle completely invalid data', () => {
        const invalidData = "This is not an object";
        const error = validateWithSchema(userSchema, invalidData);
        expect(error).toBe('Expected object, received string');
    });

    it('should handle null data', () => {
        const error = validateWithSchema(userSchema, null);
        expect(error).toBe('Expected object, received null');
    });

    it('should handle undefined data', () => {
        const error = validateWithSchema(userSchema, undefined);
        expect(error).toBe('Expected object, received undefined');
    });

    it('should handle extra unexpected fields by default', () => {
        const dataWithExtraFields = {
            name: 'Bob',
            age: 40,
            email: 'bob@example.com',
            extraField: 'unexpected',
        };
        const error = validateWithSchema(userSchema, dataWithExtraFields);
        expect(error).toBeNull(); // Zod allows extra fields by default unless strict
    });

    it('should handle strict schemas rejecting extra fields', () => {
        const strictSchema: ZodSchema = z.object({
            name: z.string(),
            age: z.number(),
        }).strict();

        const dataWithExtraFields = {
            name: 'Bob',
            age: 40,
            extraField: 'unexpected',
        };
        const error = validateWithSchema(strictSchema, dataWithExtraFields);
        expect(error).toBe('Unrecognized key(s) in object: "extraField"');
    });

    it('should handle arrays as data if schema expects array', () => {
        const arraySchema: ZodSchema = z.array(z.string());

        const validData = ['apple', 'banana', 'cherry'];
        const error = validateWithSchema(arraySchema, validData);
        expect(error).toBeNull();

        const invalidData = ['apple', 123, 'cherry'];
        const error2 = validateWithSchema(arraySchema, invalidData);
        expect(error2).toBe('Expected string, received number');
    });

    it('should handle optional fields correctly', () => {
        const optionalSchema: ZodSchema = z.object({
            name: z.string(),
            age: z.number().optional(),
        });

        const dataWithOptional = {
            name: 'Charlie',
        };
        const error = validateWithSchema(optionalSchema, dataWithOptional);
        expect(error).toBeNull();

        const dataWithInvalidOptional = {
            name: 'Charlie',
            age: 'thirty',
        };
        const error2 = validateWithSchema(optionalSchema, dataWithInvalidOptional);
        expect(error2).toBe('Expected number, received string');
    });

    it('should handle nested arrays', () => {
        const nestedArraySchema: ZodSchema = z.object({
            tags: z.array(z.array(z.string())),
        });

        const validData = {
            tags: [['tag1', 'tag2'], ['tag3']],
        };
        const error = validateWithSchema(nestedArraySchema, validData);
        expect(error).toBeNull();

        const invalidData = {
            tags: [['tag1', 2], ['tag3']],
        };
        const error2 = validateWithSchema(nestedArraySchema, invalidData);
        expect(error2).toBe('Expected string, received number');
    });

    it('should return the first error message even if multiple errors exist', () => {
        const invalidData = {
            name: '',
            age: 'twenty',
            email: 'invalid-email',
        };
        const error = validateWithSchema(userSchema, invalidData);
        expect(error).toBe('Name is required'); // First error
    });
});
