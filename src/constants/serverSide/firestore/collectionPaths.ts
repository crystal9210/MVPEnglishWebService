
// TODO RBAC: firebase authenticationのセキュリティルール側でも保証しているが専用の機構を内部的に用意する >> モノシリックなため不正アクセス + 暗号化された内容を解読できる攻撃者に対する防御には足りないが内部制御の専用モジュール開発・導入 >> 本来ならコードベースの暗号化についても危殆化対策として定期的にリフレッシュする専用の機構を用意するべき >> 異なるロジックの暗号による複数回の暗号化により事実上解読不可能にはなるはず
export const COLLECTION_PATHS = {
    AUDIT_LOGS: "auditLogs", // システム全体の重要なイベント・アクションを記録 >> 不正アクセス・障害時のトラブルシューティング実施時;セキュリティ監査利用
    ACCOUNTS: "accounts",
    SUBSCRIPTION: (userId: string) => `subscription/${userId}`, // TODO readonly from the user. >> implements the manager.
    USERS: "users",
    PROFILES: (userId: string) => `users/${userId}/profiles`,
    BOOKMARKS: (userId: string) => `users/${userId}/bookmarks`,
    CUSTOM_PROBLEM_SETS: (userId: string) => `users/${userId}/customProblemSets`,
    CUSTOM_PROBLEM_SET: (userId: string, problemSetId: string) => `users/${userId}/customProblemSets/${problemSetId}`,
    ACTIVITY_SESSION_HISTORIES: (userId: string, year: string) =>
        `users/${userId}/activitySessionHistories/${year}/historyItems`,
    ACTIVITY_SESSION_HISTORY: (userId: string,year: string, sessionId: string) => `users/${userId}/activitySessionHistories/${year}/historyItems/${sessionId}`,
    PROBLEM_HISTORIES: (userId: string) => `users/${userId}/problemHistories`,
    PROBLEM_HISTORY: (userId: string, problemXId: string) => `users/${userId}/problemHistories/${problemXId}`, // >> problemXId === serviceId.categoryId.stepId.problemId (This field is specially assigned to improve search performance, normal id groups are also implemented. )
    ACTIVATE_SESSIONS: (userId: string, sessionId: string) =>
        `users/${userId}/activateSessions/${sessionId}`,
    NOTES: (userId: string, yearMonth: string, sessionId: string) =>
        `users/${userId}/sessionHistories/${yearMonth}/${sessionId}/notes`,
    GOALS: (userId: string) => `users/${userId}/goals`,
    // Statistics
    STATISTICS: (userId: string) => `users/${userId}/statistics`,
    SESSION_STATISTICS: (userId: string, period: string) => `users/${userId}/statistics/session/${period}`,
    GOAL_STATISTICS: (userId: string, period: string) => `users/${userId}/statistics/goal/${period}`,
    PROBLEM_STATISTICS: (userId: string, period: string) => `users/${userId}/statistics/problem/${period}`,
    USER_ACTIVITY: (userId: string, period: string) => `users/${userId}/statistics/userActivity/${period}`,
    REPORTS: (userId: string) => `users/${userId}/reports`, // 一定期間の学習成果をまとめたレポート生成機能、PDFなどにエクスポートするための基盤設計
    REPORT: (userId: string, reportId: string) => `users/${userId}/reports/${reportId}`,
};



// --- use case sample code ----
// -- @/managers/firestore/SessionHistoryManager.ts --
// import { COLLECTION_PATHS } from "@/constants/serverSide/firestore/collectionPaths";
// import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

// const db = getFirestore();

// export class SessionHistoryManager {
//     /**
//      * セッションデータを保存
//      * @param userId - ユーザーID
//      * @param yearMonth - 年月 (例: "2024-10")
//      * @param sessionId - セッションID
//      * @param data - 保存するセッションデータ
//      */
//     static async saveSessionHistory(
//         userId: string,
//         yearMonth: string,
//         sessionId: string,
//         data: any
//     ): Promise<void> {
//         const path = COLLECTION_PATHS.SESSION_DETAILS(userId, yearMonth, sessionId);
//         const docRef = doc(db, path);
//         await setDoc(docRef, data);
//     }

//     /**
//      * セッションデータを取得
//      * @param userId - ユーザーID
//      * @param yearMonth - 年月
//      * @param sessionId - セッションID
//      * @returns セッションデータ
//      */
//     static async getSessionHistory(userId: string, yearMonth: string, sessionId: string): Promise<any> {
//         const path = COLLECTION_PATHS.SESSION_DETAILS(userId, yearMonth, sessionId);
//         const docRef = doc(db, path);
//         const snapshot = await getDoc(docRef);
//         if (!snapshot.exists()) {
//         throw new Error("Session history not found");
//         }
//         return snapshot.data();
//     }

//     /**
//      * ノートデータを追加
//      * @param userId - ユーザーID
//      * @param yearMonth - 年月
//      * @param sessionId - セッションID
//      * @param noteContent - ノートの内容
//      */
//     static async addNote(
//         userId: string,
//         yearMonth: string,
//         sessionId: string,
//         noteContent: string
//     ): Promise<void> {
//         const path = COLLECTION_PATHS.NOTES(userId, yearMonth, sessionId);
//         const collectionRef = collection(db, path);
//         await addDoc(collectionRef, {
//         content: noteContent,
//         createdAt: new Date(),
//         });
//     }
// }

// -- anotherFile.ts ---
// import { SessionHistoryManager } from "@/managers/firestore/SessionHistoryManager";

// const userId = "user123";
// const yearMonth = "2024-10";
// const sessionId = "session456";

// // セッションデータを保存
// const sessionData = {
//     serviceId: "basis",
//     categoryId: "category1",
//     stepId: "step2",
//     problemId: "p1",
//     attemptedAt: new Date(),
//     result: "correct",
//     timeSpent: 120,
//     attempts: 3,
//     notes: ["Note 1", "Note 2"],
// };

// await SessionHistoryManager.saveSessionHistory(userId, yearMonth, sessionId, sessionData);

// // セッションデータを取得
// const fetchedSession = await SessionHistoryManager.getSessionHistory(userId, yearMonth, sessionId);
// console.log("Fetched session:", fetchedSession);

// // ノートを追加
// await SessionHistoryManager.addNote(userId, yearMonth, sessionId, "This is a new note.");
