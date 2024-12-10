
import { IProblemSet } from "@/schemas/activity/clientSide/problemSetSchema";

export const mockProblemSets: IProblemSet[] = [
    {
        serviceId: "service1",
        categoryId: "category1",
        stepId: "step1",
        goal: "短期目標",
        problems: [
            {
                problemId: "problem1",
                question: "What is the past tense of 'go'?",
                correctAnswer: "went",
            },
            {
                problemId: "problem2",
                question: "What is the plural of 'child'?",
                correctAnswer: "children",
            },
        ],
    },
    {
        serviceId: "service2",
        categoryId: "category2",
        stepId: "step1",
        goal: "中期目標",
        problems: [
            {
                problemId: "problem1",
                question: "What is the synonym of 'happy'?",
                correctAnswer: "joyful",
            },
            {
                problemId: "problem2",
                question: "What is the antonym of 'cold'?",
                correctAnswer: "hot",
            },
        ],
    },
    {
        serviceId: "service3",
        categoryId: "category3",
        stepId: "step1",
        goal: "長期目標",
        problems: [
            {
                problemId: "problem1",
                question: "What is the capital of France?",
                correctAnswer: "Paris",
            },
            {
                problemId: "problem2",
                question: "Who wrote '1984'?",
                correctAnswer: "George Orwell",
            },
        ],
    },
];
