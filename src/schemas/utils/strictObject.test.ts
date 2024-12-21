import { z } from "zod";
import { partiallyStrictObject } from "./strictObject";
describe("partiallyStrictObject", () => {
    const schema = {
        name: z.string(),
        age: z.number(),
        isActive: z.boolean(),
    };

    it("should validate strict fields and allow flexible fields", () => {
        const strictFields: { name: true } = { name: true }; // 型を明示
        const mySchema = partiallyStrictObject(schema, strictFields);

        // 成功ケース: name は必須、age と isActive は任意
        expect(() => mySchema.parse({ name: "John", age: 30, isActive: true })).not.toThrow();

        // エラーケース: strictFields に指定された name が不足
        expect(() => mySchema.parse({ age: 30, isActive: true })).toThrow();

        // 成功ケース: name のみ指定（柔軟フィールドが省略可能）
        expect(() => mySchema.parse({ name: "John" })).not.toThrow();
    });

    it("should validate multiple strict fields", () => {
        const strictFields: { name: true; age: true } = { name: true, age: true }; // 型を明示
        const mySchema = partiallyStrictObject(schema, strictFields);

        // 成功ケース: name と age は必須
        expect(() => mySchema.parse({ name: "John", age: 30 })).not.toThrow();

        // エラーケース: age が不足
        expect(() => mySchema.parse({ name: "John" })).toThrow();
    });

    it("should allow extra fields in flexible schema", () => {
        const strictFields: { name: true } = { name: true }; // 型を明示
        const mySchema = partiallyStrictObject(schema, strictFields);

        // 成功ケース: 柔軟フィールド以外のプロパティを追加
        expect(() => mySchema.parse({ name: "John", age: 30, isActive: true, extra: "value" })).not.toThrow();
    });

    it("should disallow missing strict fields", () => {
        const strictFields: { name: true; age: true } = { name: true, age: true }; // 型を明示
        const mySchema = partiallyStrictObject(schema, strictFields);

        // エラーケース: name と age が不足
        expect(() => mySchema.parse({ isActive: true })).toThrow();
    });

    it("should handle empty strictFields", () => {
        const strictFields: Record<string, true> = {}; // 型を明示
        const mySchema = partiallyStrictObject(schema, strictFields);

        // 成功ケース: すべてのフィールドが柔軟
        expect(() => mySchema.parse({ name: "John", age: 30, isActive: true })).not.toThrow();
        expect(() => mySchema.parse({})).not.toThrow();
    });
});
