import { NextRequest, NextResponse } from "next/server";
import { container } from "tsyringe";
import {
    PDFDocumentGenerator,
    PDFContentDefinition,
} from "@/domain/services/serverSide/pdfDocGeneratorService";
import {
    ServiceTypeProblem,
    ServiceTypeProblemSchema,
} from "@/schemas/problemSchemas";
import { QUESTION_TYPES } from "@/constants/problemTypes";
import { SERVICE_IDS } from "@/constants/serviceIds";
import { verifyJWT, User } from "@/utils/auth"; // 修正済みの auth.ts をインポート
import { z } from "zod";

/**
 * PDF生成APIエンドポイント
 * @param req NextRequest
 * @returns NextResponse
 */
export async function POST(req: NextRequest) {
    // 認証ヘッダーの検証
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json(
            { error: "Authorization header missing" },
            { status: 401 }
        );
    }

    const token = authHeader.split(" ")[1];
    const user: User | null = verifyJWT(token);
    if (!user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    try {
        // モックデータの準備
        const mockProblems: ServiceTypeProblem[] = [
            // Writing Input Problem
            {
                id: "1",
                questionType: QUESTION_TYPES.INPUT,
                serviceId: SERVICE_IDS.WRITING,
                categoryId: "category1",
                stepId: "step1",
                title: "次の文章を完成させてください。",
                description: "以下の文章を適切な形に完成させてください。",
                difficulty: 3,
                tags: ["文章作成", "基礎"],
                inputs: [
                    {
                        correctAnswer: "学校へ行きました",
                        tips: ["目的地は学校です"],
                        placeholder: "ここに入力してください",
                    },
                    {
                        correctAnswer: "友達と遊びました",
                        tips: ["目的は遊ぶことです"],
                        placeholder: "ここに入力してください",
                    },
                ],
            },
            // Grammar Multiple Choice Problem
            {
                id: "2",
                questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
                serviceId: SERVICE_IDS.GRAMMAR,
                categoryId: "category2",
                stepId: "step2",
                title: "正しい文法を選んでください。",
                description: "以下の文の中で正しいものを選んでください。",
                difficulty: 2,
                tags: ["文法", "中級"],
                problemText: "She go to school.",
                items: [
                    {
                        options: [
                            { text: "She go to school." },
                            { text: "She goes to school." },
                            { text: "She is going to school." },
                            { text: "She has gone to school." },
                        ],
                        correctAnswer: "She goes to school.",
                        tips: [
                            "主語が三人称単数の場合、動詞に -s がつきます。",
                        ],
                    },
                    {
                        options: [
                            { text: "He run fast." },
                            { text: "He runs fast." },
                            { text: "He is running fast." },
                            { text: "He ran fast." },
                        ],
                        correctAnswer: "He runs fast.",
                        tips: [
                            "主語が三人称単数の場合、動詞に -s がつきます。",
                        ],
                    },
                ],
            },
            // Basis Problem
            {
                id: "3",
                questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
                serviceId: SERVICE_IDS.BASIS,
                categoryId: "category3",
                stepId: "step3",
                title: "基礎的な単語を選んでください。",
                description: "以下の単語から正しいものを選んでください。",
                difficulty: 1,
                tags: ["基礎", "単語"],
                example: "これはリンゴです。",
                items: [
                    {
                        options: [
                            { text: "apple", images: ["./images/apple1.png"] },
                            {
                                text: "banana",
                                images: ["./images/banana1.png"],
                            },
                            {
                                text: "cherry",
                                images: ["./images/cherry1.png"],
                            },
                            { text: "date", images: ["./images/date1.png"] },
                        ],
                        correctAnswer: "apple",
                        tips: ["果物の一つです。"],
                    },
                ],
            },
        ];

        // スキーマによるバリデーション
        const ProblemsArraySchema = z.array(ServiceTypeProblemSchema);

        const validationResult = ProblemsArraySchema.safeParse(mockProblems);
        if (!validationResult.success) {
            console.error("Problem validation failed:", validationResult.error);
            return NextResponse.json(
                { error: "Invalid problem data" },
                { status: 400 }
            );
        }
        const validatedProblems = validationResult.data;

        const pdfContent: PDFContentDefinition = {
            title: "英語学習問題集",
            content: validatedProblems,
            defaultFont: "Helvetica",
            defaultFontSize: 12,
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
        };

        // PDF生成サービスの取得
        const pdfGenerator = container.resolve(PDFDocumentGenerator);
        const pdfBuffer = await pdfGenerator.generateProblemPDF(pdfContent);

        // レスポンス設定
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=problem_set.pdf",
            },
        });
    } catch (error) {
        console.error("PDF生成エラー:", error);
        return NextResponse.json(
            { error: "PDF生成に失敗しました。" },
            { status: 500 }
        );
    }
}
