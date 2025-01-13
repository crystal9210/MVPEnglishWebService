/* src/containers/diContainer.ts */
// インターフェース群 (type importでdecoratorエラー回避)
import "reflect-metadata";
import { container } from "tsyringe";

// インターフェース群
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { IAuthService } from "@/interfaces/services/IAuthService";
import type { IUserService } from "@/interfaces/services/IUserService";
import type { IUserProfileService } from "@/interfaces/services/IUserProfileService";
import type { IUserHistoryService } from "@/interfaces/services/IUserHistoryService";
import type { IUserBookmarkService } from "@/interfaces/services/IUserBookmarkService";
import type { IProblemService } from "@/interfaces/services/IProblemService";
import type { ISubscriptionService } from "@/interfaces/services/ISubscriptionService";
import type { IActivityService } from "@/interfaces/services/IActivityService";

import type { IAuthAccountRepository } from "@/interfaces/repositories/IAuthAccountRepository";
import type { IUserRepository } from "@/interfaces/repositories/IUserRepository";
import type { IProblemRepository } from "@/interfaces/repositories/IProblemRepository";
import type { IProfileRepository } from "@/interfaces/repositories/IProfileRepository";
import type { IUserHistoryRepository } from "@/interfaces/repositories/IUserHistoryRepository";
import type { ISubscriptionRepository } from "@/interfaces/repositories/ISubscriptionRepository";
import type { IActivitySessionRepository } from "@/interfaces/repositories/IActivitySessionRepository";

import type { IEmbeddingRepository } from "@/interfaces/repositories/IEmbeddingRepository";
import type { ILLMService } from "@/interfaces/services/ILLMService";
import type { IRAGService } from "@/interfaces/services/IRAGService";

// 実装クラス群
import { AuthService } from "@/domain/services/authService";
import { FirebaseAdmin } from "@/domain/services/firebaseAdmin";
import { LoggerService } from "@/domain/services/loggerService";
import { UserService } from "@/domain/services/userService";
import { UserProfileService } from "@/domain/services/userProfileService";
import { UserHistoryService } from "@/domain/services/userHistoryService";
import { UserBookmarkService } from "@/domain/services/userBookmarkService";
import { ProblemService } from "@/domain/services/problemService";
import { SubscriptionService } from "@/domain/services/subscriptionService";
import { ActivityService } from "@/domain/services/activityService";

import { UserRepository } from "@/domain/repositories/userRepository";
import { ProblemRepository } from "@/domain/repositories/problemRepository";
import { ProfileRepository } from "@/domain/repositories/userProfileRepository";
import { UserHistoryRepository } from "@/domain/repositories/userHistoryRepository";
import { SubscriptionRepository } from "@/domain/repositories/subscriptionRepository";
import { ActivitySessionRepository } from "@/domain/repositories/activitySessionRepository";

import { BatchOperations } from "@/utils/batchOperations";
import { RetryService } from "@/domain/services/retryService";

import { EmbeddingRepository } from "@/domain/repositories/embeddingRepository";
import {
    LLMService,
    LLMServiceOptions,
} from "@/domain/services/serverSide/LLMService";
import { RAGService } from "@/domain/services/serverSide/RAGService";
import { OpenAI } from "@/lib/openai";
import { IOpenAIClient } from "@/interfaces/services/openai/IOpenAIClient";
import { AuthAccountRepository } from "@/domain/repositories/authAccountRepository";
import { IAuthAccountService } from "@/interfaces/services/IAuthAccountService";
import { AuthAccountService } from "@/domain/services/authAccountService";
import { CustomFirestoreAdapter } from "@/adapters/customFirestoreAdapter";
import { IAuthUserRepository } from "@/interfaces/repositories/IAuthUserRepository";
import { AuthUserRepository } from "@/domain/repositories/authUserRepository";
import { IAuthVerificationTokenRepository } from "@/interfaces/repositories/IAuthVerificationTokenRepository";
import { AuthVerificationTokenRepository } from "@/domain/repositories/authVerificationTokenRepository";
import { IAuthSessionRepository } from "@/interfaces/repositories/IAuthSessionRepository";
import { AuthSessionRepository } from "@/domain/repositories/authSessionRepository";
import { IAuthenticatorRepository } from "@/interfaces/repositories/IAuthenticatorRepository";
import { AuthenticatorRepository } from "@/domain/repositories/authenticatorRepository";
import { IAuthenticatorService } from "@/interfaces/services/IAuthenticatorService";
import { AuthenticatorService } from "@/domain/services/authenticatorService";
import { IAuthUserService } from "@/interfaces/services/IAuthUserService";
import { AuthUserService } from "@/domain/services/authUserService";
import { IAuthVerificationTokenService } from "@/interfaces/services/IAuthVerificationTokenService";
import { IAuthSessionService } from "@/interfaces/services/IAuthSessionService";
import { AuthSessionService } from "@/domain/services/authSessionService";
import { AuthVerificationTokenService } from "@/domain/services/authVerificationTokenService";

import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

// Utility
// 最初に他のサービスに依存しないサービスを登録 - tsyringeの仕様
container.registerSingleton<ILoggerService>(
    TSYRINGE_TOKENS.ILoggerService,
    LoggerService
);
container.registerSingleton<IFirebaseAdmin>(
    TSYRINGE_TOKENS.IFirebaseAdmin,
    FirebaseAdmin
);
container.registerSingleton(BatchOperations);
container.registerSingleton(RetryService);

// Repositories
container.registerSingleton<IUserRepository>(
    TSYRINGE_TOKENS.IUserRepository,
    UserRepository
);
container.registerSingleton<IProblemRepository>(
    TSYRINGE_TOKENS.IProblemRepository,
    ProblemRepository
);
container.registerSingleton<IProfileRepository>(
    TSYRINGE_TOKENS.IProfileRepository,
    ProfileRepository
);
container.registerSingleton<IUserHistoryRepository>(
    TSYRINGE_TOKENS.IUserHistoryRepository,
    UserHistoryRepository
);
container.registerSingleton<ISubscriptionRepository>(
    TSYRINGE_TOKENS.ISubscriptionRepository,
    SubscriptionRepository
);
container.registerSingleton<IActivitySessionRepository>(
    TSYRINGE_TOKENS.IActivitySessionRepository,
    ActivitySessionRepository
);

// Services
container.registerSingleton<IAuthService>(
    TSYRINGE_TOKENS.IAuthService,
    AuthService
);
container.registerSingleton<IUserService>(
    TSYRINGE_TOKENS.IUserService,
    UserService
);
container.registerSingleton<IUserProfileService>(
    TSYRINGE_TOKENS.IUserProfileService,
    UserProfileService
);
container.registerSingleton<IUserHistoryService>(
    TSYRINGE_TOKENS.IUserHistoryService,
    UserHistoryService
);
container.registerSingleton<IUserBookmarkService>(
    TSYRINGE_TOKENS.IUserBookmarkService,
    UserBookmarkService
);
container.registerSingleton<IProblemService>(
    TSYRINGE_TOKENS.IProblemService,
    ProblemService
);
container.registerSingleton<ISubscriptionService>(
    TSYRINGE_TOKENS.ISubscriptionService,
    SubscriptionService
);
container.registerSingleton<IActivityService>(
    TSYRINGE_TOKENS.IActivityService,
    ActivityService
);

// Register existing services
const llmOptions: LLMServiceOptions = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY || "",
    },
};

container.register<LLMServiceOptions>(TSYRINGE_TOKENS.LLMServiceOptions, {
    useValue: llmOptions,
});

container.register<IOpenAIClient>(TSYRINGE_TOKENS.IOpenAIClient, {
    useClass: OpenAI,
});

container.register<ILLMService>(TSYRINGE_TOKENS.ILLMService, LLMService);
container.register<IEmbeddingRepository>(
    TSYRINGE_TOKENS.IEmbeddingRepository,
    EmbeddingRepository
);
container.register<IRAGService>(TSYRINGE_TOKENS.IRAGService, RAGService);

// auth系サービス・リポジトリ登録
container.registerSingleton<IAuthenticatorRepository>(
    TSYRINGE_TOKENS.IAuthenticatorRepository,
    AuthenticatorRepository
);
container.registerSingleton<IAuthUserRepository>(
    TSYRINGE_TOKENS.IAuthUserRepository,
    AuthUserRepository
);
container.registerSingleton<IAuthAccountRepository>(
    TSYRINGE_TOKENS.IAuthAccountRepository,
    AuthAccountRepository
);
container.registerSingleton<IAuthVerificationTokenRepository>(
    TSYRINGE_TOKENS.IAuthVerificationTokenRepository,
    AuthVerificationTokenRepository
);
container.registerSingleton<IAuthSessionRepository>(
    TSYRINGE_TOKENS.IAuthSessionRepository,
    AuthSessionRepository
);

container.registerSingleton<IAuthAccountService>(
    TSYRINGE_TOKENS.IAuthAccountService,
    AuthAccountService
);
container.registerSingleton<IAuthenticatorService>(
    TSYRINGE_TOKENS.IAuthenticatorService,
    AuthenticatorService
);
container.registerSingleton<IAuthUserService>(
    TSYRINGE_TOKENS.IAuthUserService,
    AuthUserService
);
container.registerSingleton<IAuthVerificationTokenService>(
    TSYRINGE_TOKENS.IAuthVerificationTokenService,
    AuthVerificationTokenService
);
container.registerSingleton<IAuthSessionService>(
    TSYRINGE_TOKENS.IAuthSessionService,
    AuthSessionService
);

// CustomFirestoreAdapter登録
container.registerSingleton<CustomFirestoreAdapter>(
    TSYRINGE_TOKENS.CustomFirestoreAdapter,
    CustomFirestoreAdapter
);

export { container };

// --- use case ---
// -- src/pages/index.tsx --

// import { useEffect } from "react";
// import { container } from "tsyringe";
// import { ProblemService } from "@/services/problemService";

// export default function HomePage() {
//     const problemService = container.resolve(ProblemService);

//     useEffect(() => {
//         async function fetchProblems() {
//             const problems = await problemService.getProblemsByCategory("grammar");
//             console.log(problems);
//         }
//         fetchProblems();
//     }, [problemService]);

//     return (
//         <div>
//             <h1>Home Page</h1>
//             {/* 他のコンポーネント */}
//         </div>
//     );
// }
