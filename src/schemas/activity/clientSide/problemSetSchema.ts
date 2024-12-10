import { z } from "zod";

// TODO ProblemSchemaをserviceIdと一対一対応で柔軟に切り替えられるように実装、そしてその切り替えの軸となるフィールド：serviceId(仮)ー＞serviceId, categoryId(optional)を軸にマネージャがUI遷移およびアダプタなどのカスタム処理があれば切り分け
const ProblemSchema = z.object({
        problemId: z.string(),
        question: z.string(),
        correctAnswer: z.string(),
});

export const ProblemSetSchema = z.object({
    serviceId: z.string(),
    categoryId: z.string().optional(),
    stepId: z.string().optional(),
    goal: z.string(),
    problems: z.array(ProblemSchema), // TODO ProblemSchema汎用化
});


export type IProblemSet = z.infer<typeof ProblemSetSchema>;
