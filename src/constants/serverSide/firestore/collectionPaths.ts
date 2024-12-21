// TODO ドキュメントの設計内容を全て落とし込む
// TODO RBAC: firebase authenticationのセキュリティルール側でも保証しているが専用の機構を内部的に用意する >> モノシリックなため不正アクセス + 暗号化された内容を解読できる攻撃者に対する防御には足りないが内部制御の専用モジュール開発・導入 >> 本来ならコードベースの暗号化についても危殆化対策として定期的にリフレッシュする専用の機構を用意するべき >> 異なるロジックの暗号による複数回の暗号化により事実上解読不可能にはなるはず
export const COLLECTION_PATHS = {
    ACCOUNTS: "accounts",
    USERS: "users",
    PROFILES: (userId: string) => `users/${userId}/profiles`,
    BOOKMARKS: (userId: string) => `users/${userId}/bookmarks`,
    SESSION_HISTORIES: (userId: string, yearMonth: string) =>
        `users/${userId}/sessionHistories/${yearMonth}`,
    SESSION_DEFAULTS: (userId: string, yearMonth: string, sessionId: string) =>
        `users/${userId}/sessionHistories/${yearMonth}/${sessionId}`,
    NOTES: (userId: string, yearMonth: string, sessionId: string) =>
        `users/${userId}/sessionHistories/${yearMonth}/${sessionId}/notes`,
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
