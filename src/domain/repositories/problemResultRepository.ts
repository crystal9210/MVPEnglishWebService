// import { injectable, inject } from "tsyringe";
// import { IProblemResultRepository } from "@/interfaces/repositories/IProblemResultRepository";
// import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
// import type { ILoggerService } from "@/interfaces/services/ILoggerService";
// import { ProblemResult, ProblemResultSchema } from "@/schemas/activity/problemHistorySchemas";
// import { BatchOperations } from "@/utils/batchOperations";
// import type { DocumentData, WithFieldValue, UpdateData } from "firebase-admin/firestore";
// import * as FirebaseFirestore from "firebase-admin/firestore";

// // TODO 問題形態のスキーマimport、使用->堅牢化
// @injectable()
// export class ProblemResultRepository implements IProblemResultRepository {
//     private readonly db: FirebaseFirestore.Firestore;
//     private readonly logger: ILoggerService;

//     constructor(
//         @inject("IFirebaseAdmin") firebaseAdmin: IFirebaseAdmin,
//         @inject("ILoggerService") logger: ILoggerService,
//         // @inject("BatchOperations") batchOperations: BatchOperations
//         @inject(BatchOperations) private batchOperations: BatchOperations
//     ) {
//         this.db = firebaseAdmin.getFirestore();
//         this.logger = logger;
//         // this.batchOperations = batchOperations;
//     }

//     /**
//      * 問題形態ごとのコレクション名を取得
//      * @param problemType 問題形態
//      * @returns コレクション名
//      */
//     private getCollectionName(problemType: string): string {
//         return `problemResults${problemType}`;
//     }

//     /**
//      * 問題結果をユーザーIDと問題IDで検索
//      * @param problemType 問題形態
//      * @param userId ユーザーID
//      * @param problemId 問題ID
//      * @returns ProblemResult | null
//      */
//     async findProblemResult(problemType: string, userId: string, problemId: string): Promise<ProblemResult | null> {
//         try {
//             const doc = await this.db.collection(this.getCollectionName(problemType)).doc(problemId).get();
//             if (doc.exists) {
//                 const data = doc.data() as DocumentData;

//                 // バリデーション
//                 const parsed = ProblemResultSchema.safeParse(data);
//                 if (parsed.success) {
//                     const problemResult = parsed.data;

//                     this.logger.info(`ProblemResult found: ProblemType = ${problemType}, UserID = ${userId}, ProblemID = ${problemId}`);
//                     return problemResult;
//                 } else {
//                     this.logger.warn(`Invalid problem result data in Firestore: ProblemID = ${problemId}`, { errors: parsed.error.errors });
//                     return null;
//                 }
//             }
//             this.logger.warn(`ProblemResult not found in Firestore: ProblemID = ${problemId}`);
//             return null;
//         } catch (error) {
//             this.logger.error(`Failed to find ProblemResult: ProblemType = ${problemType}, UserID = ${userId}, ProblemID = ${problemId}`, { error });
//             throw error;
//         }
//     }

//     /**
//      * 問題結果保存
//      * @param problemType 問題形態
//      * @param userId ユーザーID
//      * @param problemResult ProblemResultオブジェクト
//      */
//     async saveProblemResult(problemType: string, userId: string, problemResult: ProblemResult): Promise<void> {
//         try {
//             // Firestoreに保存
//             await this.batchOperations.batchSet<WithFieldValue<DocumentData>>(this.getCollectionName(problemType), [{ id: problemResult.problemId, data: problemResult }]);

//             this.logger.info(`ProblemResult saved: ProblemType = ${problemType}, UserID = ${userId}, ProblemID = ${problemResult.problemId}`);
//         } catch (error) {
//             this.logger.error(`Failed to save ProblemResult: ProblemType = ${problemType}, UserID = ${userId}, ProblemID = ${problemResult.problemId}`, { error });
//             throw error;
//         }
//     }

//     /**
//      * 問題結果更新
//      * @param problemType 問題形態
//      * @param userId ユーザーID
//      * @param problemId 問題ID
//      * @param updateData 更新データ
//      */
//     async updateProblemResult(problemType: string, userId: string, problemId: string, updateData: Partial<ProblemResult>): Promise<void> {
//         try {
//             // Firestoreに更新
//             await this.batchOperations.batchUpdate<Partial<ProblemResult>>(this.getCollectionName(problemType), [{ id: problemId, data: updateData }]);

//             this.logger.info(`ProblemResult updated: ProblemType = ${problemType}, UserID = ${userId}, ProblemID = ${problemId}`);
//         } catch (error) {
//             this.logger.error(`Failed to update ProblemResult: ProblemType = ${problemType}, UserID = ${userId}, ProblemID = ${problemId}`, { error });
//             throw error;
//         }
//     }

//     /**
//      * 問題結果削除
//      * @param problemType 問題形態
//      * @param userId ユーザーID
//      * @param problemId 問題ID
//      */
//     async deleteProblemResult(problemType: string, userId: string, problemId: string): Promise<void> {
//         try {
//             // Firestoreから削除
//             await this.batchOperations.batchDelete(this.getCollectionName(problemType), [problemId]);

//             this.logger.info(`ProblemResult deleted: ProblemType = ${problemType}, UserID = ${userId}, ProblemID = ${problemId}`);
//         } catch (error) {
//             this.logger.error(`Failed to delete ProblemResult: ProblemType = ${problemType}, UserID = ${userId}, ProblemID = ${problemId}`, { error });
//             throw error;
//         }
//     }
// }
