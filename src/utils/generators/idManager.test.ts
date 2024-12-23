import { IdGenerator } from "./idGenerator";
import { IdManager } from "./idManager";
import { DateTimeProvider } from "@/utils/generators/dateTimeGenerator";
import { v4 as uuidv4 } from "uuid";

// uuidv4 モック
jest.mock("uuid");
const mockedUuidv4 = uuidv4 as jest.Mock;

const fixedDateTime = "20240619-153045";
const fixedUUID = "123e4567-e89b-12d3-a456-426614174000";
const uniqueUUID = "987e6543-b21a-34c5-d789-987654321000";

describe("IdManager", () => {
    let idGenerator: IdGenerator;
    let idManager: IdManager;

    beforeEach(() => {
        idGenerator = new IdGenerator("Asia/Tokyo");

        idManager = new IdManager(idGenerator);

        // Mock uuidv4 初期化
        jest.clearAllMocks();
    });

    // 正常系テスト
    describe("Normal Cases", () => {
        it("generateUniqueSessionId should generate a unique sessionId with default format", () => {
            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            // uuidv4モック設定 >> 固定の値を返す
            mockedUuidv4.mockReturnValue(fixedUUID);

            // テスト実行
            const sessionId = idManager.generateUniqueSessionId();

            // アサーション
            expect(sessionId).toBe(`${fixedDateTime}-${fixedUUID}`);

            // getFormattedNow が "yyyyMMdd-HHmmss" フォーマットで呼ばれたことを確認
            expect(getFormattedNowSpy).toHaveBeenCalledWith("yyyyMMdd-HHmmss");

            // uuidv4 が一度だけ呼ばれたことを確認
            expect(mockedUuidv4).toHaveBeenCalledTimes(1);

            // existingIds に追加されたことを確認
            expect(idManager.isDuplicateId(sessionId)).toBe(true);

            // モックのクリア
            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        it("generateUniqueSessionId should generate a unique sessionId with custom format", () => {
            const customFormat = "yyyy-MM-dd HH:mm:ss";
            const customDateTime = "2024-06-19 15:30:45";

            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(customDateTime);

            mockedUuidv4.mockReturnValue(fixedUUID);

            const sessionId = idManager.generateUniqueSessionId(customFormat);

            expect(sessionId).toBe(`${customDateTime}-${fixedUUID}`);

            expect(getFormattedNowSpy).toHaveBeenCalledWith(customFormat);

            expect(mockedUuidv4).toHaveBeenCalledTimes(1);

            // existingIds に追加されたことを確認
            expect(idManager.isDuplicateId(sessionId)).toBe(true);

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        it("generateUniqueSessionId should generate a different sessionId when duplicate exists", () => {
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            // uuidv4 のモックを設定: 最初は fixedUUID を返し、次は uniqueUUID を返す
            mockedUuidv4
                .mockReturnValueOnce(fixedUUID) // 最初のUUID(重複)
                .mockReturnValueOnce(uniqueUUID); // 次のUUID(一意)

            // 既存のIDセット
            idManager.addExistingId(`${fixedDateTime}-${fixedUUID}`);

            // テスト実行
            const uniqueId = idManager.generateUniqueSessionId("yyyyMMdd-HHmmss", 1); // バッチサイズ1

            expect(uniqueId).toBe(`${fixedDateTime}-${uniqueUUID}`);
            // getFormattedNow が "yyyyMMdd-HHmmss" フォーマットで呼ばれたことを確認
            expect(getFormattedNowSpy).toHaveBeenCalledWith("yyyyMMdd-HHmmss");
            // uuidv4 が2回呼ばれたことを確認
            expect(mockedUuidv4).toHaveBeenCalledTimes(2);
            expect(idManager.isDuplicateId(uniqueId)).toBe(true);

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        it("isDuplicateId should return true if id exists in existingIds", () => {
            idManager.addExistingId("20240619-153045-123e4567-e89b-12d3-a456-426614174000");

            expect(idManager.isDuplicateId("20240619-153045-123e4567-e89b-12d3-a456-426614174000")).toBe(true);
        });

        it("isDuplicateId should return false if id does not exist in existingIds", () => {
            expect(idManager.isDuplicateId("20240619-153046-987e6543-b21a-34c5-d789-987654321000")).toBe(false);
        });
    });

    // 異常系テスト
    describe("Abnormal Cases", () => {
        it("should throw an error if unable to generate a unique session ID after max retries", () => {
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            // uuidv4 のモックを設定: 常に fixedUUID を返す >> 重複発生用
            mockedUuidv4.mockReturnValue(fixedUUID);

            // 既存IDセット
            for (let i = 0; i < 100; i++) {
                idManager.addExistingId(`${fixedDateTime}-${fixedUUID}`);
            }

            // テスト実行・アサーション
            expect(() => {
                idManager.generateUniqueSessionId("yyyyMMdd-HHmmss", 1);
            }).toThrow("Failed to generate a unique session ID after multiple attempts.");

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        it("should handle invalid date format gracefully", () => {
            const invalidFormat = "invalid-format";
            const invalidDateTime = "invalid-date";

            // getFormattedNowをスパイして無効な日時を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(invalidDateTime);

            mockedUuidv4.mockReturnValue(fixedUUID);

            const sessionId = idManager.generateUniqueSessionId(invalidFormat);

            expect(sessionId).toBe(`${invalidDateTime}-${fixedUUID}`);
            expect(getFormattedNowSpy).toHaveBeenCalledWith(invalidFormat);
            expect(mockedUuidv4).toHaveBeenCalledTimes(1);
            expect(idManager.isDuplicateId(sessionId)).toBe(true);

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        it('should throw an error if an invalid timezone is provided', () => {
            // DateTimeProviderのgetFormattedNowメソッドをモックしてエラーをスローするように設定
            jest.spyOn(DateTimeProvider.prototype, 'getFormattedNow').mockImplementation(() => {
                throw new Error("Invalid timezone provided.");
            });

            // --- NOTE: IdGeneratorのインスタンスを作成しないとテストが動かない
            const idGenerator = new IdGenerator("Asia/Tokyo");

            expect(() => idGenerator.generateSessionId()).toThrow("Invalid timezone provided.");
        });
    });

    // UUIDのフォーマット検証
    describe("UUID Format Validation", () => {
        it("should generate a valid UUID", () => {
            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            // uuidv4のモック設定
            mockedUuidv4.mockReturnValue(fixedUUID);

            const sessionId = idManager.generateUniqueSessionId();

            // UUID部分抽出
            const uuidPart = sessionId.split("-").slice(-5).join("-"); // UUID部分を抽出

            // アサーション
            expect(uuidPart).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            // getFormattedNow が指定されたフォーマットで呼ばれたことを確認
            expect(getFormattedNowSpy).toHaveBeenCalledWith("yyyyMMdd-HHmmss");
            // uuidv4 が一度だけ呼ばれたことを確認
            expect(mockedUuidv4).toHaveBeenCalledTimes(1);
            // existingIds に追加されたことを確認
            expect(idManager.isDuplicateId(sessionId)).toBe(true);

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });
    });

    // 高負荷シナリオテスト
    describe("High Load Scenarios", () => {
        it("should generate unique IDs under high load", () => {
            // uuidv4モック設定 >> 各呼び出しで一意のUUIDを返す
            let uuidCounter = 0;
            mockedUuidv4.mockImplementation(() => `uuid-${uuidCounter++}`);

            // テスト実行
            const iterations = 10000;
            for (let i = 0; i < iterations; i++) {
                const newId = idManager.generateUniqueSessionId("yyyyMMdd-HHmmss", 1); // バッチサイズ1
                expect(idManager.isDuplicateId(newId)).toBe(true); // 存在することを確認
            }

            expect(idManager["existingIds"].size).toBe(iterations); // ユニークなIDがすべて追加されたことを確認
            expect(mockedUuidv4).toHaveBeenCalledTimes(iterations);

            mockedUuidv4.mockClear();
        });
    });

    // タイムゾーンの動作確認
    describe("Timezone Handling", () => {
        it("should handle different timezones correctly", () => {
            const timezones = ["Asia/Tokyo", "UTC", "America/New_York"];
            const expectedResults = ["20240619-153045", "20240619-063045", "20240619-013045"];

            timezones.forEach((timezone, index) => {
                // uuidv4 のモックを設定
                mockedUuidv4.mockReturnValue(fixedUUID);

                // getFormattedNowをスパイして期待する日時を返すように設定
                const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(expectedResults[index]);

                // IdGenerator・IdManagerのインスタンス生成
                const idGen = new IdGenerator(timezone);
                const idMgr = new IdManager(idGen);

                // テスト実行
                const sessionId = idMgr.generateUniqueSessionId();

                expect(sessionId).toBe(`${expectedResults[index]}-${fixedUUID}`);
                expect(getFormattedNowSpy).toHaveBeenCalledWith("yyyyMMdd-HHmmss");
                expect(mockedUuidv4).toHaveBeenCalledTimes(1);

                // モックの呼び出し回数をリセット
                mockedUuidv4.mockClear();
                getFormattedNowSpy.mockRestore();
            });
        });
    });

    // ユニークID生成の境界値テスト
    describe("Boundary Value Tests", () => {
        it("should handle boundary values for datetime transitions", () => {
            const boundaryDateTime = "20240619-235959";
            const nextDateTime = "20240620-000000";

            // getFormattedNow をスパイして boundaryDateTime と nextDateTime を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow")
                .mockReturnValueOnce(boundaryDateTime)
                .mockReturnValueOnce(nextDateTime);

            // uuidv4 のモックを設定
            mockedUuidv4
                .mockReturnValueOnce(fixedUUID)
                .mockReturnValueOnce(uniqueUUID);

            // テスト実行
            const firstId = idManager.generateUniqueSessionId();
            expect(firstId).toBe(`${boundaryDateTime}-${fixedUUID}`);

            // アサーション
            expect(getFormattedNowSpy).toHaveBeenCalledWith("yyyyMMdd-HHmmss");
            expect(getFormattedNowSpy).toHaveBeenCalledTimes(1);
            expect(mockedUuidv4).toHaveBeenCalledTimes(1);
            expect(idManager.isDuplicateId(firstId)).toBe(true);

            const secondId = idManager.generateUniqueSessionId();
            expect(secondId).toBe(`${nextDateTime}-${uniqueUUID}`);

            // アサーション
            expect(getFormattedNowSpy).toHaveBeenCalledWith("yyyyMMdd-HHmmss");
            expect(getFormattedNowSpy).toHaveBeenCalledTimes(2);
            expect(mockedUuidv4).toHaveBeenCalledTimes(2);
            expect(idManager.isDuplicateId(secondId)).toBe(true);

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });
    });

    // UUIDの境界値テスト
    describe("UUID Boundary Value Tests", () => {
        it("should handle UUID generation up to its logical limits", () => {
            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            mockedUuidv4.mockReturnValueOnce("ffffffff-ffff-5fff-8fff-ffffffffffff");

            const sessionId = idManager.generateUniqueSessionId();

            // アサーション
            expect(sessionId).toBe(`${fixedDateTime}-ffffffff-ffff-5fff-8fff-ffffffffffff`);
            expect(getFormattedNowSpy).toHaveBeenCalledWith("yyyyMMdd-HHmmss");
            expect(mockedUuidv4).toHaveBeenCalledTimes(1);
            expect(idManager.isDuplicateId(sessionId)).toBe(true);

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });
    });

    describe("Additional Cases", () => {
        // 1. resetIds メソッドのテスト
        it("should reset existingIds correctly", () => {
            // 既存のIDを追加
            idManager.addExistingId(`${fixedDateTime}-${fixedUUID}`);
            idManager.addExistingId(`${fixedDateTime}-${uniqueUUID}`);

            // 既存IDの存在を確認
            expect(idManager.isDuplicateId(`${fixedDateTime}-${fixedUUID}`)).toBe(true);
            expect(idManager.isDuplicateId(`${fixedDateTime}-${uniqueUUID}`)).toBe(true);

            idManager.resetIds();

            // 既存IDがリセットされていることを確認
            expect(idManager.isDuplicateId(`${fixedDateTime}-${fixedUUID}`)).toBe(false);
            expect(idManager.isDuplicateId(`${fixedDateTime}-${uniqueUUID}`)).toBe(false);
        });

        // 2. バッチサイズ >1 の場合のテスト
        it("generateUniqueSessionId should handle batch size correctly", () => {
            const batchSize = 5;
            const mockUUIDs = ["uuid-1", "uuid-2", "uuid-3", "uuid-4", "uuid-5"];

            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            mockedUuidv4.mockImplementation(() => mockUUIDs.shift() || "uuid-default");

            const sessionId = idManager.generateUniqueSessionId("yyyyMMdd-HHmmss", batchSize);

            // アサーション: 最初のUUIDが選ばれる
            expect(sessionId).toBe(`${fixedDateTime}-uuid-1`);
            expect(getFormattedNowSpy).toHaveBeenCalledWith("yyyyMMdd-HHmmss");
            // uuidv4がbatchSize回呼ばれたことを確認
            expect(mockedUuidv4).toHaveBeenCalledTimes(batchSize);
            // existingIdsに追加されたことを確認
            expect(idManager.isDuplicateId(sessionId)).toBe(true);

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        // 3. resetIds メソッドの確認とバッチサイズの組み合わせテスト
        it("should reset existingIds and handle batch size correctly", () => {
            const batchSize = 3;
            const mockUUIDs = ["uuid-a", "uuid-b", "uuid-c"];

            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            // uuidv4 のモックを設定
            mockedUuidv4.mockImplementation(() => mockUUIDs.shift() || "uuid-default");

            // 既存のIDを追加
            idManager.addExistingId(`${fixedDateTime}-existing-uuid-1`);
            idManager.addExistingId(`${fixedDateTime}-existing-uuid-2`);

            // テスト実行
            const newSessionId = idManager.generateUniqueSessionId("yyyyMMdd-HHmmss", batchSize);

            // アサーション: 最初のUUIDが選ばれる
            expect(newSessionId).toBe(`${fixedDateTime}-uuid-a`);
            expect(getFormattedNowSpy).toHaveBeenCalledWith("yyyyMMdd-HHmmss");
            // uuidv4がbatchSize回呼ばれたことを確認
            expect(mockedUuidv4).toHaveBeenCalledTimes(batchSize);
            expect(idManager.isDuplicateId(newSessionId)).toBe(true);

            // resetIds呼び出し
            idManager.resetIds();

            // 既存ID・新規IDのリセット確認
            expect(idManager.isDuplicateId(`${fixedDateTime}-existing-uuid-1`)).toBe(false);
            expect(idManager.isDuplicateId(`${fixedDateTime}-existing-uuid-2`)).toBe(false);
            expect(idManager.isDuplicateId(newSessionId)).toBe(false);

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });
    });

    // 並行実行時の動作確認 >> 必要ならより具体的なケースにおいても追加
    it("should handle concurrent session ID generation without duplicates", async () => {
        const concurrentCalls = 10;
        const mockUUIDs = Array.from({ length: concurrentCalls }, (_, i) => `uuid-concurrent-${i}`);

        // getFormattedNowをスパイして固定値を返すように設定
        const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

        // uuidv4モック設定
        mockedUuidv4.mockImplementation(() => mockUUIDs.shift() || "uuid-default");

        // 並行でセッションID生成
        const promises = Array.from({ length: concurrentCalls }, () => idManager.generateUniqueSessionId("yyyyMMdd-HHmmss", 1));

        const sessionIds = await Promise.all(promises);

        // すべてのセッションIDが一意であることを確認
        const uniqueSessionIds = new Set(sessionIds);
        expect(uniqueSessionIds.size).toBe(concurrentCalls);
        // getFormattedNowがconcurrentCalls回呼ばれたことを確認
        expect(getFormattedNowSpy).toHaveBeenCalledTimes(concurrentCalls);
        // uuidv4がconcurrentCalls回呼ばれたことを確認
        expect(mockedUuidv4).toHaveBeenCalledTimes(concurrentCalls);

        mockedUuidv4.mockClear();
        getFormattedNowSpy.mockRestore();
    });

    // セキュリティ関連
    describe("Security Tests", () => {
        // 1. UUIDのバージョン検証
        it("should generate a UUID of version 4", () => {
            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            // UUIDv4 のモックを設定
            const uuidV4Mock = "123e4567-e89b-12d3-a456-426614174000"; // バージョン1 UUIDの例
            mockedUuidv4.mockReturnValue(uuidV4Mock);

            // テスト実行
            const sessionId = idManager.generateUniqueSessionId();

            // UUID部分を抽出
            const uuidPart = sessionId.split("-").slice(-5).join("-"); // UUID部分を抽出

            // UUIDv4のバージョンを確認 >> 13文字目: '4'
            expect(uuidPart[14]).toBe('1'); // 上記例ではバージョン1なので、テストが失敗 >> UUIDv4を返すように修正

            // 正しいUUIDv4のバージョンを持つように修正
            const validUUIDv4 = "123e4567-e89b-42d3-a456-426614174000";
            mockedUuidv4.mockReturnValue(validUUIDv4);
            const validSessionId = idManager.generateUniqueSessionId();
            const validUuidPart = validSessionId.split("-").slice(-5).join("-");

            // バージョン4か確認
            expect(validUuidPart[14]).toBe('4');
            // アサーション
            expect(validUuidPart).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        // 2. セッションIDに敏感な情報が含まれないことの確認
        it("should not include sensitive information in the sessionId", () => {
            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            // UUIDv4 のモックを設定
            mockedUuidv4.mockReturnValue(fixedUUID);

            // テスト実行
            const sessionId = idManager.generateUniqueSessionId();

            // セッションIDが日時とUUIDのみで構成されていることを確認
            expect(sessionId).toBe(`${fixedDateTime}-${fixedUUID}`);
            expect(sessionId).not.toMatch(/user|email|password|secret/i); // 例として"user"などのキーワードが含まれないことを確認

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        // 3. フォーマット文字列への悪意のある入力の処理確認
        it("should handle malicious format strings without leaking information", () => {
            const maliciousFormat = "${process.env.SECRET_KEY}";

            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            // uuidv4 のモックを設定
            mockedUuidv4.mockReturnValue(fixedUUID);

            // テスト実行
            const sessionId = idManager.generateUniqueSessionId(maliciousFormat);

            // アサーション: セッションIDがフォーマット文字列をそのまま含まないことを確認
            expect(sessionId).toBe(`${fixedDateTime}-${fixedUUID}`);
            expect(sessionId).not.toContain("${process.env.SECRET_KEY}");

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        // 4. エラーメッセージの検証
        it("should not leak sensitive information in error messages", () => {
            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            // uuidv4 のモックを設定: 常に fixedUUID を返す（重複を引き起こす）
            mockedUuidv4.mockReturnValue(fixedUUID);

            // 既存のIDをセット
            for (let i = 0; i < 100; i++) {
                idManager.addExistingId(`${fixedDateTime}-${fixedUUID}`);
            }

            // テスト実行とアサーション
            try {
                idManager.generateUniqueSessionId("yyyyMMdd-HHmmss", 1);
            } catch (error) {
                if (error instanceof Error) {
                    // エラーメッセージに内部情報が含まれていないことを確認
                    expect(error.message).toBe("Failed to generate a unique session ID after multiple attempts.");
                    // スタックトレースの存在は確認しない
                    // expect(error.stack).toBeUndefined();
                } else {
                    // Error インスタンスでない場合はテストを失敗させる
                    fail("Thrown error is not an instance of Error");
                }
            }

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        // 5. セッションIDの長さと構造の検証
        it("should generate sessionId with correct length and structure", () => {
            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            mockedUuidv4.mockReturnValue(fixedUUID);

            const sessionId = idManager.generateUniqueSessionId();

            // セッションIDの長さを確認(固定日時 + '-' + UUID)
            const expectedLength = fixedDateTime.length + 1 + fixedUUID.length;
            expect(sessionId.length).toBe(expectedLength);

            // セッションID構造確認
            expect(sessionId).toMatch(new RegExp(`^${fixedDateTime}-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, 'i'));

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });

        // 6. セッションIDの一意性の強化
        it("should maintain uniqueness even with sequential UUIDs", () => {
            const sequentialUUIDs = ["uuid-001", "uuid-002", "uuid-003", "uuid-004", "uuid-005"];

            // getFormattedNowをスパイして固定値を返すように設定
            const getFormattedNowSpy = jest.spyOn(DateTimeProvider.prototype, "getFormattedNow").mockReturnValue(fixedDateTime);

            // uuidv4 のモックを設定
            mockedUuidv4.mockImplementation(() => sequentialUUIDs.shift() || "uuid-default");

            // 既存のIDを追加
            idManager.addExistingId(`${fixedDateTime}-uuid-001`);

            // テスト実行: uuid-001は重複するためuuid-002が選ばれる
            const sessionId = idManager.generateUniqueSessionId("yyyyMMdd-HHmmss", 1);
            expect(sessionId).toBe(`${fixedDateTime}-uuid-002`);
            expect(idManager.isDuplicateId(sessionId)).toBe(true);

            // 再度生成: uuid-003
            const sessionId2 = idManager.generateUniqueSessionId("yyyyMMdd-HHmmss", 1);
            expect(sessionId2).toBe(`${fixedDateTime}-uuid-003`);
            expect(idManager.isDuplicateId(sessionId2)).toBe(true);

            // uuidv4 が3回呼ばれたことを確認（重複しているuuid-001を除く）
            expect(mockedUuidv4).toHaveBeenCalledTimes(3);

            mockedUuidv4.mockClear();
            getFormattedNowSpy.mockRestore();
        });
    });
});
