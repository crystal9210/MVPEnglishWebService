// 依存関係
import "reflect-metadata"; // TODO でコレーたが機能するために必要
import { container } from "tsyringe";
import { AuthService } from "@/services/authService";
import { FirebaseAdmin } from "@/services/firebaseAdmin";
import { ProblemService } from "@/services/problemService";

container.registerSingleton<FirebaseAdmin>("FirebaseAdmin", FirebaseAdmin);
container.registerSingleton<AuthService>(AuthService);
container.registerSingleton<ProblemService>(ProblemService);


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
