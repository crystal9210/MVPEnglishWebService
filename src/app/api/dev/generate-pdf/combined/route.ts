import { NextResponse } from "next/server";
import { PDFDocumentGenerator } from "@/domain/services/serverSide/pdfDocGeneratorService";
import { ProblemSchema } from "@/schemas/problemSchemas";
import { z } from "zod";

/**
 * Schema for validating the request body.
 */
const GenerateCombinedPDFRequestSchema = z.object({
    title: z.string().min(1, "Title is required."),
    problems: z
        .array(z.lazy(() => ProblemSchema))
        .min(1, "At least one problem is required."),
    answers: z.record(z.string(), z.string()).optional(),
    memos: z.record(z.string(), z.array(z.string())).optional(),
});

/**
 * Type inferred from the request body schema.
 */
type GenerateCombinedPDFRequestBody = z.infer<
    typeof GenerateCombinedPDFRequestSchema
>;

/**
 * Handler for POST requests to generate a Combined PDF.
 *
 * - Receives problems, answers, and memos from the request body.
 * - Generates a Combined PDF using PDFDocumentGenerator.
 * - Returns the PDF as a downloadable file.
 *
 * @param request - Incoming request object
 * @returns Response with the generated PDF or an error message
 */
export async function POST(request: Request) {
    try {
        // Parse and validate the request body
        const body: GenerateCombinedPDFRequestBody = await request.json();
        const parsedBody = GenerateCombinedPDFRequestSchema.safeParse(body);

        if (!parsedBody.success) {
            // If validation fails, return a 400 error with validation messages
            const validationErrors = parsedBody.error.errors
                .map((e) => e.message)
                .join(", ");
            return NextResponse.json(
                { error: validationErrors },
                { status: 400 }
            );
        }

        const { title, problems, answers = {}, memos = {} } = parsedBody.data;

        // Initialize the PDF generator
        const generator = new PDFDocumentGenerator();
        const pdfBuffer = await generator.generateCombinedPDF({
            title: title || "Combined Problem Set",
            content: problems,
            answers,
            memos,
        });

        // Return the PDF buffer as a downloadable file
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${title}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error generating Combined PDF:", error);
        // Return a 500 error if PDF generation fails
        return NextResponse.json(
            { error: "Failed to generate PDF." },
            { status: 500 }
        );
    }
}
