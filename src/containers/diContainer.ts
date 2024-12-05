// 依存関係
import "reflect-metadata"; // TODO でコレーたが機能するために必要
import { container } from "tsyringe";
import { AuthService } from "@/services/authService";
import { FirebaseAdmin } from "@/services/firebaseAdmin";
import { UserService } from "@/services/userService";
import { UserProfileService } from "@/services/userProfileService";
import { UserHistoryService } from "@/services/userHistoryService";
import { UserBookmarkService } from "@/services/userBookmarkService";
import { ProblemService } from "@/services/problemService";
import { PatternService } from "@/services/patternService";

container.registerSingleton(FirebaseAdmin);
container.registerSingleton(AuthService);
container.registerSingleton(UserService);
container.registerSingleton(UserProfileService);
container.registerSingleton(UserHistoryService);
container.registerSingleton(UserBookmarkService);
container.registerSingleton(ProblemService);
container.registerSingleton(PatternService);


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
