// セッション終了
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/containers/diContainer';
import { ActivityServiceInterface } from '@/interfaces/services/IActivityService';
import { z } from 'zod';

const EndSessionSchema = z.object({
    sessionId: z.string(),
});

export async function PUT(req: NextRequest) {
    const activityService = container.resolve<ActivityServiceInterface>("IActivityService"); // 文字列トークンを使用
    try {
        const body = await req.json();
        const parseResult = EndSessionSchema.safeParse(body);
        if (!parseResult.success) {
        return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
        }

        const { sessionId } = parseResult.data;
        await activityService.endSession(sessionId);
        return NextResponse.json({ message: 'Session ended', sessionId }, { status: 200 });
    } catch (error) {
        console.error("Failed to end session", error);
        return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
    }
}
