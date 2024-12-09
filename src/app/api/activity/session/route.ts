import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/containers/diContainer';
import { ActivityServiceInterface } from '@/interfaces/services/IActivityService';
import { ActivitySessionSchema } from '@/schemas/activitySessionSchema';
import { ActivitySession } from '@/domain/entities/ActivitySession';

// セッション作成
export async function POST(req: NextRequest) {
    const activityService = container.resolve<ActivityServiceInterface>("IActivityService");
    try {
        const body = await req.json();
        const parseResult = ActivitySessionSchema.safeParse(body);
        if (!parseResult.success) {
        return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
        }

        const session = new ActivitySession(parseResult.data);
        await activityService.createSession(session);
        return NextResponse.json({ message: 'Session created', sessionId: session.sessionId }, { status: 201 });
    } catch (error) {
        console.error("Failed to create session", error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}

// セッション取得
export async function GET(req: NextRequest) {
    const activityService = container.resolve<ActivityServiceInterface>("IActivityService");
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId || typeof sessionId !== 'string') {
        return NextResponse.json({ error: 'Invalid or missing session ID' }, { status: 400 });
    }

    try {
        const session = await activityService.getSession(sessionId);
        if (session) {
        return NextResponse.json(session, { status: 200 });
        } else {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
    } catch (error) {
        console.error("Failed to retrieve session", error);
        return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 });
    }
}
