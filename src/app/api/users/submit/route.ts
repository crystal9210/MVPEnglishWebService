import { NextResponse } from 'next/server';
import { withValidationAndSanitization } from '@/middlewares/withMiddleware';
import { z } from 'zod';
import { ProblemResultSchema, ProblemResult } from '@/schemas/userHistorySchemas';
import { UserService } from '@/services/userService';
import { container } from 'tsyringe';
import { LoggerService } from '@/services/loggerService';

/**
 * ユーザー全問題結果保存エンドポイント (POST /api/users/submit)
 * リクエストボディ: { uid: string, problemResults: ProblemResult[] }
 */
const SubmitAllResultsSchema = z.object({
    uid: z.string().uuid('Invalid UID format'),
    problemResults: ProblemResultSchema.array(),
});

async function submitAllResultsHandler(req: Request, context: { validatedBody: { uid: string, problemResults: ProblemResult[] } }) {
    try {
        const { uid, problemResults } = context.validatedBody;

        const userService = container.resolve(UserService);
        await userService.saveAllProblemResults(uid, problemResults);

        return NextResponse.json({ message: 'All problem results saved successfully' }, { status: 200 });
    } catch (error) {
        // LoggerServiceを利用してエラーログを記録
        const logger = container.resolve(LoggerService);
        logger.error(`Error in submitAllResultsHandler: ${error instanceof Error ? error.message : 'Unknown error'}`, { error });

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const POST = withValidationAndSanitization<{ uid: string, problemResults: ProblemResult[] }>(
    submitAllResultsHandler,
    SubmitAllResultsSchema,
    ['problemResults.notes'] // サニタイズ対象のフィールド
);
