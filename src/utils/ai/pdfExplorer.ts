// TODO
import PDFDocument from "pdfkit";
import { generateGraphImage } from "@/utils/ai/graphRenderer";

/**
 * Export a custom problem set to a PDF file.
 * @param problems - The problem set to include in the PDF.
 * @param filename - The name of the output PDF file.
 */
export const exportProblemSetToPDF = (problems: Problem[], filename: string) => {
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filename));

  doc.fontSize(16).text("Custom Problem Set", { align: "center" });
  doc.moveDown();

  problems.forEach((problem, index) => {
    doc.fontSize(12).text(`${index + 1}. ${problem.title}`);
    if (problem.description) doc.text(problem.description);
    doc.moveDown();
  });

  doc.end();
};

/**
 * Export user statistics to a PDF file with graphs.
 * @param stats - The user statistics to include.
 * @param filename - The name of the output PDF file.
 */
export const exportStatisticsToPDF = async (stats: SessionStatistics, filename: string) => {
  const doc = new PDFDocument();
  const graphImage = await generateGraphImage(stats);

  doc.pipe(fs.createWriteStream(filename));

  doc.fontSize(16).text("User Statistics", { align: "center" });
  doc.moveDown();

  doc.image(graphImage, { fit: [500, 400], align: "center" });

  doc.end();
};
