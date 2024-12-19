import { z } from "zod";
import { ServiceIdEnum } from "@/constants/serviceIds";

// 問題セット内の個々の問題を表すスキーマ
// TODO 詳細の扱い
const ProblemInSetSchema = z.object({
  problemId: z.string(),
  serviceId: ServiceIdEnum,
  categoryId: z.string().default("x"), // i.e. this field is optional
  stepId: z.string().default("x"), // i.e. this field is optional
});

// 問題セットを表すスキーマ
// 柔軟性を持たせるため、タグ付け機能などを実装したい、またストアは分離する設計
export const CustomProblemSetSchema = z.object({
  problemSetId: z.string(),
  problemSetName: z.string(), // 問題セットの名称を設定可能にする - UX向上
  description: z.string().default(""), // 問題セットの説明(任意)
  problems: z.array(ProblemInSetSchema), // 問題セットに含まれる問題の配列
  createdAt: z.date().default(()=>new Date()),
  updatedAt: z.date().default(()=>new Date()),
});

// 複数問題セットを一括で扱うスキーマ - 一括で取得して表示する場合など
export const CustomProblemSetsSchema = z.array(CustomProblemSetSchema);

export type CustomProblemSet = z.infer<typeof CustomProblemSetSchema>;
export type CustomProblemSets = z.infer<typeof CustomProblemSetsSchema>;
