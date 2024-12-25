import { Criteria, Goal, GoalSchema } from "@/schemas/goalSchemas";
import { GoalTermType, GoalStatus, PROGRESS_MODES } from "@/constants/sessions/sessions";
// import { isIterationCriteria, isCountCriteria, isScoreCriteria, isTimeCriteria } from "@/utils/typeGuards/criterias"; // 型ガードを導入してもいいかなとふと思ったけど必要なかった

export class GoalEntity implements Goal {
    id!: string;
    termType!: GoalTermType;
    criteria!: Criteria;
    targetProblems!: number;
    currentProgress!: number;
    createdAt!: Date;
    updatedAt!: Date;
    status!: GoalStatus;
    iterateCount?: number;
    completedIterations?: number;
    deadlines!: {
        reasonableDeadline: Date;
        bestDeadline: Date;
    };
    perPeriodTargets?: {
        enabled: boolean;
        period?: "daily" | "weekly";
        targetRate?: number;
    };

    constructor(data: Goal) {
        const parsed = GoalSchema.parse(data);
        // 明示的にプロパティを割り当て
        this.id = parsed.id;
        this.termType = parsed.termType;
        this.criteria = parsed.criteria;
        this.targetProblems = parsed.targetProblems;
        this.currentProgress = parsed.currentProgress;
        this.createdAt = parsed.createdAt;
        this.updatedAt = parsed.updatedAt;
        this.status = parsed.status;
        this.iterateCount = parsed.iterateCount;
        this.completedIterations = parsed.completedIterations;
        this.deadlines = parsed.deadlines;
        this.perPeriodTargets = parsed.perPeriodTargets;
    }

    markAsCompleted() {
        if (this.status === "active") {
            this.status = "good_clear";
            this.updatedAt = new Date();
        }
    }

    incrementProgress(amount: number) {
        this.currentProgress += amount;
        this.updatedAt = new Date();
        if (this.currentProgress >= this.targetProblems) {
            this.markAsCompleted();
        }
    }

    performCriteriaAction() {
        switch (this.criteria.mode) {
            case PROGRESS_MODES.ITERATION:
                this.handleIterationCriteria(this.criteria.details);
                break;
            case PROGRESS_MODES.SCORE:
                this.handleScoreCriteria(this.criteria.details);
                break;
            case PROGRESS_MODES.COUNT:
                this.handleCountCriteria(this.criteria.details);
                break;
            case PROGRESS_MODES.TIME:
                this.handleTimeCriteria(this.criteria.details);
                break;
            default:
                throw new Error(`Unsupported criteria mode. The criteria is: ${this.criteria}`);
        }
    }

    private handleIterationCriteria(details: {
        problemSetIds: string[];
        requiredIterations: number;
    }) {
        if (this.completedIterations && this.completedIterations >= details.requiredIterations) {
            this.markAsCompleted();
        }
    }

    private handleScoreCriteria(details: {
        serviceId: string;
        categoryId: string;
        stepId: string;
        minimumScore: number;
    }) {
        if (this.currentProgress >= details.minimumScore) {
            this.markAsCompleted();
        }
    }

    private handleCountCriteria(details: {
        serviceId: string;
        categoryId: string;
        stepId: string;
        requiredCount: number;
    }) {
        if (this.currentProgress >= details.requiredCount) {
            this.markAsCompleted();
        }
    }

    private handleTimeCriteria(details: {
        serviceId: string;
        categoryId: string;
        stepId: string;
        requiredTime: number;
    }) {
        if (this.currentProgress >= details.requiredTime) {
            this.markAsCompleted();
        }
    }
}
