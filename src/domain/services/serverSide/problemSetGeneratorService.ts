// TODO
import { ProblemRepository } from "@/domain/repositories/problemRepository";
import { StatisticsRepository } from "@/domain/repositories/statisticsRepository";
import { Problem, ProblemSchema } from "@/schemas/problemSchemas";
import { ProblemDifficultyLevelEnum } from "@/constants/userStatisticTypes";

/**
 * 自動問題セット生成
 */
export class ProblemSetGeneratorService {
  constructor(
    private problemRepo: ProblemRepository,
    private statsRepo: StatisticsRepository
  ) {}

  async generateProblemSet(
    userId: string,
    serviceId: string,
    difficulty: string,
    limit: number
  ): Promise<Problem[]> {
    // 1. ユーザ統計取得
    const userStats = await this.statsRepo.getUserStats(userId);

    // 2. DBから該当問題を取得
    const candidateProblems = await this.problemRepo.findByServiceAndDifficulty(
      serviceId,
      difficulty as ProblemDifficultyLevelEnum
    );

    // 3. 苦手度合いが高い順にsort
    candidateProblems.sort((a, b) => {
      const rateA = userStats.problemCorrectRates[a.id] ?? 100;
      const rateB = userStats.problemCorrectRates[b.id] ?? 100;
      return rateA - rateB; // correctRate低い順=苦手度が高い
    });

    // 4. slice limit
    const selected = candidateProblems.slice(0, limit);
    // 5. Zod parse
    return selected.map(p => ProblemSchema.parse(p));
  }
}
