import PDFDocument from "pdfkit";
import { Problem } from "@/schemas/problemSchemas";
import { z } from "zod";
import { UserInput } from "@/schemas/activity/userInputSchemas";
import { ProblemMemo } from "@/schemas/activity/problemHistorySchemas";

export interface PDFContentDefinition {
    title: string;
    content: Problem[]; // 問題配列
    answers?: Record<string, string>; // 問題IDをキー、回答を値とするオブジェクト
    memos?: Record<string, string[]>; // 問題IDをキー、メモの配列を値とするオブジェクト
    defaultFont?: string;
    defaultFontSize?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
}

export class PDFDocumentGenerator {
    /**
     * generateProblemSetPDF:
     *   - Generates a PDF buffer for a custom problem set including problems, answers, and memos.
     */
    async generateProblemSetPDF(def: PDFContentDefinition): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const {
                title,
                content,
                answers = {},
                memos = {},
                defaultFont = "Helvetica",
                defaultFontSize = 12,
                margins = { top: 50, bottom: 50, left: 50, right: 50 },
            } = def;

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

                // 答えの追加
                if (answers[prob.id]) {
                    doc.fontSize(defaultFontSize).text(
                        `**Answer:** ${answers[prob.id]}`,
                        {
                            continued: false,
                            indent: 20,
                            align: "left",
                        }
                    );
                }

                // メモの追加
                if (memos[prob.id] && memos[prob.id].length > 0) {
                    doc.fontSize(defaultFontSize).text(`**Memos:**`, {
                        continued: false,
                        indent: 20,
                        align: "left",
                    });
                    memos[prob.id].forEach((memo, memoIdx) => {
                        doc.fontSize(defaultFontSize).text(
                            `${memoIdx + 1}. ${memo}`,
                            {
                                indent: 30,
                                align: "left",
                            }
                        );
                    });
                }

                doc.moveDown();
            });

            doc.end();
        });
    }
}
