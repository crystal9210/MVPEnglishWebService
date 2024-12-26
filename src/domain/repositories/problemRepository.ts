/* eslint-disable no-unused-vars */
import { injectable, inject } from "tsyringe";
import { IProblemRepository } from "@/interfaces/repositories/IProblemRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import { SERVICE_IDS } from "@/constants/serviceIds";
import { QUESTION_TYPES, QuestionType } from "@/constants/problemTypes";
import { WritingInputProblemSchema, GrammarMultipleChoiceProblemSchema, BasisProblemSchema, MultipleChoiceProblemSchema, InputProblemSchema, SortingProblemSchema, Problem } from "@/schemas/problemSchemas";
import { z } from "zod";

type ProblemFilters = {
    categories?: string[];
    difficulties?: string[];
    orderBy?: { field: string; direction: "asc" | "desc" };
    limit?: number;
    startAfter?: FirebaseFirestore.QueryDocumentSnapshot;
};

const serviceTypeMap: {
    [key in typeof SERVICE_IDS[keyof typeof SERVICE_IDS]]?: {
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

@injectable()
export class ProblemRepository implements IProblemRepository {
    private readonly problemsCollection: FirebaseFirestore.CollectionReference;

    constructor(
        @inject("IFirebaseAdmin") private readonly firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") private readonly logger: ILoggerService
    ) {
        this.problemsCollection = this.firebaseAdmin.getFirestore().collection("problems");
    }

    private getServiceSpecificSchema(serviceId: string, questionType: QuestionType): z.ZodTypeAny {
        const serviceSchemas = serviceTypeMap[serviceId as keyof typeof serviceTypeMap];
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

    private validateProblemData(serviceId: string, questionType: QuestionType, data: unknown): Problem | null {
        try {
        const schema = this.getServiceSpecificSchema(serviceId, questionType);
        return schema.parse(data) as Problem; // 型キャスト
        } catch (error) {
        this.logger.error("Problem validation failed", { error, serviceId, questionType, data });
        return null;
        }
    }

    async getProblemById(serviceId: string, problemId: string, questionType: QuestionType): Promise<Problem | null> {
        try {
        const docSnap = await this.problemsCollection
            .doc(problemId)
            .get();

        if (!docSnap.exists) {
            return null;
        }

        const data = docSnap.data();
        return this.validateProblemData(serviceId, questionType, data);
        } catch (error) {
        this.logger.error("Failed to get problem", { error, serviceId, problemId, questionType });
        throw error;
        }
    }

    async findProblemsWithFilters(
        serviceId: string,
        questionType: QuestionType,
        filters: ProblemFilters
    ): Promise<Problem[]> {
        try {
        let query = this.problemsCollection
            .where("serviceId", "==", serviceId)
            .where("questionType", "==", questionType);

        if (filters.categories?.length) {
            query = query.where("categoryId", "in", filters.categories);
        }
        if (filters.difficulties?.length) {
            query = query.where("difficulty", "in", filters.difficulties);
        }
        if (filters.orderBy) {
            query = query.orderBy(filters.orderBy.field, filters.orderBy.direction);
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }
        if (filters.startAfter) {
            query = query.startAfter(filters.startAfter);
        }

        const querySnap = await query.get();

        return querySnap.docs
            .map(doc => this.validateProblemData(serviceId, questionType, doc.data()))
            .filter((problem): problem is Problem => problem !== null);
        } catch (error) {
        this.logger.error("Failed to find problems", { error, serviceId, questionType, filters });
        throw error;
        }
    }
}
