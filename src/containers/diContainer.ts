// src/container/diContainer.ts
import "reflect-metadata";
import { container } from "tsyringe";

// インターフェース群 (type importでdecoratorエラー回避)
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { IAuthService } from "@/interfaces/services/IAuthService";
import type { IUserService } from "@/interfaces/services/IUserService";
import type { IUserProfileService } from "@/interfaces/services/IUserProfileService";
import type { IUserHistoryService } from "@/interfaces/services/IUserHistoryService";
import type { IUserBookmarkService } from "@/interfaces/services/IUserBookmarkService";
import type { IProblemService } from "@/interfaces/services/IProblemService";
import type { IPatternService } from "@/interfaces/services/IPatternService";
// import type { IHistoryService } from "@/interfaces/services/IHistoryService";
import type { ISubscriptionService } from "@/interfaces/services/ISubscriptionService";
import type { IAccountRepository } from "@/interfaces/repositories/IAccountRepository";
import type { IUserRepository } from "@/interfaces/repositories/IUserRepository";
import type { IProblemRepository } from "@/interfaces/repositories/IProblemRepository";
import type { IPatternRepository } from "@/interfaces/repositories/IPatternRepository";
import type { IProblemResultRepository } from "@/interfaces/repositories/IProblemResultRepository";
import type { IProfileRepository } from "@/interfaces/repositories/IProfileRepository";
import type { IUserHistoryRepository } from "@/interfaces/repositories/IUserHistoryRepository";
import type { ISubscriptionRepository } from "@/interfaces/repositories/ISubscriptionRepository";

// 実装クラス群
import { AuthService } from "@/services/authService";
import { FirebaseAdmin } from "@/services/firebaseAdmin";
import { LoggerService } from "@/services/loggerService";
import { UserService } from "@/services/userService";
import { UserProfileService } from "@/services/userProfileService";
import { UserHistoryService } from "@/services/userHistoryService";
import { UserBookmarkService } from "@/services/userBookmarkService";
import { ProblemService } from "@/services/problemService";
import { PatternService } from "@/services/patternService";
import { SubscriptionService } from "@/services/subscriptionService";

import { UserRepository } from "@/repositories/userRepository";
import { ProblemRepository } from "@/repositories/problemRepository";
import { PatternRepository } from "@/repositories/patternRepository";
import { ProblemResultRepository } from "@/repositories/problemResultRepository";
import { ProfileRepository } from "@/repositories/userProfileRepository";
import { UserHistoryRepository } from "@/repositories/userHistoryRepository";
import { SubscriptionRepository } from "@/repositories/subscriptionRepository";
import { AccountRepository } from "@/repositories/accountRepository";
import { BatchOperations } from "@/utils/batchOperations";

// Utility
// 最初に他のサービスに依存しないサービスを登録 - tsyringeの仕様
container.registerSingleton<ILoggerService>("ILoggerService", LoggerService);

container.registerSingleton<IFirebaseAdmin>("IFirebaseAdmin", FirebaseAdmin);

// container.registerSingleton<BatchOperations>("BatchOperations", BatchOperations); // NOTE: "BatchOperations"のトークンを指定しなければならない
container.registerSingleton(BatchOperations);

// Repositories
container.registerSingleton<IAccountRepository>("IAccountRepository", AccountRepository);
container.registerSingleton<IUserRepository>("IUserRepository", UserRepository);
container.registerSingleton<IProblemRepository>("IProblemRepository", ProblemRepository);
container.registerSingleton<IPatternRepository>("IPatternRepository", PatternRepository);
container.registerSingleton<IProblemResultRepository>("IProblemResultRepository", ProblemResultRepository);
container.registerSingleton<IProfileRepository>("IProfileRepository", ProfileRepository);
container.registerSingleton<IUserHistoryRepository>("IUserHistoryRepository", UserHistoryRepository);
container.registerSingleton<ISubscriptionRepository>("ISubscriptionRepository", SubscriptionRepository);

// Services
container.registerSingleton<IAuthService>("IAuthService", AuthService);
container.registerSingleton<IUserService>("IUserService", UserService);
container.registerSingleton<IUserProfileService>("IUserProfileService", UserProfileService);
container.registerSingleton<IUserHistoryService>("IUserHistoryService", UserHistoryService);
container.registerSingleton<IUserBookmarkService>("IUserBookmarkService", UserBookmarkService);
container.registerSingleton<IProblemService>("IProblemService", ProblemService);
container.registerSingleton<IPatternService>("IPatternService", PatternService);
container.registerSingleton<IUserHistoryRepository>("IUserHistoryRepository", UserHistoryRepository);
container.registerSingleton<ISubscriptionService>("ISubscriptionService", SubscriptionService);


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
