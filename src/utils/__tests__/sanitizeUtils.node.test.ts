import { filterBadWords } from '../filterBadWords';

describe('filterBadWords', () => {
    // 基本機能テスト
    describe('Basic Functionality', () => {
        it('should return the same text if no bad words are present', () => {
            const input = 'This is a clean sentence with no offensive language.';
            const output = filterBadWords(input);
            expect(output).toBe(input);
        });

        it('should censor bad words present in the text', () => {
            const input = 'This is a damn test with some shit words.';
            const output = filterBadWords(input);
            expect(output).toBe('This is a **** test with some **** words.');
        });

        it('should censor multiple occurrences of bad words', () => {
            const input = 'Shit! This damn shit is too much damn!';
            const output = filterBadWords(input);
            expect(output).toBe('****! This **** **** is too much ****!');
        });
    });

    // 大文字小文字の扱い
    describe('Case Insensitivity', () => {
        it('should handle bad words with different casing', () => {
            const input = 'Damn, that was a ShIt show!';
            const output = filterBadWords(input);
            expect(output).toBe('****, that was a **** show!');
        });

        it('should handle bad words in uppercase', () => {
            const input = 'DAMN! SHIT!';
            const output = filterBadWords(input);
            expect(output).toBe('****! ****!');
        });

        it('should handle bad words in mixed case', () => {
            const input = 'DaMn ShIt DaMn ShIt';
            const output = filterBadWords(input);
            expect(output).toBe('**** **** **** ****');
        });
    });

    // サブストリングの扱い
    describe('Substrings Handling', () => {
        it('should not censor words that contain bad words as substrings', () => {
            const input = 'The shellfish were delicious.';
            const output = filterBadWords(input);
            expect(output).toBe(input);
        });

        it('should not censor words where bad words are part of longer words', () => {
            const input = 'He is a shapeshifter and a commissioner.';
            const output = filterBadWords(input);
            expect(output).toBe(input);
        });
    });

    // 特殊文字とエンコーディング
    describe('Special Characters and Encoding', () => {
        it('should handle punctuation adjacent to bad words', () => {
            const input = 'What the damn! Stop that shit.';
            const output = filterBadWords(input);
            expect(output).toBe('What the ****! Stop that ****.');
        });

        it('should handle words separated by special characters', () => {
            const input = 'Damn!Shit?Yes, damn-shit.';
            const output = filterBadWords(input);
            expect(output).toBe('****!****?Yes, ****-****.');
        });

        it('should handle special characters inside bad words', () => {
            const input = 'Sh!t and D@mn should be censored.';
            const output = filterBadWords(input);
            // Depending on bad-words library, may not detect these variations
            expect(output).toBe(input);
        });
    });

    // 空文字と極端な入力
    describe('Edge Cases', () => {
        it('should handle an empty string', () => {
            const input = '';
            const output = filterBadWords(input);
            expect(output).toBe('');
        });

        it('should handle strings with only bad words', () => {
            const input = 'Shit damn shit damn';
            const output = filterBadWords(input);
            expect(output).toBe('**** **** **** ****');
        });

        it('should handle repeated bad words without spaces', () => {
            const input = 'damndamndamn';
            const output = filterBadWords(input);
            // Depending on bad-words library, likely no detection
            expect(output).toBe(input);
        });

        it('should handle bad words with trailing and leading spaces', () => {
            const input = ' damn  shit ';
            const output = filterBadWords(input);
            expect(output).toBe(' ****  **** ');
        });
    });

    // アルファベット以外の文字とUnicode
    describe('Alphanumeric and Unicode Characters', () => {
        it('should handle bad words surrounded by numbers', () => {
            const input = '123damn456 and 789shit012';
            const output = filterBadWords(input);
            // Depending on bad-words configuration, may or may not censor 'damn' and 'shit' within numbers
            expect(output).toBe('123****456 and 789****012');
        });

        it('should handle unicode characters mixed with bad words', () => {
            const input = 'This is a damn👍 and shit😡 situation.';
            const output = filterBadWords(input);
            expect(output).toBe('This is a ****👍 and ****😡 situation.');
        });

        it('should handle bad words with mixed alphanumeric characters', () => {
            const input = 'This is a sh1t and d4mn scenario.';
            const output = filterBadWords(input);
            // Assuming 'sh1t' and 'd4mn' are not detected by bad-words library
            expect(output).toBe(input);
        });
    });

    // 改行とタブの扱い
    describe('Whitespace Characters', () => {
        it('should handle newline and tab characters', () => {
            const input = 'This is a damn\nnew line and\tshit tab.';
            const output = filterBadWords(input);
            expect(output).toBe('This is a ****\nnew line and\t**** tab.');
        });
    });

    // 大量の悪意ある言葉を含むテキスト
    describe('Large Input with Multiple Bad Words', () => {
        it('should handle large input with multiple bad words', () => {
            const input = 'shit '.repeat(1000) + 'damn '.repeat(1000);
            const output = filterBadWords(input);
            const expected = '**** '.repeat(1000) + '**** '.repeat(1000);
            expect(output).toBe(expected);
        });
    });

    // カスタムフィルタリング設定のテスト(必要に応じ)
    // 例:特定の悪意ある言葉を追加する場合
    // このテストケースは、sanitizeUtils.ts がカスタムフィルタリングをサポートしている場合に有効
    /*
    describe('Custom Filtering', () => {
        it('should censor custom added bad words', () => {
            // ここでカスタムフィルタリングを設定し、テストを実施
        });
    });
    */
});
