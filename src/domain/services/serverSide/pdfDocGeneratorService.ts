import PDFDocument from "pdfkit";
import { Problem } from "@/schemas/problemSchemas";

/**
 * PDFContentDefinition:
 *   - Defines the content structure for generating PDFs.
 */
export interface PDFContentDefinition {
    title: string;
    content: Problem[]; // 問題配列
    defaultFont?: string;
    defaultFontSize?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
}

/**
 * Insights:
 *   - Represents the insights generated from user statistics for progress reports.
 */
export interface Insights {
    weakCategories: string[]; // ユーザーの弱点となっているカテゴリー
    trends: Record<string, string>; // パフォーマンストレンド（例: "最近の成績向上"）
    estimatedLevel: string; // 推定されるユーザーのレベル
    suggestedGoals: string[]; // ユーザーに提案する目標
    recommendedProblemSet: Problem[]; // 推奨される問題セット
}

/**
 * PDFDocumentGenerator:
 *   - Handles PDF generation for problem sets and progress reports.
 */
export class PDFDocumentGenerator {
    /**
     * generateProblemPDF: 問題集をPDF化する（グラフなし）
     */
    async generateProblemPDF(def: PDFContentDefinition): Promise<Buffer> {
        const {
            title,
            content,
            defaultFont = "Helvetica",
            defaultFontSize = 12,
            margins = { top: 50, bottom: 50, left: 50, right: 50 },
        } = def;

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margins });
            const chunks: Buffer[] = [];

            doc.on("data", (c) => chunks.push(c));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", (err) => reject(err));

            // Header
            doc.font(defaultFont)
                .fontSize(defaultFontSize + 4)
                .text(title, {
                    underline: true,
                    align: "center",
                });
            doc.moveDown();

            // Render problems
            content.forEach((prob, idx) => {
                doc.fontSize(defaultFontSize + 1).text(
                    `Q${idx + 1}: ${prob.title}`
                );
                if (prob.description) {
                    doc.fontSize(defaultFontSize).text(prob.description);
                }
                doc.moveDown();
            });

            doc.end();
        });
    }

    /**
     * generateStatsPDF: 統計を PDF 化 (グラフなし)
     */
    async generateStatsPDF(stats: any, title = "Statistics"): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];
            doc.on("data", (c) => chunks.push(c));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", (err) => reject(err));

            doc.fontSize(16).text(title, { align: "center" });
            doc.moveDown();

            // statsを適当に描画
            doc.fontSize(12).text(`Correct Rate: ${stats.correctRate}%`);
            // ... ここに stats の情報を文字で書くだけ

            doc.end();
        });
    }

    /**
     * generateProgressReportPDF: ユーザーの進捗レポートをPDF化する
     * @param insights - ユーザーの統計データから生成されたインサイト
     * @param title - PDFのタイトル
     * @returns PDFのバッファ
     */
    async generateProgressReportPDF(
        insights: Insights,
        title: string = "User Progress Report"
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];

            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", (err) => reject(err));

            // タイトル
            doc.fontSize(20).text(title, { align: "center", underline: true });
            doc.moveDown();

            // 推定レベル
            doc.fontSize(14).text(
                `Estimated Level: ${insights.estimatedLevel}`
            );
            doc.moveDown();

            // ユーザーの弱点
            doc.fontSize(14).text("Areas of Weakness:");
            if (insights.weakCategories.length > 0) {
                doc.fontSize(12).list(insights.weakCategories);
            } else {
                doc.fontSize(12).text("None");
            }
            doc.moveDown();

            // パフォーマンストレンド
            doc.fontSize(14).text("Performance Trends:");
            if (Object.keys(insights.trends).length > 0) {
                Object.entries(insights.trends).forEach(([key, value]) => {
                    doc.fontSize(12).text(`${key}: ${value}`);
                });
            } else {
                doc.fontSize(12).text("No trends available.");
            }
            doc.moveDown();

            // 提案された目標
            doc.fontSize(14).text("Suggested Goals:");
            if (insights.suggestedGoals.length > 0) {
                doc.fontSize(12).list(insights.suggestedGoals);
            } else {
                doc.fontSize(12).text("No goals suggested.");
            }
            doc.moveDown();

            // 推奨問題セット
            doc.fontSize(14).text("Recommended Problem Set:");
            if (insights.recommendedProblemSet.length > 0) {
                insights.recommendedProblemSet.forEach((problem, idx) => {
                    doc.fontSize(12).text(`${idx + 1}. ${problem.title}`);
                    if (problem.description) {
                        doc.text(problem.description);
                    }
                    doc.moveDown();
                });
            } else {
                doc.fontSize(12).text("No problems recommended.");
            }

            doc.end();
        });
    }
}
