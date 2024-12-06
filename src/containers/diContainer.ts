import "reflect-metadata"; // for use "tsyringe"
import { container } from "tsyringe";
import { validateEnvVar } from "@/utils/env";

// サービスインターフェース
import { IAuthService } from "@/interfaces/services/IAuthService";
import { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import { ILoggerService } from "@/interfaces/services/ILoggerService";
import { IPatternService } from "@/interfaces/services/IPatternService";
import { IProblemService } from "@/interfaces/services/IProblemService";
import { IUserBookmarkService } from "@/interfaces/services/IUserBookmarkService";
import { IUserHistoryService } from "@/interfaces/services/IUserHistoryService";
import { IUserProfileService } from "@/interfaces/services/IUserProfileService";
import { IUserService } from "@/interfaces/services/IUserService";
// リポジトリインターフェース
import { IUserRepository } from "@/interfaces/repositories/IUserRepository";
import { IProblemRepository } from "@/interfaces/repositories/IProblemRepository";
import { IPatternRepository } from "@/interfaces/repositories/IPatternRepository";

// サービスとリポジトリの実装クラス
import { AuthService } from "@/services/authService";
import { FirebaseAdmin } from "@/services/firebaseAdmin";
import { UserService } from "@/services/userService";
import { UserProfileService } from "@/services/userProfileService";
import { UserHistoryService } from "@/services/userHistoryService";
import { UserBookmarkService } from "@/services/userBookmarkService";
import { ProblemService } from "@/services/problemService";
import { PatternService } from "@/services/patternService";
import { LoggerService } from "@/services/loggerService";

import { UserRepository } from "@/repositories/userRepository";
import { ProblemRepository } from "@/repositories/problemRepository";
import { PatternRepository } from "@/repositories/patternRepository";

// Firestore初期化
import * as admin from "firebase-admin";
import { Firestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
    const projectId = validateEnvVar("FIREBASE_PROJECT_ID");
    const clientEmail = validateEnvVar("FIREBASE_CLIENT_EMAIL");
    let privateKey = validateEnvVar("FIREBASE_PRIVATE_KEY");

    privateKey = privateKey.replace(/\\n/g, "\n");

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

// Firestore:"Firestore"として登録
container.registerInstance<Firestore>("Firestore", admin.firestore());

// リポジトリの登録: インターフェースと実装の紐付け
container.registerSingleton<IUserRepository>("IUserRepository", UserRepository);
container.registerSingleton<IProblemRepository>("IProblemRepository", ProblemRepository);
container.registerSingleton<IPatternRepository>("IPatternRepository", PatternRepository);

// ロガーサービスの登録
container.registerSingleton<ILoggerService>("ILoggerService", LoggerService);

// FirebaseAdmin: IFirebaseAdminインターフェースを実装していることを前提
container.registerSingleton<IFirebaseAdmin>("IFirebaseAdmin", FirebaseAdmin);

// AuthService: IAuthServiceインターフェースを実装していることを前提
container.registerSingleton<IAuthService>("IAuthService", AuthService);

// UserService: IUserServiceインターフェースを実装
container.registerSingleton<IUserService>("IUserService", UserService);

// UserProfileService: IUserProfileServiceインターフェースを実装
container.registerSingleton<IUserProfileService>("IUserProfileService", UserProfileService);

// UserHistoryService: IUserHistoryServiceインターフェースを実装
container.registerSingleton<IUserHistoryService>("IUserHistoryService", UserHistoryService);

// UserBookmarkService: IUserBookmarkServiceインターフェースを実装
container.registerSingleton<IUserBookmarkService>("IUserBookmarkService", UserBookmarkService);

// ProblemService: IProblemServiceインターフェースを実装
container.registerSingleton<IProblemService>("IProblemService", ProblemService);

// PatternService: IPatternServiceインターフェースを実装
container.registerSingleton<IPatternService>("IPatternService", PatternService);

// container をエクスポート（APIエンドポイントで利用するため）
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
