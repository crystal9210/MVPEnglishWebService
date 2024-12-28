// "use client";
// import React from "react";
// import { useRouter } from "next/navigation";
// import { ProblemSet } from "@/schemas/activity/clientSide/problemSetSchema";

// interface ProblemSetCardProps {
//     problemSet: ProblemSet;
// }

// const ProblemSetCard: React.FC<ProblemSetCardProps> = ({ problemSet }) => {
//     const router = useRouter();

//     const handleStart = () => {
//         // `/dashboard` から `/activity/*` への遷移は `/activity/select/*` を経由して処理
//         router.push(`/activity/select/${problemSet.serviceId}/${problemSet.categoryId ?? "defaultCategory"}/${problemSet.stepId ?? "defaultStep"}`);
//     };

//     return (
//         <div className="p-6 bg-white shadow-md rounded">
//             <h3 className="text-xl font-bold mb-2">{problemSet.goal}</h3>
//             <p className="mb-4">Service ID: {problemSet.serviceId}</p>
//             <button
//                 onClick={handleStart}
//                 className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
//             >
//                 取り組む
//             </button>
//         </div>
//     );
// };

// export default ProblemSetCard;
