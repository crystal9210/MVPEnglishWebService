// TODO
import PDFDocument from "pdfkit";
import { Problem } from "@/schemas/problemSchemas";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { createReadStream } from "fs";

export interface PDFContentDefinition {
    title: string;
    content: Problem[]; // ここでは例として問題配列
    defaultFont?: string;
    defaultFontSize?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
}

export class PDFDocumentGenerator {
    /**
     * generateProblemPDF: 問題集をPDF化する
     */
    async generateProblemPDF(def: PDFContentDefinition): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const {
                title,
                content,
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
                doc.moveDown();
            });

            doc.end();
        });
    }

    /**
     * generateStatsPDF: 統計やグラフをPDF化する例
     */
    async generateStatsPDF(
        stats: any,
        chartData: any,
        title = "Statistics"
    ): Promise<Buffer> {
        // 1. グラフを生成
        const chartCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });
        const chartBuffer = await chartCanvas.renderToBuffer(chartData);

        // 2. PDFに埋め込み
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];
            doc.on("data", (c) => chunks.push(c));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", (err) => reject(err));

            doc.fontSize(16).text(title, { align: "center" });
            doc.moveDown();

            doc.image(chartBuffer, { fit: [500, 300], align: "center" });
            doc.moveDown();

            // statsを適当に描画
            doc.fontSize(12).text(`CorrectRate: ${stats.correctRate}%`);
            // ... etc

            doc.end();
        });
    }
}
