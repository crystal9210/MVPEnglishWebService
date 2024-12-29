/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import {
    IProblemRepository,
    ProblemFilters,
} from "@/interfaces/repositories/IProblemRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import { SERVICE_IDS } from "@/constants/serviceIds";
import { QUESTION_TYPES, QuestionType } from "@/constants/problemTypes";
import {
    WritingInputProblemSchema,
    GrammarMultipleChoiceProblemSchema,
    BasisProblemSchema,
    MultipleChoiceProblemSchema,
    InputProblemSchema,
    SortingProblemSchema,
    Problem,
    ProblemSchema,
} from "@/schemas/problemSchemas";
import { z } from "zod";
import { ProblemDifficultyLevel } from "@/constants/userStatisticTypes";

/**
 * serviceTypeMap:
 *   - Maps service IDs and question types to their respective Zod schemas.
 */
const serviceTypeMap: {
    [key in Problem["serviceId"]]?: {
        [key in QuestionType]?: z.ZodTypeAny;
    };
} = {
    [SERVICE_IDS.WRITING]: {
        [QUESTION_TYPES.INPUT]: WritingInputProblemSchema,
    },
    [SERVICE_IDS.GRAMMAR]: {
        [QUESTION_TYPES.MULTIPLE_CHOICE]: GrammarMultipleChoiceProblemSchema,
    },
    [SERVICE_IDS.BASIS]: {
        [QUESTION_TYPES.MULTIPLE_CHOICE]: BasisProblemSchema,
    },
};

/**
 * @injectable:
 *   - Marks the class for dependency injection.
 */
@injectable()
export class ProblemRepository implements IProblemRepository {
    private readonly problemsCollection: FirebaseFirestore.CollectionReference;

    /**
     * Constructor:
     *   - Injects FirebaseAdmin and LoggerService.
     *   - Initializes the Firestore collection reference.
     * @param firebaseAdmin - Instance of IFirebaseAdmin.
     * @param logger - Instance of ILoggerService.
     */
    constructor(
        @inject("IFirebaseAdmin")
        private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {
        this.problemsCollection = this.firebaseAdmin
            .getFirestore()
            .collection("problems");
    }

    /**
     * Retrieves the appropriate Zod schema based on service ID and question type.
     * @param serviceId - The service identifier.
     * @param questionType - The question type.
     * @returns The corresponding Zod schema or z.any() if not found.
     */
    private getServiceSpecificSchema(
        serviceId: string,
        questionType: QuestionType
    ): z.ZodTypeAny {
        const serviceSchemas =
            serviceTypeMap[serviceId as Problem["serviceId"]];
        if (serviceSchemas && serviceSchemas[questionType]) {
            return serviceSchemas[questionType];
        }

        const baseSchemaMap: {
            [key in QuestionType]?: z.ZodTypeAny;
        } = {
            [QUESTION_TYPES.MULTIPLE_CHOICE]: MultipleChoiceProblemSchema,
            [QUESTION_TYPES.INPUT]: InputProblemSchema,
            [QUESTION_TYPES.SORTING]: SortingProblemSchema,
        };

        return baseSchemaMap[questionType] ?? z.any();
    }

    /**
     * Validates and parses problem data using the appropriate schema.
     * @param serviceId - The service identifier.
     * @param questionType - The question type.
     * @param data - The raw problem data.
     * @returns The validated Problem object or null if validation fails.
     */
    private validateProblemData(
        serviceId: string,
        questionType: QuestionType,
        data: unknown
    ): Problem | null {
        try {
            const schema = this.getServiceSpecificSchema(
                serviceId,
                questionType
            );
            return schema.parse(data) as Problem; // 型キャスト
        } catch (error) {
            this.logger.error("Problem validation failed", {
                error,
                serviceId,
                questionType,
                data,
            });
            return null;
        }
    }

    /**
     * Retrieves a problem by its ID.
     * @param serviceId - The service identifier.
     * @param problemId - The problem identifier.
     * @param questionType - The type of the question.
     * @returns The matching Problem object or null if not found.
     */
    async getProblemById(
        serviceId: string,
        problemId: string,
        questionType: QuestionType
    ): Promise<Problem | null> {
        try {
            const docSnap = await this.problemsCollection.doc(problemId).get();

            if (!docSnap.exists) {
                return null;
            }

            const data = docSnap.data();
            return this.validateProblemData(serviceId, questionType, data);
        } catch (error) {
            this.logger.error("Failed to get problem", {
                error,
                serviceId,
                problemId,
                questionType,
            });
            throw error;
        }
    }

    /**
     * Finds problems with the specified filters.
     * @param serviceId - The service identifier.
     * @param questionType - The type of the questions.
     * @param filters - The filters to apply.
     * @returns An array of Problem objects matching the filters.
     */
    async findProblemsWithFilters(
        serviceId: string,
        questionType: QuestionType,
        filters: ProblemFilters
    ): Promise<Problem[]> {
        try {
            let query: FirebaseFirestore.Query = this.problemsCollection
                .where("serviceId", "==", serviceId)
                .where("questionType", "==", questionType);

            if (filters.categories?.length) {
                // Firestore 'in' query supports up to 10 elements
                const categories = filters.categories.slice(0, 10);
                query = query.where("categoryId", "in", categories);
            }
            if (filters.difficulties?.length) {
                const difficulties = filters.difficulties.slice(0, 10);
                query = query.where("difficulty", "in", difficulties);
            }
            if (filters.orderBy) {
                query = query.orderBy(
                    filters.orderBy.field,
                    filters.orderBy.direction
                );
            }
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            if (filters.startAfter) {
                query = query.startAfter(filters.startAfter);
            }

            const querySnap = await query.get();

            return querySnap.docs
                .map((doc) =>
                    this.validateProblemData(
                        serviceId,
                        questionType,
                        doc.data()
                    )
                )
                .filter((problem): problem is Problem => problem !== null);
        } catch (error) {
            this.logger.error("Failed to find problems", {
                error,
                serviceId,
                questionType,
                filters,
            });
            throw error;
        }
    }

    /**
     * Finds problems by service ID and difficulty level.
     * @param serviceId - The service identifier.
     * @param difficulty - The difficulty level.
     * @returns An array of Problem objects matching the criteria.
     */
    async findByServiceAndDifficulty(
        serviceId: string,
        difficulty: ProblemDifficultyLevel
    ): Promise<Problem[]> {
        try {
            const querySnap = await this.problemsCollection
                .where("serviceId", "==", serviceId)
                .where("difficulty", "==", difficulty)
                .get();

            return querySnap.docs
                .map((doc) => {
                    const data = doc.data();
                    const questionType = data.questionType as QuestionType;
                    return this.validateProblemData(
                        serviceId,
                        questionType,
                        data
                    );
                })
                .filter((problem): problem is Problem => problem !== null);
        } catch (error) {
            this.logger.error(
                "Failed to find problems by service and difficulty",
                {
                    error,
                    serviceId,
                    difficulty,
                }
            );
            throw error;
        }
    }

    /**
     * Retrieves all problems from the repository.
     * @returns An array of all Problem objects.
     */
    async getAllProblems(): Promise<Problem[]> {
        try {
            const querySnap = await this.problemsCollection.get();

            return querySnap.docs
                .map((doc) => {
                    const data = doc.data();
                    const serviceId = data.serviceId as string;
                    const questionType = data.questionType as QuestionType;
                    return this.validateProblemData(
                        serviceId,
                        questionType,
                        data
                    );
                })
                .filter((problem): problem is Problem => problem !== null);
        } catch (error) {
            this.logger.error("Failed to retrieve all problems", { error });
            throw error;
        }
    }

    /**
     * Adds a new problem to the repository.
     * @param problem - The Problem object to add.
     */
    async addProblem(problem: Problem): Promise<void> {
        try {
            // Validate the problem data before adding
            const validatedProblem = ProblemSchema.parse(problem);

            await this.problemsCollection
                .doc(validatedProblem.id)
                .set(validatedProblem);
            this.logger.info("Problem added successfully", {
                problemId: validatedProblem.id,
            });
        } catch (error) {
            this.logger.error("Failed to add problem", { error, problem });
            throw error;
        }
    }
}
