import { z } from "zod";

export const authRequestSchema = z.object({
    email: z.string().email("Invalid email address."),
    processType: z.enum(["signIn", "register"], {
        errorMap: () => ({ message: "Invalid process type."})
    }),
    provider: z.string().min(1)
})
