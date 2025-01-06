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

import type { IAccountRepository } from "@/interfaces/repositories/IAccountRepository";
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
import { AccountRepository } from "@/domain/repositories/accountRepository";
import { ActivitySessionRepository } from "@/domain/repositories/activitySessionRepository";

import { BatchOperations } from "@/utils/batchOperations";
import { RetryService } from "@/domain/services/retryService";

import { EmbeddingRepository } from "@/domain/repositories/embeddingRepository";
import {
    LLMService,
    LLMServiceOptions,
} from "@/domain/services/serverSide/LLMService";
import { RAGService } from "@/domain/services/serverSide/RAGService";

// Utility
// 最初に他のサービスに依存しないサービスを登録 - tsyringeの仕様
container.registerSingleton<ILoggerService>("ILoggerService", LoggerService);
container.registerSingleton<IFirebaseAdmin>("IFirebaseAdmin", FirebaseAdmin);
container.registerSingleton(BatchOperations);
container.registerSingleton(RetryService);

// Repositories
container.registerSingleton<IAccountRepository>(
    "IAccountRepository",
    AccountRepository
);
container.registerSingleton<IUserRepository>("IUserRepository", UserRepository);
container.registerSingleton<IProblemRepository>(
    "IProblemRepository",
    ProblemRepository
);
container.registerSingleton<IProfileRepository>(
    "IProfileRepository",
    ProfileRepository
);
container.registerSingleton<IUserHistoryRepository>(
    "IUserHistoryRepository",
    UserHistoryRepository
);
container.registerSingleton<ISubscriptionRepository>(
    "ISubscriptionRepository",
    SubscriptionRepository
);
container.registerSingleton<IActivitySessionRepository>(
    "IActivitySessionRepository",
    ActivitySessionRepository
);

// Services
container.registerSingleton<IAuthService>("IAuthService", AuthService);
container.registerSingleton<IUserService>("IUserService", UserService);
container.registerSingleton<IUserProfileService>(
    "IUserProfileService",
    UserProfileService
);
container.registerSingleton<IUserHistoryService>(
    "IUserHistoryService",
    UserHistoryService
);
container.registerSingleton<IUserBookmarkService>(
    "IUserBookmarkService",
    UserBookmarkService
);
container.registerSingleton<IProblemService>("IProblemService", ProblemService);
container.registerSingleton<ISubscriptionService>(
    "ISubscriptionService",
    SubscriptionService
);
container.registerSingleton<IActivityService>(
    "IActivityService",
    ActivityService
);

const llmOptions: LLMServiceOptions = {
    useAzure: false, // >> default settings: not use useAzure.
    openai: {
        apiKey: process.env.OPENAI_API_KEY || "",
    },
};

container.register<LLMServiceOptions>("LLMServiceOptions", {
    useValue: llmOptions,
});
container.register<ILLMService>("ILLMService", LLMService);
container.register<IEmbeddingRepository>(
    "IEmbeddingRepository",
    EmbeddingRepository
);
container.register<IRAGService>("IRAGService", RAGService);

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
