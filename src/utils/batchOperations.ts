import { Firestore, WithFieldValue, DocumentData } from "firebase-admin/firestore";
import { UpdateData } from "firebase-admin/firestore";
import { injectable, inject } from "tsyringe";
import { LoggerService } from "@/services/loggerService";

@injectable()
export class BatchOperations {
    private firestore: Firestore;
    private logger: LoggerService;

    constructor(
        @inject(Firestore) firestore: Firestore,
        @inject(LoggerService) logger: LoggerService
    ) {
        this.firestore = firestore;
        this.logger = logger;
    }

    /**
     * ドキュメントを一括でセット（新規作成または上書き）
     * @param collectionName Firestoreのコレクション名
     * @param documents ドキュメントの配列（idとデータ）
     */
    async batchSet<T extends WithFieldValue<DocumentData>>(collectionName: string, documents: { id: string, data: T }[]): Promise<void> {
        const batch = this.firestore.batch();
        const collectionRef = this.firestore.collection(collectionName);

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
        documents: { id: string; data: UpdateData<T> }[] // 型を UpdateData<T> に修正
    ): Promise<void> {
        const batch = this.firestore.batch();
        const collectionRef = this.firestore.collection(collectionName);

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
        const batch = this.firestore.batch();
        const collectionRef = this.firestore.collection(collectionName);

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
