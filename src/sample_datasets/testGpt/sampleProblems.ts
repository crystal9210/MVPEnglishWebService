export type SampleProblem = {
    id: string;
    number: number;
    title: string;
    description?: string;
    text: string;
};

export const sampleProblems: SampleProblem[] = [
    {
        id: "1",
        number: 1,
        title: "Capital of France",
        description: "Basic geography question.",
        text: "What is the capital of France?",
    },
    {
        id: "2",
        number: 2,
        title: "Largest Planet",
        description: "Astronomy question.",
        text: "Which is the largest planet in our solar system?",
    },
    {
        id: "3",
        number: 3,
        title: "Python Function",
        description: "Programming question.",
        text: "How do you define a function in Python?",
    },
    {
        id: "4",
        number: 4,
        title: "World War II",
        description: "History question.",
        text: "In which year did World War II end?",
    },
    {
        id: "5",
        number: 5,
        title: "Chemical Symbol",
        description: "Chemistry question.",
        text: "What is the chemical symbol for gold?",
    },
    {
        id: "6",
        number: 6,
        title: "Mathematical Constant",
        description: "Mathematics question.",
        text: "What is the value of Pi up to two decimal places?",
    },
];
