import { container } from "tsyringe";
import { ILLMService } from "@/interfaces/services/ILLMService";
import { IRAGService } from "@/interfaces/services/IRAGService";
import { ServiceTypeProblem } from "@/schemas/problemSchemas";
import { EmbeddingDoc } from "@/schemas/embeddingSchemas";
import { sampleProblems } from "@/app/dev/testGpt/page";
import { IEmbeddingRepository } from "@/interfaces/repositories/IEmbeddingRepository";

/**
 * Converts a ServiceTypeProblem to an EmbeddingDoc.
 * @param problem The problem to convert.
 * @returns The corresponding EmbeddingDoc.
 */
const problemToEmbeddingDoc = (problem: ServiceTypeProblem): EmbeddingDoc => ({
    id: problem.id,
    // TODO field handling
    text: problem.problemText || problem.inputs?.[0]?.correctAnswer || "",
    embedding: [],
});

/**
 * Retrieves embedding documents for all sample problems.
 * @returns An array of EmbeddingDoc.
 */
const getEmbeddingDocs = (): EmbeddingDoc[] => {
    return sampleProblems.map(problemToEmbeddingDoc);
};

/**
 * Retrieves a problem by its ID.
 * @param problemId The ID of the problem.
 * @returns The corresponding problem or undefined if not found.
 */
const getProblemById = (problemId: string): ServiceTypeProblem | undefined => {
    return sampleProblems.find((problem) => problem.id === problemId);
};

/**
 * Generates embeddings for all sample problems.
 */
const initializeEmbeddings = async (
    llmService: ILLMService,
    embeddingRepo: IEmbeddingRepository
) => {
    const embeddingDocs: EmbeddingDoc[] = getEmbeddingDocs();

    for (const embeddingDoc of embeddingDocs) {
        const problem = getProblemById(embeddingDoc.id);
        if (!problem) {
            console.warn(`Problem ID ${embeddingDoc.id} not found.`);
            continue;
        }

        let textToEmbed = "";
        if ("problemText" in problem && problem.problemText) {
            textToEmbed = problem.problemText;
        } else if ("inputs" in problem && problem.inputs.length > 0) {
            textToEmbed = problem.inputs[0].correctAnswer;
        } else {
            console.warn(`Problem ID ${problem.id} has no text for embedding.`);
            continue;
        }

        try {
            const embedding = await llmService.getEmbedding(textToEmbed);
            embeddingDoc.embedding = embedding;
            embeddingRepo.updateEmbedding(problem.id, embedding);
        } catch (error) {
            console.error(
                `Failed to get embedding for Problem ID ${problem.id}:`,
                error
            );
        }
    }

    console.log("Embeddings initialized for all sample problems.");
};

/**
 * Service Layer Instance Creation
 */
const llmService = container.resolve<ILLMService>("ILLMService");
const ragService = container.resolve<IRAGService>("IRAGService");
const embeddingRepo = container.resolve<IEmbeddingRepository>(
    "IEmbeddingRepository"
);

/**
 * Initialize embeddings upon service layer setup.
 */
initializeEmbeddings(llmService, embeddingRepo).catch((error) => {
    console.error("Failed to initialize embeddings:", error);
});

export { llmService, ragService, getEmbeddingDocs, getProblemById };
