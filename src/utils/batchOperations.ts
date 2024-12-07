import { injectable, inject } from "tsyringe";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { DocumentData, WithFieldValue, UpdateData } from "firebase-admin/firestore";

@injectable()
export class BatchOperations {
    private readonly db: FirebaseFirestore.Firestore;
    private readonly logger: ILoggerService;

    constructor(
        @inject("IFirebaseAdmin") firebaseAdmin: IFirebaseAdmin,
        @inject("ILoggerService") logger: ILoggerService
    ) {
        this.db = firebaseAdmin.getFirestore();
        this.logger = logger;
    }

    /**
     * ドキュメントを一括でセット（新規作成または上書き）
     * @param collectionName Firestoreのコレクション名
     * @param documents ドキュメントの配列（idとデータ）
     */
    async batchSet<T extends WithFieldValue<DocumentData>>(
        collectionName: string,
        documents: { id: string; data: T }[]
    ): Promise<void> {
        const batch = this.db.batch();
        const collectionRef = this.db.collection(collectionName);

        documents.forEach(doc => {
            const docRef = collectionRef.doc(doc.id);
            batch.set(docRef, doc.data);
        });

        try {
            await batch.commit();
            this.logger.info(`Batch set completed for collection: ${collectionName}`);
        } catch (error) {
            this.logger.error(`Batch set failed for collection: ${collectionName}`, { error });
            throw error;
        }
    }

    /**
     * ドキュメントを一括で更新
     * @param collectionName Firestoreのコレクション名
     * @param documents ドキュメントの配列（idと更新データ）
     */
    async batchUpdate<T extends DocumentData>(
        collectionName: string,
        documents: { id: string; data: UpdateData<T> }[]
    ): Promise<void> {
        const batch = this.db.batch();
        const collectionRef = this.db.collection(collectionName);

        documents.forEach(doc => {
            const docRef = collectionRef.doc(doc.id);
            batch.update(docRef, doc.data);
        });

        try {
            await batch.commit();
            this.logger.info(`Batch update completed for collection: ${collectionName}`);
        } catch (error) {
            this.logger.error(`Batch update failed for collection: ${collectionName}`, { error });
            throw error;
        }
    }

    /**
     * ドキュメントを一括で削除
     * @param collectionName Firestoreのコレクション名
     * @param ids ドキュメントIDの配列
     */
    async batchDelete(collectionName: string, ids: string[]): Promise<void> {
        const batch = this.db.batch();
        const collectionRef = this.db.collection(collectionName);

        ids.forEach(id => {
            const docRef = collectionRef.doc(id);
            batch.delete(docRef);
        });

        try {
            await batch.commit();
            this.logger.info(`Batch delete completed for collection: ${collectionName}`);
        } catch (error) {
            this.logger.error(`Batch delete failed for collection: ${collectionName}`, { error });
            throw error;
        }
    }
}

// --- use case ---
// import { BatchOperations } from "@/utils/batchOperations";
// import { ProblemResult } from "@/schemas/problemSchemas";
// import { LoggerService } from "@/services/loggerService";

// class ProblemResultService {
//     constructor(
//         private batchOperations: BatchOperations,
//         private logger: LoggerService
//     ) {}

//     async saveMultipleResults(userId: string, results: { type: string; data: ProblemResult[] }[]): Promise<void> {
//         try {
//             const operations = results.flatMap(({ type, data }) =>
//                 data.map(result => ({
//                     id: result.problemId,
//                     data: result,
//                     collectionName: `users/${userId}/problemResultsType${type}`
//                 }))
//             );

//             for (const { collectionName, data } of operations) {
//                 await this.batchOperations.batchSet(collectionName, data.map(item => ({ id: item.problemId, data: item })));
//             }

//             this.logger.info("Successfully saved multiple problem results.");
//         } catch (error) {
//             this.logger.error("Failed to save multiple problem results.", { error });
//             throw error;
//         }
//     }
// }
