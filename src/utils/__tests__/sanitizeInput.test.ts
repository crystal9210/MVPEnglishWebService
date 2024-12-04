// src/utils/__tests__/sanitizeInput.test.ts

import { sanitizeInput } from '../sanitizeInput';

describe('sanitizeInput', () => {
    it('should remove script tags', () => {
        const dirty = '<p>Hello</p><script>alert("XSS")</script>';
        const clean = '<p>Hello</p>';
        expect(sanitizeInput(dirty)).toBe(clean);
    });

    it('should remove onclick attributes', () => {
        const dirty = '<a href="https://example.com" onclick="stealCookies()">Click me</a>';
        const clean = '<a href="https://example.com">Click me</a>';
        expect(sanitizeInput(dirty)).toBe(clean);
    });

    it('should allow safe tags and attributes', () => {
        const dirty = '<strong>Bold</strong> <em>Italic</em> <a href="https://example.com" title="Example">Link</a>';
        const clean = '<strong>Bold</strong> <em>Italic</em> <a href="https://example.com" title="Example">Link</a>';
        expect(sanitizeInput(dirty)).toBe(clean);
    });

    it('should remove dangerous protocols', () => {
        const dirty = '<a href="javascript:alert(\'XSS\')">Bad Link</a>';
        const clean = '<a>Bad Link</a>';
        expect(sanitizeInput(dirty)).toBe(clean);
    });
});
