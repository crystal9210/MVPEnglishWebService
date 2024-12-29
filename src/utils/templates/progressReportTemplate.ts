import {
    Insights,
    PDFDocumentGenerator,
} from "@/domain/services/serverSide/pdfDocGeneratorService";

/**
 * generateProgressReport:
 *   - Generates a PDF buffer for the user's progress report.
 * @param insights - Insights generated from user statistics.
 * @param title - Title of the PDF.
 * @returns PDF buffer.
 */
export const generateProgressReport = async (
    insights: Insights,
    title: string = "User Progress Report"
): Promise<Buffer> => {
    const generator = new PDFDocumentGenerator();
    return await generator.generateProgressReportPDF(insights, title);
};
