import { z } from "zod";
import { ProblemResultTypeEnum } from "@/constants/problemTypes";
import { DateSchema } from "../utils/dates";
import { integerNonNegative } from "../utils/numbers";

/**
 * The schema for managing 'an' input to a problem from the user.
 *  - maintain user's input for each question's input section
 *  - maintains correct or incorrect info and time spent while answering the question's section.
 */
export const UserInputSchema = z.object({
    input: z.array(
        z.object({
            value: z.string().default(""), // >> some problems have discriminated input format.
            isCorrect: z.boolean(),
            timeSpent: integerNonNegative(),
        })
    ),
    result: ProblemResultTypeEnum,
    attemptedAt: DateSchema,
});

export type UserInput = z.infer<typeof UserInputSchema>;

// TODO implementation of the input schemas for another inputs field form like boolean, number, etc.
