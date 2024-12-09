// TODO 結果をコレクションに格納するように
// TODO 詳細設計の内容が正確に反映されていないので反映
// 回答提出(仮)
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/containers/diContainer';
import { ActivityServiceInterface } from '@/interfaces/services/IActivityService';
// import { UserHistoryItemSchema } from '@/schemas/userSchemas';
import { UserHistoryItem } from '@/domain/entities/userHistoryItem';
import { z } from 'zod';

const SubmitAnswerSchema = z.object({
    sessionId: z.string(),
    problemId: z.string(),
    result: z.enum(["correct", "incorrect"]),
    attempts: z.number().min(1),
    lastAttemptAt: z.string(),
    notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
    const activityService = container.resolve<ActivityServiceInterface>("IActivityService");
    try {
        const body = await req.json();
        const parseResult = SubmitAnswerSchema.safeParse(body);
        if (!parseResult.success) {
        return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
        }

        const historyItem = new UserHistoryItem(parseResult.data);
        await activityService.submitAnswer(parseResult.data.sessionId, historyItem);
        return NextResponse.json({ message: 'Answer submitted' }, { status: 200 });
    } catch (error) {
        console.error("Failed to submit answer", error);
        return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 });
    }
}
