// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { withValidationAndSanitization } from '@/middlewares/withMiddleware';
import { UserSchema, User } from '@/schemas/userSchemas';
import { UserService } from '@/services/userService';
import { container } from 'tsyringe';
import { LoggerService } from '@/services/loggerService';

/**
 * ユーザー作成エンドポイント (POST /api/users)
 */
async function createUserHandler(req: Request, context: { validatedBody: User }) {
    try {
        const userData = context.validatedBody;

        const userService = container.resolve(UserService);
        await userService.createUser(userData);

        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
    } catch (error) {
        // LoggerServiceを利用してエラーログを記録
        const logger = container.resolve(LoggerService);
        logger.error(`Error in createUserHandler: ${error instanceof Error ? error.message : 'Unknown error'}`, { error });

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const POST = withValidationAndSanitization<User>(
    createUserHandler,
    UserSchema,
    [] // TODO サニタイズ対象のフィールドがないため空配列
);
