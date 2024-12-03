import { z } from "zod";

export const ContentPartSchema = z.object({
    type: z.enum(["text", "blank"]),
    value: z.string().optional(),
    correctAnswer: z.string().optional(),
    tips: z.string().optional(),
})

export const WritingExerciseSchema =z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    content: z.array(ContentPartSchema),
});

export type ContentType = z.infer<typeof ContentPartSchema>;
export type WritingExercise = z.infer<typeof WritingExerciseSchema>;
