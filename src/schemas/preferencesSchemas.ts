import { ProblemDifficultyLevel } from "@/constants/userStatisticTypes";
import { QuestionType } from "@/constants/problemTypes";
import { ServiceId } from "@/constants/serviceIds";

/**
 * Preferences:
 *   - ユーザーが指定する問題セット生成のための設定。
 */
export interface Preferences {
    serviceId: ServiceId;
    questionType: QuestionType;
    categories?: string[];
    difficulties?: ProblemDifficultyLevel[]; // >> for filtering function.
    problemLimit: number; // >> a limit of how many problems a user get.
    orderBy?: { field: string; direction: "asc" | "desc" };
}
