import { Criteria } from "@/schemas/goalSchemas";
import { PROGRESS_MODES } from "@/constants/sessions/sessions";

export function isIterationCriteria(criteria: Criteria): criteria is {
    mode: typeof PROGRESS_MODES.ITERATION;
    details: {
        problemSetIds: string[];
        requiredIterations: number;
    };
} {
    return criteria.mode === PROGRESS_MODES.ITERATION;
}

export function isScoreCriteria(criteria: Criteria): criteria is {
    mode: typeof PROGRESS_MODES.SCORE;
    details: {
        serviceId: string;
        categoryId: string;
        stepId: string;
        minimumScore: number;
    };
} {
    return criteria.mode === PROGRESS_MODES.SCORE;
}

export function isCountCriteria(criteria: Criteria): criteria is {
    mode: typeof PROGRESS_MODES.COUNT;
    details: {
        serviceId: string;
        categoryId: string;
        stepId: string;
        requiredCount: number;
    };
} {
    return criteria.mode === PROGRESS_MODES.COUNT;
}

export function isTimeCriteria(criteria: Criteria): criteria is {
    mode: typeof PROGRESS_MODES.TIME;
    details: {
        serviceId: string;
        categoryId: string;
        stepId: string;
        requiredTime: number;
    };
} {
    return criteria.mode === PROGRESS_MODES.TIME;
}
