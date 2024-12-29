import { injectable, inject } from "tsyringe";
import type { SessionStatistics } from "@/schemas/statisticSchemas"; // 'import type' に変更
import type { Preferences } from "@/schemas/preferencesSchemas"; // 'import type' に変更
import type { IProblemRepository } from "@/interfaces/repositories/IProblemRepository"; // 'import type' に変更
import { Problem } from "@/schemas/problemSchemas";
import { z } from "zod";

/**
 * ProblemSetGeneratorService:
 *   - Generates problem sets based on user statistics and preferences.
 */
@injectable()
export class ProblemSetGeneratorService {
    /**
     * Constructor:
     *   - Injects IProblemRepository.
     * @param problemRepo - Instance of IProblemRepository.
     */
    constructor(
        @inject("IProblemRepository") private problemRepo: IProblemRepository
    ) {}

    /**
     * generate:
     *   - Generates a problem set based on user statistics and preferences.
     * @param userStats - The user's historical performance data.
     * @param preferences - User-specified settings such as difficulty, categories, etc.
     * @returns A generated problem set.
     */
    async generate(
        userStats: SessionStatistics,
        preferences: Preferences
    ): Promise<Problem[]> {
        try {
            // 1. フィルタに基づく問題の取得
            const candidateProblems =
                await this.problemRepo.findProblemsWithFilters(
                    preferences.serviceId,
                    preferences.questionType,
                    {
                        categories: preferences.categories,
                        difficulties: preferences.difficulties,
                        limit: preferences.problemLimit,
                        orderBy: preferences.orderBy,
                    }
                );

            // 2. 苦手度合いが高い順にソート
            candidateProblems.sort((a, b) => {
                const rateA = userStats.problemCorrectRates[a.id] ?? 100;
                const rateB = userStats.problemCorrectRates[b.id] ?? 100;
                return rateA - rateB; // correctRateが低い順=苦手度が高い
            });

            // 3. 先頭からlimit分を選択
            const selected = candidateProblems.slice(
                0,
                preferences.problemLimit
            );

            // 4. Zodによるバリデーション
            const validProblems = selected
                .map((p) => {
                    try {
                        return z
                            .object({
                                id: z.string(),
                                questionType: z.string(),
                                serviceId: z.string(),
                                categoryId: z.string(),
                                stepId: z.string(),
                                title: z.string(),
                                choices: z.array(z.any()), // 具体的なスキーマに置き換えることを推奨
                                difficulty: z.number().int().min(1).max(5), // 数値型に修正
                                tags: z.array(z.string()),
                                description: z.string().optional(),
                            })
                            .parse(p) as Problem;
                    } catch (error) {
                        // エラーハンドリング（例: ロギング）
                        console.error(
                            `Problem validation failed for ID ${p.id}:`,
                            error
                        );
                        return null;
                    }
                })
                .filter((p): p is Problem => p !== null);

            return validProblems;
        } catch (error) {
            // エラーハンドリング
            console.error("Failed to generate problem set:", error);
            throw new Error(
                `ProblemSetGeneratorService generate failed: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }
}
