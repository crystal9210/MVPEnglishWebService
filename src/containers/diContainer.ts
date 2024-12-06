import "reflect-metadata"; // for use "tsyringe"
import { container } from "tsyringe";

// サービスとリポジトリのインポート
import { AuthService } from "@/services/authService";
import { FirebaseAdmin } from "@/services/firebaseAdmin";
import { UserService } from "@/services/userService";
import { UserProfileService } from "@/services/userProfileService";
import { UserHistoryService } from "@/services/userHistoryService";
import { UserBookmarkService } from "@/services/userBookmarkService";
import { ProblemService } from "@/services/problemService";
import { PatternService } from "@/services/patternService";
import { LoggerService } from "@/services/loggerService";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { IProblemRepository } from "@/repositories/interfaces/IProblemRepository";
import { IPatternRepository } from "@/repositories/interfaces/IPatternRepository";
import { UserRepository } from "@/repositories/userRepository";
import { ProblemRepository } from "@/repositories/problemRepository";
import { PatternRepository } from "@/repositories/patternRepository";

// Firestore の初期化
import * as admin from "firebase-admin";
import { Firestore } from "firebase-admin/firestore";

// 環境変数の検証関数
function validateEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not defined.`);
    }
    return value;
}

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

// リポジトリの登録
container.registerSingleton<IUserRepository>("IUserRepository", UserRepository);
container.registerSingleton<IProblemRepository>("IProblemRepository", ProblemRepository);
container.registerSingleton<IPatternRepository>("IPatternRepository", PatternRepository);

// サービスの登録
container.registerSingleton<LoggerService>(LoggerService);
container.registerSingleton<FirebaseAdmin>(FirebaseAdmin);
container.registerSingleton<AuthService>(AuthService);
container.registerSingleton<UserService>(UserService);
container.registerSingleton<UserProfileService>(UserProfileService);
container.registerSingleton<UserHistoryService>(UserHistoryService);
container.registerSingleton<UserBookmarkService>(UserBookmarkService);
container.registerSingleton<ProblemService>(ProblemService);
container.registerSingleton<PatternService>(PatternService);

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
