import { Problem } from "@/schemas/problemSchemas";
import {
    PDFDocumentGenerator,
    PDFContentDefinition,
} from "@/domain/services/serverSide/pdfDocGeneratorService";

/**
 * generateManualProblemSetPDF:
 *   - Generates a PDF buffer for a manually customized problem set.
 * @param problems - Array of selected problems.
 * @param title - Title of the PDF.
 * @returns PDF buffer.
 */
export const generateManualProblemSetPDF = async (
    problems: Problem[],
    title: string = "Manual Problem Set"
): Promise<Buffer> => {
    const generator = new PDFDocumentGenerator();
    const contentDef: PDFContentDefinition = {
        title,
        content: problems,
        defaultFont: "Helvetica",
        defaultFontSize: 12,
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
    };
    return await generator.generateProblemPDF(contentDef);
};
