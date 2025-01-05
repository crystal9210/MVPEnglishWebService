import { z } from "zod";

export const EmbeddingDocSchema = z.object({
    id: z.string(),
    text: z.string(),
    embedding: z.array(z.number()),
});

export type EmbeddingDoc = z.infer<typeof EmbeddingDocSchema>;
