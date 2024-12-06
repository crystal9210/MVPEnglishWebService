import type { Problem } from "@/schemas/problemSchemas";

export interface IProblemService {
    getProblemById(serviceId: string, problemId: string): Promise<Problem | null>;

    getProblemsByCategory(
        serviceId: string,
        category: string,
        limit?: number,
        random?: boolean
    ): Promise<Problem[]>;

    getProblemsByDifficulty(
        serviceId: string,
        difficulty: string,
        limit?: number,
        random?: boolean
    ): Promise<Problem[]>;

    getAllProblems(
        serviceId: string,
        limit?: number,
        random?: boolean
    ): Promise<Problem[]>;

    /**
     * 複数カテゴリから、それぞれlimit数取得
     * randomがtrueならランダムサンプリング
     */
    getProblemsByCategories(
        serviceId: string,
        categoryRequests: {category: string; limit: number}[],
        random?: boolean
    ): Promise<Problem[]>;

    /**
     * 複数難易度から、それぞれlimit数取得
     */
    getProblemsByDifficulties(
        serviceId: string,
        difficultyRequests: {difficulty: string; limit: number}[],
        random?: boolean
    ): Promise<Problem[]>;

    /**
     * 柔軟なフィルタリング
     * categories, difficulties, limit, randomを指定可能
     */
    getProblemsWithFilters(
        serviceId: string,
        options: {
            categories?: string[];
            difficulties?: string[];
            limit?: number;
            random?: boolean;
        }
    ): Promise<Problem[]>;
}
