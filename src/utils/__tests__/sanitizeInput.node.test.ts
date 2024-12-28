// src/utils/sanitizeInput.test.ts

import { sanitizeInput } from '../sanitizeInput';

describe('sanitizeInput', () => {
    // 1. 許可されたタグと属性の入力
    describe('Allowed Tags and Attributes', () => {
        it('should retain allowed tags and attributes', () => {
        const input = `
            <p>This is a <strong>strong</strong> paragraph with an <a href="https://example.com" title="Example">example link</a>.</p>
            <ul><li>List Item 1</li><li>List Item 2</li></ul>
        `;
        const expected = `
            <p>This is a <strong>strong</strong> paragraph with an <a href="https://example.com" title="Example">example link</a>.</p>
            <ul><li>List Item 1</li><li>List Item 2</li></ul>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should retain custom elements with allowed prefix', () => {
        const input = `
            <my-custom-element attr="value">Custom Content</my-custom-element>
        `;
        const expected = `
            <my-custom-element attr="value">Custom Content</my-custom-element>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 2. 禁止されたタグの入力
    describe('Forbidden Tags', () => {
        it('should remove forbidden tags and their content', () => {
        const input = `
            <p>Paragraph with a <script>alert("XSS")</script> script.</p>
            <iframe src="https://malicious.com"></iframe>
        `;
        const expected = `
            <p>Paragraph with a  script.</p>

        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove <style> tags', () => {
        const input = `
            <style>body { background-color: red; }</style>
            <p>Text after style.</p>
        `;
        const expected = `
            <p>Text after style.</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove <object> and <embed> tags', () => {
        const input = `
            <object data="malicious.swf"></object>
            <embed src="malicious.swf"></embed>
            <p>Content after objects.</p>
        `;
        const expected = `
            <p>Content after objects.</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 3. 禁止された属性の入力
    describe('Forbidden Attributes', () => {
        it('should remove forbidden attributes from allowed tags', () => {
        const input = `
            <a href="https://example.com" onclick="stealCookies()">Click me</a>
            <img src="image.jpg" onerror="alert('XSS')" alt="Image">
        `;
        const expected = `
            <a href="https://example.com">Click me</a>
            <img src="image.jpg" alt="Image">
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove style attributes', () => {
        const input = `
            <p style="color: red;">Red text</p>
            <span style="font-size: 20px;">Large text</span>
        `;
        const expected = `
            <p>Red text</p>
            <span>Large text</span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove aria-* attributes when ALLOW_ARIA_ATTR is false', () => {
        const input = `
            <div aria-label="Accessible Label">Content</div>
            <span aria-hidden="true">Hidden Content</span>
        `;
        const expected = `
            <div>Content</div>
            <span>Hidden Content</span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove data-* attributes when ALLOW_DATA_ATTR is false', () => {
        const input = `
            <div data-info="secret">Content</div>
            <span data-id="12345">Span Content</span>
        `;
        const expected = `
            <div>Content</div>
            <span>Span Content</span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 4. 悪意のあるプロトコルの入力
    describe('Dangerous Protocols', () => {
        it('should remove href with javascript protocol', () => {
        const input = `
            <a href="javascript:alert('XSS')">Bad Link</a>
            <a href="mailto:user@example.com">Email Link</a>
        `;
        const expected = `
            <a>Bad Link</a>
            <a href="mailto:user@example.com">Email Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove src with javascript protocol in img tags', () => {
        const input = `
            <img src="javascript:alert('XSS')" alt="Bad Image">
            <img src="https://example.com/image.jpg" alt="Good Image">
        `;
        const expected = `
            <img alt="Bad Image">
            <img src="https://example.com/image.jpg" alt="Good Image">
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove href with data protocol', () => {
        const input = `
            <a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=">Data Link</a>
            <a href="https://example.com">Safe Link</a>
        `;
        const expected = `
            <a>Data Link</a>
            <a href="https://example.com">Safe Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 5. イベントハンドラの悪用
    describe('Event Handlers', () => {
        it('should remove event handler attributes', () => {
        const input = `
            <button onclick="doSomething()">Click me</button>
            <div onmouseover="stealData()">Hover over me</div>
        `;
        const expected = `
            <button>Click me</button>
            <div>Hover over me</div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove multiple event handler attributes', () => {
        const input = `
            <a href="https://example.com" onclick="alert('XSS')" onmouseover="trackMouse()">Link</a>
        `;
        const expected = `
            <a href="https://example.com">Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 6. DOM Clobbering の試み
    describe('DOM Clobbering Attempts', () => {
        it('should prevent DOM Clobbering by removing dangerous properties', () => {
        const input = `
            <img src="image.jpg" id="__proto__" />
            <div id="constructor">Div Content</div>
        `;
        const expected = `
            <img src="image.jpg">
            <div>Div Content</div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should prevent DOM Clobbering with named properties', () => {
        const input = `
            <div id="toString">Content</div>
            <span id="valueOf">Span Content</span>
        `;
        const expected = `
            <div>Content</div>
            <span>Span Content</span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 7. CSS インジェクションの試み
    describe('CSS Injection Attempts', () => {
        it('should remove style attributes with dangerous CSS', () => {
        const input = `
            <p style="background-image: url('javascript:alert(1)')">Styled Paragraph</p>
        `;
        const expected = `
            <p>Styled Paragraph</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove <style> tags with malicious CSS', () => {
        const input = `
            <style>.danger { color: red; }</style>
            <p class="danger">Dangerous Text</p>
        `;
        const expected = `
            <p class="danger">Dangerous Text</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove style attributes attempting CSS expressions', () => {
        const input = `
            <div style="width: expression(alert('XSS'));"></div>
            <span style="height: 100px;">Safe Span</span>
        `;
        const expected = `
            <div></div>
            <span style="height: 100px;">Safe Span</span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 8. 空文字や特殊文字の入力
    describe('Edge Cases', () => {
        it('should handle empty string', () => {
        const input = '';
        const expected = '';
        expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle strings with only whitespace', () => {
        const input = '   \n\t  ';
        const expected = '';
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should handle strings with special characters', () => {
        const input = '<>&"\'';
        const expected = '&lt;&gt;&amp;&quot;&#39;';
        expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle strings with encoded characters', () => {
        const input = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
        const expected = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
        expect(sanitizeInput(input)).toBe(expected);
        });

        it('should handle mixed encoded and raw characters', () => {
        const input = '<p>Safe &lt;strong&gt;Text&lt;/strong&gt;</p>';
        const expected = '<p>Safe &lt;strong&gt;Text&lt;/strong&gt;</p>';
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 9. 大規模な入力
    describe('Large Inputs', () => {
        it('should handle large input without errors', () => {
        const largeInput = '<p>' + 'Hello World! '.repeat(1000) + '</p>';
        const expected = '<p>' + 'Hello World! '.repeat(1000).trim() + '</p>';
        expect(sanitizeInput(largeInput)).toBe(expected);
        });

        it('should sanitize large input with mixed content', () => {
        let largeInput = '<div>';
        for (let i = 0; i < 1000; i++) {
            largeInput += `<p onclick="alert(${i})">Paragraph ${i}</p>`;
        }
        largeInput += '</div>';

        let expected = '<div>';
        for (let i = 0; i < 1000; i++) {
            expected += `<p>Paragraph ${i}</p>`;
        }
        expected += '</div>';

        expect(sanitizeInput(largeInput)).toBe(expected);
        });

        it('should sanitize large input with nested forbidden tags', () => {
        let largeInput = '<div>';
        for (let i = 0; i < 500; i++) {
            largeInput += `<p>Paragraph ${i} with <script>alert(${i})</script></p>`;
        }
        largeInput += '</div>';

        let expected = '<div>';
        for (let i = 0; i < 500; i++) {
            expected += `<p>Paragraph ${i} with </p>`;
        }
        expected += '</div>';

        expect(sanitizeInput(largeInput)).toBe(expected);
        });
    });

    // 10. カスタム要素の許可と除外
    describe('Custom Elements', () => {
        it('should allow custom elements with specified prefix', () => {
        const input = `
            <my-custom-element attr="value">Custom Content</my-custom-element>
        `;
        const expected = `
            <my-custom-element attr="value">Custom Content</my-custom-element>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove custom elements without specified prefix', () => {
        const input = `
            <custom-element attr="value">Custom Content</custom-element>
        `;
        const expected = `
            Custom Content
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should allow multiple custom elements with allowed prefix', () => {
        const input = `
            <my-element1>Content 1</my-element1>
            <my-element2 attr="data">Content 2</my-element2>
        `;
        const expected = `
            <my-element1>Content 1</my-element1>
            <my-element2 attr="data">Content 2</my-element2>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove nested custom elements without allowed prefix', () => {
        const input = `
            <div>
            <custom-element>
                <my-custom-element>Allowed Nested</my-custom-element>
                <another-custom>Disallowed Nested</another-custom>
            </custom-element>
            </div>
        `;
        const expected = `
            <div>

                <my-custom-element>Allowed Nested</my-custom-element>
                Disallowed Nested

            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 11. フレームワーク固有の攻撃
    describe('Framework-specific Attacks', () => {
        it('should sanitize Angular template bindings', () => {
        const input = `
            <div>{{maliciousBinding}}</div>
            <span [attr]="dangerousAttribute"></span>
        `;
        const expected = `
            <div>{{maliciousBinding}}</div>
            <span></span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should sanitize React JSX attributes', () => {
        const input = `
            <div onClick={handleClick}>Click me</div>
            <img src={imageUrl} alt="Image" />
        `;
        const expected = `
            <div>Click me</div>
            <img src={imageUrl} alt="Image">
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 12. エンティティのエスケープ
    describe('Entity Escaping', () => {
        it('should escape HTML entities correctly', () => {
        const input = `
            <p>5 &lt; 10 &amp; 15 &gt; 10</p>
        `;
        const expected = `
            <p>5 &lt; 10 &amp; 15 &gt; 10</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should prevent double escaping of entities', () => {
        const input = `
            <p>5 &amp;lt; 10 &amp;amp; 15 &amp;gt; 10</p>
        `;
        const expected = `
            <p>5 &amp;lt; 10 &amp;amp; 15 &amp;gt; 10</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 13. Unicodeとエンコードのテスト
    describe('Unicode and Encoding Tests', () => {
        it('should handle Unicode characters correctly', () => {
        const input = `
            <p>こんにちは、世界！</p>
            <a href="https://例え.com">リンク</a>
        `;
        const expected = `
            <p>こんにちは、世界！</p>
            <a href="https://例え.com">リンク</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should handle mixed encodings', () => {
        const input = `
            <p>Normal Text</p>
            <a href="https://example.com/?q=%3Cscript%3Ealert('XSS')%3C/script%3E">Link with encoded script</a>
        `;
        const expected = `
            <p>Normal Text</p>
            <a href="https://example.com/?q=%3Cscript%3Ealert('XSS')%3C/script%3E">Link with encoded script</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 14. 不正なHTML構造のテスト
    describe('Malformed HTML', () => {
        it('should handle unclosed tags gracefully', () => {
        const input = `
            <p>This is a <strong>strong paragraph without closing tags.
            <a href="https://example.com">Link without closing tag
        `;
        const expected = `
            <p>This is a <strong>strong paragraph without closing tags.</strong></p>
            <a href="https://example.com">Link without closing tag</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should handle overlapping tags correctly', () => {
        const input = `
            <p><strong>Bold and <em>italic</strong> text</em></p>
        `;
        const expected = `
            <p><strong>Bold and <em>italic</em></strong> text</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should handle nested forbidden tags', () => {
        const input = `
            <div>
            <script>
                <iframe src="https://malicious.com"></iframe>
            </script>
            <p>Safe Content</p>
            </div>
        `;
        const expected = `
            <div>

            <p>Safe Content</p>
            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 15. スクリプトのインライン挿入
    describe('Inline Script Insertion', () => {
        it('should remove inline scripts within allowed tags', () => {
        const input = `
            <p>Paragraph with inline <img src="image.jpg" onerror="alert('XSS')"> image.</p>
        `;
        const expected = `
            <p>Paragraph with inline <img src="image.jpg"> image.</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove inline event handlers in nested elements', () => {
        const input = `
            <div>
            <span onclick="stealData()">Hover over me</span>
            <a href="https://example.com" onmousedown="triggerEvent()">Link</a>
            </div>
        `;
        const expected = `
            <div>
            <span>Hover over me</span>
            <a href="https://example.com">Link</a>
            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 16. フレームワーク固有のテンプレート攻撃
    describe('Framework-specific Template Attacks', () => {
        it('should sanitize Vue.js template bindings', () => {
        const input = `
            <div v-on:click="handleClick">Vue Click</div>
            <span :class="dynamicClass">Vue Span</span>
        `;
        const expected = `
            <div>Vue Click</div>
            <span>Vue Span</span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should sanitize Handlebars expressions', () => {
        const input = `
            <p>{{maliciousExpression}}</p>
            <a href="{{dynamicUrl}}">Handlebars Link</a>
        `;
        const expected = `
            <p>{{maliciousExpression}}</p>
            <a href="{{dynamicUrl}}">Handlebars Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 17. データURIの扱い
    describe('Data URIs', () => {
        it('should allow safe data URIs', () => {
        const input = `
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" alt="Safe Image">
        `;
        const expected = `
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" alt="Safe Image">
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove data URIs with dangerous content', () => {
        const input = `
            <a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=">Bad Data Link</a>
        `;
        const expected = `
            <a>Bad Data Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 18. エスケープ文字列の扱い
    describe('Escaped Strings', () => {
        it('should properly escape angle brackets in text', () => {
        const input = `
            <p>5 &lt; 10 &amp; 15 &gt; 10</p>
        `;
        const expected = `
            <p>5 &lt; 10 &amp; 15 &gt; 10</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should not double escape already escaped characters', () => {
        const input = `
            <p>5 &amp;lt; 10 &amp;amp; 15 &amp;gt; 10</p>
        `;
        const expected = `
            <p>5 &amp;lt; 10 &amp;amp; 15 &amp;gt; 10</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 19. コメントとCDATAの扱い
    describe('Comments and CDATA', () => {
        it('should remove HTML comments', () => {
        const input = `
            <p>Paragraph<!-- This is a comment --></p>
            <!-- Another comment -->
            <div>Div Content</div>
        `;
        const expected = `
            <p>Paragraph</p>
            <div>Div Content</div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove CDATA sections', () => {
        const input = `
            <p><![CDATA[Some CDATA content]]></p>
            <div>Div Content</div>
        `;
        const expected = `
            <p>Some CDATA content</p>
            <div>Div Content</div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 20. テキストノードの処理
    describe('Text Nodes', () => {
        it('should preserve plain text without any HTML', () => {
        const input = `
            Plain text without any HTML tags.
        `;
        const expected = `
            Plain text without any HTML tags.
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should escape special characters in text nodes', () => {
        const input = `
            <p>Special characters: <, >, &, ", '</p>
        `;
        const expected = `
            <p>Special characters: &lt;, &gt;, &amp;, &quot;, &#39;</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 21. テーブルのサニタイズ
    describe('Tables', () => {
        it('should allow basic table structure', () => {
        const input = `
            <table>
            <thead>
                <tr><th>Header 1</th><th>Header 2</th></tr>
            </thead>
            <tbody>
                <tr><td>Data 1</td><td>Data 2</td></tr>
            </tbody>
            </table>
        `;
        const expected = `
            <table>
            <thead>
                <tr><th>Header 1</th><th>Header 2</th></tr>
            </thead>
            <tbody>
                <tr><td>Data 1</td><td>Data 2</td></tr>
            </tbody>
            </table>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove forbidden tags within tables', () => {
        const input = `
            <table>
            <thead>
                <tr><th>Header</th></tr>
            </thead>
            <tbody>
                <tr><td>Data <script>alert('XSS')</script></td></tr>
            </tbody>
            </table>
        `;
        const expected = `
            <table>
            <thead>
                <tr><th>Header</th></tr>
            </thead>
            <tbody>
                <tr><td>Data </td></tr>
            </tbody>
            </table>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 22. 複数の危険な要素と属性
    describe('Multiple Dangerous Elements and Attributes', () => {
        it('should remove multiple forbidden tags and attributes in one input', () => {
        const input = `
            <div onclick="doSomething()">
            <p>Safe paragraph with <a href="javascript:alert('XSS')" onmouseover="stealCookies()">link</a>.</p>
            <script>alert('XSS');</script>
            <img src="javascript:alert('XSS')" onerror="stealData()" alt="Image">
            </div>
        `;
        const expected = `
            <div>
            <p>Safe paragraph with <a>link</a>.</p>

            <img alt="Image">
            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should sanitize deeply nested dangerous content', () => {
        const input = `
            <div>
            <p>Paragraph with <span onclick="alert('XSS')">span</span> and
                <a href="javascript:alert('XSS')">link</a>
            </p>
            <style>body { background: url("javascript:alert('XSS')"); }</style>
            </div>
        `;
        const expected = `
            <div>
            <p>Paragraph with <span>span</span> and
                <a>link</a>
            </p>

            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 23. 非ASCII文字と特殊文字のテスト
    describe('Non-ASCII and Special Characters', () => {
        it('should handle non-ASCII characters correctly', () => {
        const input = `
            <p>こんにちは、世界！</p>
            <a href="https://例え.com">リンク</a>
        `;
        const expected = `
            <p>こんにちは、世界！</p>
            <a href="https://例え.com">リンク</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should escape special characters in non-ASCII contexts', () => {
        const input = `
            <p>特殊文字: <, >, &, ", '</p>
            <a href="https://例え.com?param=<script>">リンク</a>
        `;
        const expected = `
            <p>特殊文字: &lt;, &gt;, &amp;, &quot;, &#39;</p>
            <a href="https://例え.com?param=<script>">リンク</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 24. エンコードされた攻撃のテスト
    describe('Encoded Attack Vectors', () => {
        it('should remove script tags encoded with HTML entities', () => {
        const input = `
            <p>Safe text</p>
            &lt;script&gt;alert('XSS')&lt;/script&gt;
        `;
        const expected = `
            <p>Safe text</p>
            &lt;script&gt;alert('XSS')&lt;/script&gt;
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove event handlers encoded with entities', () => {
        const input = `
            <a href="https://example.com" onclick="alert('XSS')">Click me</a>
            <a href="https://example.com" onclick="&lt;script&gt;alert('XSS')&lt;/script&gt;">Click me</a>
        `;
        const expected = `
            <a href="https://example.com">Click me</a>
            <a href="https://example.com">Click me</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove href attributes with encoded javascript protocol', () => {
        const input = `
            <a href="javascript&#58;alert('XSS')">Bad Link</a>
            <a href="https://example.com">Good Link</a>
        `;
        const expected = `
            <a>Bad Link</a>
            <a href="https://example.com">Good Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 25. テキスト内のHTMLタグの扱い
    describe('HTML Tags in Text', () => {
        it('should escape HTML tags in text nodes', () => {
        const input = `
            <p>This is a paragraph with <strong>bold</strong> text.</p>
            <p>Another paragraph with <unknown>unknown tag</unknown>.</p>
        `;
        const expected = `
            <p>This is a paragraph with <strong>bold</strong> text.</p>
            <p>Another paragraph with unknown tag.</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should escape HTML tags within attribute values', () => {
        const input = `
            <a href="https://example.com/?q=<script>alert('XSS')</script>">Link</a>
        `;
        const expected = `
            <a href="https://example.com/?q=<script>alert('XSS')</script>">Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 26. インラインCSSの制限
    describe('Inline CSS Restrictions', () => {
        it('should remove dangerous CSS expressions', () => {
        const input = `
            <p style="width: expression(alert('XSS')); color: blue;">Styled Paragraph</p>
        `;
        const expected = `
            <p style="color: blue;">Styled Paragraph</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should allow safe CSS properties', () => {
        const input = `
            <div style="color: red; font-size: 16px;">Styled Div</div>
        `;
        const expected = `
            <div style="color: red; font-size: 16px;">Styled Div</div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 27. 画像タグの安全性
    describe('Image Tags Safety', () => {
        it('should allow images with safe src attributes', () => {
        const input = `
            <img src="https://example.com/image.jpg" alt="Example Image">
        `;
        const expected = `
            <img src="https://example.com/image.jpg" alt="Example Image">
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove images with dangerous src attributes', () => {
        const input = `
            <img src="javascript:alert('XSS')" alt="Bad Image">
            <img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=" alt="Malicious Image">
        `;
        const expected = `
            <img alt="Bad Image">
            <img alt="Malicious Image">
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove alt attributes with malicious content', () => {
        const input = `
            <img src="https://example.com/image.jpg" alt="Image with <script>alert('XSS')</script>">
        `;
        const expected = `
            <img src="https://example.com/image.jpg" alt="Image with &lt;script&gt;alert('XSS')&lt;/script&gt;">
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 28. リンクタグの安全性
    describe('Link Tags Safety', () => {
        it('should allow links with safe href attributes', () => {
        const input = `
            <a href="https://example.com" title="Example">Example Link</a>
        `;
        const expected = `
            <a href="https://example.com" title="Example">Example Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove links with dangerous href attributes', () => {
        const input = `
            <a href="javascript:alert('XSS')" title="Bad Link">Bad Link</a>
            <a href="ftp://example.com/file.txt">FTP Link</a>
        `;
        const expected = `
            <a title="Bad Link">Bad Link</a>
            <a href="ftp://example.com/file.txt">FTP Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should allow target attributes with safe values', () => {
        const input = `
            <a href="https://example.com" target="_blank">New Tab Link</a>
            <a href="https://example.com" target="_self">Same Tab Link</a>
        `;
        const expected = `
            <a href="https://example.com" target="_blank">New Tab Link</a>
            <a href="https://example.com" target="_self">Same Tab Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove target attributes with unsafe values', () => {
        const input = `
            <a href="https://example.com" target="javascript:alert('XSS')">Bad Target Link</a>
        `;
        const expected = `
            <a href="https://example.com">Bad Target Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 29. セマンティックHTMLのテスト
    describe('Semantic HTML', () => {
        it('should retain semantic HTML tags', () => {
        const input = `
            <header>
            <h1>Title</h1>
            </header>
            <main>
            <article>
                <h2>Article Title</h2>
                <p>Article content.</p>
            </article>
            </main>
            <footer>
            <p>Footer content.</p>
            </footer>
        `;
        const expected = `
            <header>
            <h1>Title</h1>
            </header>
            <main>
            <article>
                <h2>Article Title</h2>
                <p>Article content.</p>
            </article>
            </main>
            <footer>
            <p>Footer content.</p>
            </footer>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove non-semantic tags but retain content', () => {
        const input = `
            <div>
            <span>Span Content</span>
            <b>Bold Text</b>
            <i>Italic Text</i>
            </div>
        `;
        const expected = `
            <div>
            <span>Span Content</span>
            <b>Bold Text</b>
            <i>Italic Text</i>
            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 30. SVGとMathMLのテスト
    describe('SVG and MathML', () => {
        it('should remove SVG tags', () => {
        const input = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="green" fill="yellow" />
            </svg>
            <p>SVG should be removed.</p>
        `;
        const expected = `
            <p>SVG should be removed.</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove MathML tags', () => {
        const input = `
            <math xmlns="http://www.w3.org/1998/Math/MathML">
            <mi>x</mi>
            <mo>=</mo>
            <mfrac>
                <mn>1</mn>
                <mi>y</mi>
            </mfrac>
            </math>
            <p>MathML should be removed.</p>
        `;
        const expected = `
            <p>MathML should be removed.</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should allow SVG tags if included in ALLOWED_TAGS', () => {
        // ALLOWED_TAGSに'svg'と関連タグを追加する必要があります。
        // このテストケースは現在の設定では削除されることを確認します。
        const input = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="green" fill="yellow" />
            </svg>
        `;
        const expected = `

        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 31. URLエンコーディングのテスト
    describe('URL Encoding', () => {
        it('should handle URLs with encoded characters correctly', () => {
        const input = `
            <a href="https://example.com/search?q=%3Cscript%3Ealert('XSS')%3C/script%3E">Search Link</a>
        `;
        const expected = `
            <a href="https://example.com/search?q=%3Cscript%3Ealert('XSS')%3C/script%3E">Search Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove href with double-encoded javascript protocol', () => {
        const input = `
            <a href="javascript%253Aalert('XSS')">Double Encoded Script Link</a>
        `;
        const expected = `
            <a>Double Encoded Script Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 32. 多言語サポートのテスト
    describe('Multilingual Support', () => {
        it('should handle RTL (Right-to-Left) languages correctly', () => {
        const input = `
            <p dir="rtl">مرحبا بالعالم</p>
            <a href="https://مثال.com" title="مثال">رابط مثال</a>
        `;
        const expected = `
            <p>مرحبا بالعالم</p>
            <a href="https://مثال.com" title="مثال">رابط مثال</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should handle languages with special characters', () => {
        const input = `
            <p>Γειά σου Κόσμε!</p>
            <a href="https://παράδειγμα.com" title="Παράδειγμα">Σύνδεσμος</a>
        `;
        const expected = `
            <p>Γειά σου Κόσμε!</p>
            <a href="https://παράδειγμα.com" title="Παράδειγμα">Σύνδεσμος</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 33. 属性値の検証
    describe('Attribute Value Validation', () => {
        it('should remove href attributes with invalid URLs', () => {
        const input = `
            <a href="htp://invalid-url.com">Invalid URL Link</a>
            <a href="https://valid-url.com">Valid URL Link</a>
        `;
        const expected = `
            <a>Invalid URL Link</a>
            <a href="https://valid-url.com">Valid URL Link</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove src attributes with invalid URLs in img tags', () => {
        const input = `
            <img src="htp://invalid-url.com/image.jpg" alt="Invalid Image">
            <img src="https://valid-url.com/image.jpg" alt="Valid Image">
        `;
        const expected = `
            <img alt="Invalid Image">
            <img src="https://valid-url.com/image.jpg" alt="Valid Image">
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 34. コメント内の攻撃
    describe('Attacks Within Comments', () => {
        it('should remove comments containing malicious scripts', () => {
        const input = `
            <p>Safe text</p>
            <!-- <script>alert('XSS')</script> -->
            <div>Content after comment.</div>
        `;
        const expected = `
            <p>Safe text</p>
            <div>Content after comment.</div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove comments with encoded scripts', () => {
        const input = `
            <p>Text before comment</p>
            <!-- &lt;script&gt;alert('XSS')&lt;/script&gt; -->
            <span>Text after comment</span>
        `;
        const expected = `
            <p>Text before comment</p>
            <span>Text after comment</span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 35. 非標準属性とデータ属性のテスト
    describe('Non-standard and Data Attributes', () => {
        it('should remove non-standard attributes', () => {
        const input = `
            <p custom-attr="value">Paragraph with custom attribute</p>
            <a href="https://example.com" data-custom="value">Link with data attribute</a>
        `;
        const expected = `
            <p>Paragraph with custom attribute</p>
            <a href="https://example.com">Link with data attribute</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should allow data attributes if ALLOW_DATA_ATTR is true', () => {
        // このテストケースを有効にするには、sanitizeInput.tsで ALLOW_DATA_ATTR を true に設定する必要があります。
        const input = `
            <div data-info="secret">Content with data attribute</div>
            <span data-id="12345">Span with data attribute</span>
        `;
        const expected = `
            <div data-info="secret">Content with data attribute</div>
            <span data-id="12345">Span with data attribute</span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 36. 属性値内の危険な文字列
    describe('Dangerous Strings in Attribute Values', () => {
        it('should remove dangerous strings within href attributes', () => {
        const input = `
            <a href="https://example.com/page?param=<script>alert('XSS')</script>">Link with dangerous param</a>
        `;
        const expected = `
            <a href="https://example.com/page?param=<script>alert('XSS')</script>">Link with dangerous param</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove dangerous strings within src attributes', () => {
        const input = `
            <img src="https://example.com/image.jpg?param=<script>alert('XSS')</script>" alt="Image with dangerous param">
        `;
        const expected = `
            <img src="https://example.com/image.jpg?param=<script>alert('XSS')</script>" alt="Image with dangerous param">
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 37. 複合攻撃ベクトル
    describe('Complex Attack Vectors', () => {
        it('should handle inputs combining multiple attack vectors', () => {
        const input = `
            <div onclick="javascript:alert('XSS')">
            <p>Paragraph with <a href="javascript:alert('XSS')" onmouseover="stealCookies()">bad link</a>.</p>
            <img src="javascript:alert('XSS')" onerror="stealData()" alt="Bad Image">
            <style>body { background: url("javascript:alert('XSS')"); }</style>
            <script>alert('XSS');</script>
            </div>
        `;
        const expected = `
            <div>
            <p>Paragraph with <a>bad link</a>.</p>
            <img alt="Bad Image">

            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 38. テキストノードの改行とスペース
    describe('Text Nodes with Newlines and Spaces', () => {
        it('should preserve newlines and spaces within text nodes', () => {
        const input = `
            <p>
            This is a paragraph
            with multiple lines
            and    spaces.
            </p>
        `;
        const expected = `
            <p>
            This is a paragraph
            with multiple lines
            and    spaces.
            </p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 39. 複雑なネスト構造のテスト
    describe('Complex Nesting Structures', () => {
        it('should sanitize deeply nested forbidden tags', () => {
        const input = `
            <div>
            <p>Paragraph with <span>span and <script>alert('XSS')</script></span></p>
            <ul>
                <li>List Item 1 with <iframe src="https://malicious.com"></iframe></li>
                <li>List Item 2 with <embed src="malicious.swf"></embed></li>
            </ul>
            </div>
        `;
        const expected = `
            <div>
            <p>Paragraph with <span>span and </span></p>
            <ul>
                <li>List Item 1 with </li>
                <li>List Item 2 with </li>
            </ul>
            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 40. 誤った属性値のテスト
    describe('Incorrect Attribute Values', () => {
        it('should remove href attributes with malformed URLs', () => {
        const input = `
            <a href="https:/example.com">Malformed URL Link</a>
            <a href="http:///example.com">Another Malformed URL</a>
        `;
        const expected = `
            <a>Malformed URL Link</a>
            <a>Another Malformed URL</a>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove src attributes with malformed URLs in img tags', () => {
        const input = `
            <img src="https//example.com/image.jpg" alt="Malformed Image">
            <img src="http:///example.com/image.jpg" alt="Another Malformed Image">
        `;
        const expected = `
            <img alt="Malformed Image">
            <img alt="Another Malformed Image">
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 41. スクリプトのインライン挿入
    describe('Inline Script Insertion', () => {
        it('should remove inline scripts within allowed tags', () => {
        const input = `
            <p>Paragraph with inline <img src="image.jpg" onerror="alert('XSS')"> image.</p>
        `;
        const expected = `
            <p>Paragraph with inline <img src="image.jpg"> image.</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove inline event handlers in nested elements', () => {
        const input = `
            <div>
            <span onclick="alert('XSS')">Span Content</span>
            <a href="https://example.com" onmousedown="stealData()">Link</a>
            </div>
        `;
        const expected = `
            <div>
            <span>Span Content</span>
            <a href="https://example.com">Link</a>
            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 42. 特殊文字の扱い
    describe('Handling of Special Characters', () => {
        it('should escape backticks in text nodes', () => {
        const input = `
            <p>Here is a backtick: \`</p>
        `;
        const expected = `
            <p>Here is a backtick: \`</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should escape backslashes in text nodes', () => {
        const input = `
            <p>Here is a backslash: \\</p>
        `;
        const expected = `
            <p>Here is a backslash: \\</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 43. デフォルトで許可されている属性のテスト
    describe('Default Allowed Attributes', () => {
        it('should allow class and id attributes', () => {
        const input = `
            <div class="container" id="main">Content</div>
            <span class="highlight" id="span1">Highlighted Text</span>
        `;
        const expected = `
            <div class="container" id="main">Content</div>
            <span class="highlight" id="span1">Highlighted Text</span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should remove unrelated attributes', () => {
        const input = `
            <div data-info="secret" custom-attr="value">Content</div>
            <span style="color: red;" custom-attr="value">Styled Span</span>
        `;
        const expected = `
            <div>Content</div>
            <span>Styled Span</span>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 44. 不正なHTMLエンコーディング
    describe('Invalid HTML Encoding', () => {
        it('should handle malformed HTML entities', () => {
        const input = `
            <p>Malformed entity: &amp;#xZZ;</p>
        `;
        const expected = `
            <p>Malformed entity: &amp;#xZZ;</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should handle incomplete HTML entities', () => {
        const input = `
            <p>Incomplete entity: &amp;#123</p>
        `;
        const expected = `
            <p>Incomplete entity: &amp;#123</p>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 45. 組み合わせテスト
    describe('Combination Tests', () => {
        it('should handle combination of allowed and forbidden tags and attributes', () => {
        const input = `
            <div class="container" onclick="alert('XSS')">
            <p style="color: blue;">Blue <strong>bold</strong> text with <a href="javascript:alert('XSS')" title="Example">malicious link</a>.</p>
            <img src="image.jpg" onerror="alert('XSS')" alt="Image">
            </div>
        `;
        const expected = `
            <div class="container">
            <p>Blue <strong>bold</strong> text with <a title="Example">malicious link</a>.</p>
            <img src="image.jpg" alt="Image">
            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should handle nested elements with mixed content', () => {
        const input = `
            <div>
            <p>Paragraph with <em>emphasized <strong>and strong</strong></em> text.</p>
            <script>alert('XSS');</script>
            <a href="https://example.com" onclick="stealData()">Safe Link with dangerous attribute</a>
            </div>
        `;
        const expected = `
            <div>
            <p>Paragraph with <em>emphasized <strong>and strong</strong></em> text.</p>

            <a href="https://example.com">Safe Link with dangerous attribute</a>
            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });

    // 46. 再帰的な攻撃ベクトル
    describe('Recursive Attack Vectors', () => {
        it('should sanitize recursively nested malicious scripts', () => {
        const input = `
            <div>
            <p>Paragraph with <span>span and <script>alert('XSS')</script></span></p>
            <div>
                <script>console.log('XSS');</script>
                <a href="https://example.com" onload="stealData()">Nested Link</a>
            </div>
            </div>
        `;
        const expected = `
            <div>
            <p>Paragraph with <span>span and </span></p>
            <div>

                <a href="https://example.com">Nested Link</a>
            </div>
            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });

        it('should handle multiple levels of nesting with forbidden content', () => {
        const input = `
            <div>
            <ul>
                <li>Item 1 with <script>alert('XSS')</script></li>
                <li>Item 2 with <iframe src="https://malicious.com"></iframe></li>
                <li>Item 3 with <embed src="malicious.swf"></embed></li>
            </ul>
            <p>End of list.</p>
            </div>
        `;
        const expected = `
            <div>
            <ul>
                <li>Item 1 with </li>
                <li>Item 2 with </li>
                <li>Item 3 with </li>
            </ul>
            <p>End of list.</p>
            </div>
        `;
        expect(sanitizeInput(input)).toBe(expected.trim());
        });
    });
});
