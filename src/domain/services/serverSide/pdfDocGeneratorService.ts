import { Problem } from "@/schemas/problemSchemas";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a CommonJS require function
const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit");

/**
 * Interface defining the structure of the PDF content.
 */
export interface PDFContentDefinition {
    title: string;
    content: Problem[]; // Array of problems
    answers?: Record<string, string>; // Mapping of problem ID to answers
    memos?: Record<string, string[]>; // Mapping of problem ID to memos
    defaultFont?: string;
    defaultFontSize?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
}

/**
 * PDFDocumentGenerator class responsible for generating PDFs.
 */
export class PDFDocumentGenerator {
    /**
     * Generates a PDF buffer for a custom problem set including problems, answers, and memos.
     *
     * @param def - Definition of the PDF content
     * @returns PDF buffer
     */
    async generateProblemSetPDF(def: PDFContentDefinition): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const {
                    title,
                    content,
                    answers = {},
                    memos = {},
                    defaultFont = "Roboto", // Use custom font
                    defaultFontSize = 12,
                    margins = { top: 50, bottom: 50, left: 50, right: 50 },
                } = def;

                const doc = new PDFDocument({ margins });
                const chunks: Buffer[] = [];

                // Collect PDF data into chunks
                doc.on("data", (chunk) => chunks.push(chunk));
                doc.on("end", () => resolve(Buffer.concat(chunks)));
                doc.on("error", (err) => reject(err));

                // Register and use custom font
                const fontPath = path.join(
                    process.cwd(),
                    "public",
                    "fonts",
                    `${defaultFont}-Regular.ttf`
                );

                console.log("Registering font at:", fontPath);

                // Check if the font file exists
                if (!fs.existsSync(fontPath)) {
                    throw new Error(
                        `Font file does not exist at path: ${fontPath}`
                    );
                }

                // Register the custom font
                doc.registerFont(defaultFont, fontPath);
                doc.font(defaultFont);

                // Header section
                doc.fontSize(defaultFontSize + 4).text(title, {
                    underline: true,
                    align: "center",
                });
                doc.moveDown();

                // Render each problem
                content.forEach((prob, idx) => {
                    // Problem title
                    doc.fontSize(defaultFontSize + 1).text(
                        `Q${idx + 1}: ${prob.title}`
                    );

                    // Problem description
                    if (prob.description) {
                        doc.fontSize(defaultFontSize).text(prob.description);
                    }

                    // Answer section
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

                    // Memos section
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

                // Finalize PDF file
                doc.end();
            } catch (error) {
                console.error("Error generating PDF:", error);
                reject(error);
            }
        });
    }

    /**
     * Generates a combined PDF buffer with problems on the first section and answers & memos following the problems.
     * Automatically adds new pages as needed.
     *
     * @param def - Definition of the PDF content
     * @returns Combined PDF buffer
     */
    async generateCombinedPDF(def: PDFContentDefinition): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const {
                    title,
                    content,
                    answers = {},
                    memos = {},
                    defaultFont = "Roboto", // Use custom font
                    defaultFontSize = 12,
                    margins = { top: 50, bottom: 50, left: 50, right: 50 },
                } = def;

                const doc = new PDFDocument({ margins, autoFirstPage: false });
                const chunks: Buffer[] = [];

                // Collect PDF data into chunks
                doc.on("data", (chunk) => chunks.push(chunk));
                doc.on("end", () => resolve(Buffer.concat(chunks)));
                doc.on("error", (err) => reject(err));

                // Register and use custom font
                const fontPath = path.join(
                    process.cwd(),
                    "public",
                    "fonts",
                    `${defaultFont}-Regular.ttf`
                );

                console.log("Registering font at:", fontPath);

                // Check if the font file exists
                if (!fs.existsSync(fontPath)) {
                    throw new Error(
                        `Font file does not exist at path: ${fontPath}`
                    );
                }

                // Register the custom font
                doc.registerFont(defaultFont, fontPath);
                doc.font(defaultFont);

                // Add the first page for Problems
                doc.addPage();
                // Header for Problems
                doc.fontSize(defaultFontSize + 4).text(title, {
                    underline: true,
                    align: "center",
                });
                doc.moveDown();

                // Render each problem
                content.forEach((prob, idx) => {
                    // Problem title
                    doc.fontSize(defaultFontSize + 1).text(
                        `Q${idx + 1}: ${prob.title}`
                    );

                    // Problem description
                    if (prob.description) {
                        doc.fontSize(defaultFontSize).text(prob.description);
                    }

                    doc.moveDown();
                });

                // Add a new page for Answers & Memos
                doc.addPage();
                // Header for Answers & Memos
                doc.fontSize(defaultFontSize + 4).text("Answers and Memos", {
                    underline: true,
                    align: "center",
                });
                doc.moveDown();

                // Render answers and memos
                content.forEach((prob, idx) => {
                    // Problem title for reference
                    doc.fontSize(defaultFontSize + 1).text(
                        `Q${idx + 1}: ${prob.title}`
                    );

                    // Answer section
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

                    // Memos section
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

                // Finalize PDF file
                doc.end();
            } catch (error) {
                console.error("Error generating PDF:", error);
                reject(error);
            }
        });
    }
}
