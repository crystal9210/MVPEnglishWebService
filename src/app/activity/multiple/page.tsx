// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useActivity } from "@/app/_contexts/activitySessionContext";
// import { ClientActivitySessionHistoryItem } from "@/domain/entities/clientSide/activitySessionHistoryItem";
// import { toast } from "react-toastify";
// import ProblemSetSelector from "@/app/_components/activity/problemSetSelector";
// import { ProblemSet } from "@/schemas/activity/clientSide/problemSetSchema";

// const MultipleActivityPage = () => {
//     const router = useRouter();
//     const { session, submitAnswer, getSessionHistory } = useActivity();

//     const [selectedProblemSet, setSelectedProblemSet] = useState<ProblemSet | null>(null);
//     const [currentAnswers, setCurrentAnswers] = useState<{ [problemId: string]: string }>({});
//     const [feedbacks, setFeedbacks] = useState<{ [problemId: string]: string }>({});
//     const [isCompleted, setIsCompleted] = useState<boolean>(false);

//     useEffect(() => {
//         if (!session) {
//             toast.error("No active session. Please start a session from the dashboard.");
//             router.push("/dashboard");
//         } else {
//             setSelectedProblemSet(session.problemSet);
//         }
//     }, [session, router]);

//     const handleChangeAnswer = (problemId: string, value: string) => {
//         setCurrentAnswers(prev => ({ ...prev, [problemId]: value }));
//     };

//     const handleSubmitAnswers = async () => {
//         if (!selectedProblemSet || !session) return;

//         const promises = selectedProblemSet.problems.map(async (problem) => {
//             const userAnswer = currentAnswers[problem.problemId] || "";
//             const isCorrect = userAnswer.trim().toLowerCase() === problem.correctAnswer.toLowerCase();

//             const historyItem = new ClientActivitySessionHistoryItem({
//                 problemId: problem.problemId,
//                 result: isCorrect ? "correct" : "incorrect",
//                 attempts: 1, // 必要に応じて増加させる
//                 lastAttemptAt: new Date().toISOString(),
//                 notes: isCorrect ? undefined : "Incorrect answer.",
//             });

//             try {
//                 await submitAnswer(historyItem);
//                 toast.success(`Answer for ${problem.problemId} submitted successfully!`);
//                 setFeedbacks(prev => ({ ...prev, [problem.problemId]: isCorrect ? "Correct!" : "Incorrect!" }));
//             } catch (error) {
//                 console.error(`Failed to submit answer for ${problem.problemId}`, error);
//                 toast.error(`Failed to submit answer for ${problem.problemId}.`);
//                 setFeedbacks(prev => ({ ...prev, [problem.problemId]: "Failed to submit." }));
//             }
//         });

//         await Promise.all(promises);

//         // チェック: 全ての問題が解答されたか
//         const updatedHistory = await getSessionHistory(session.sessionId);
//         const totalProblems = selectedProblemSet.problems.length;
//         if (updatedHistory.length >= totalProblems) {
//             setIsCompleted(true);
//         }
//     };

//     const handleViewResults = () => {
//         router.push("/activity/results");
//     };

//     if (!selectedProblemSet) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <div className="p-8">
//             <ProblemSetSelector />
//             <div className="bg-white shadow-md rounded p-6 mb-6">
//                 <h2 className="text-2xl font-bold mb-4">Problem Set: {selectedProblemSet.goal}</h2>
//                 {selectedProblemSet.problems.map((problem) => (
//                     <div key={problem.problemId} className="mb-4">
//                         <p className="font-semibold">Problem ID: {problem.problemId}</p>
//                         <p className="mb-2">{problem.question}</p>
//                         <input
//                             type="text"
//                             value={currentAnswers[problem.problemId] || ""}
//                             onChange={(e) => handleChangeAnswer(problem.problemId, e.target.value)}
//                             placeholder="Your answer"
//                             className="border p-2 rounded w-full mb-2"
//                         />
//                         {feedbacks[problem.problemId] && (
//                             <p className="text-green-500">{feedbacks[problem.problemId]}</p>
//                         )}
//                     </div>
//                 ))}
//                 {!isCompleted ? (
//                     <button
//                         onClick={handleSubmitAnswers}
//                         className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
//                     >
//                         Submit All Answers
//                     </button>
//                 ) : (
//                     <button
//                         onClick={handleViewResults}
//                         className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded"
//                     >
//                         View Results
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default MultipleActivityPage;
