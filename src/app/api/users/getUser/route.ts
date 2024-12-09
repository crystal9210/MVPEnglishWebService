import { NextResponse } from 'next/server';
import { container } from 'tsyringe';
import { UserRepository } from '@/domain/repositories/userRepository';
import { LoggerService } from '@/domain/services/loggerService';

/**
 * ユーザー取得エンドポイント (GET /api/users/me)
 */
export async function GET(req: Request) {
    const logger = container.resolve(LoggerService);
    const userRepository = container.resolve(UserRepository);

    // ヘッダーからユーザーIDを取得
    const userId = (req.headers.get('x-user-id') || '') as string;

    if (!userId) {
        logger.warn('User ID is missing in the request headers');
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const user = await userRepository.findUserById(userId);

        if (user) {
            return NextResponse.json(user, { status: 200 });
        } else {
            logger.warn(`User not found: UID = ${userId}`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
    } catch (error) {
        logger.error(`Error in GET /api/users/me: ${error instanceof Error ? error.message : 'Unknown error'}`, { error });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
