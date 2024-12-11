import { IDBPDatabase } from "idb";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { promise } from "zod";
// TODO Firestoreに対するアクセスや制御に関しては後で追加

export class MemoManager {
    private db: IDBPDatabase<unknown>; // TODO handle unkonwn type
    private userId: string;

    constructor(db: IDBPDatabase<unknown>, userId: string) {
        this.db = db;
        this.userId = userId;
    }

    async autoDeleteExpiredMemoList(): Promise<void> {
        const trashedMemoList: Memo[] = await this.db.getAll("trashedMemoList");
        const now = new Date();
        const timeOfAWeekBefore = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const deletionPromises = trashedMemoList.map(async (memo) => {
            if (memo.deletedAt && memo.deletedAt < timeOfAWeekBefore) {
                try {
                await this.db.delete("trashedMemoList", memo.id);

                // const memoDoc = doc(dbFirestore, "memoList", memo.id);
                // await deleteDoc(memoDoc);
                } catch (error) {
                    // TODO エラーハンドリングとしてクライアントサイドに対して特定のエラー内容のリストとそれに対する処理をするクライアントサイド用マネージャを抽象化・具体的な実装として実現するが、それに対して追加としてfirestoreなどへの処理などサーバサイドへの処理は現時点ではステップ的にスコープを限定して実装することでスプリントを分けて品質の担保をしやすくする
                    console.error(`メモID ${memo.id} の自動サッ駆除に失敗しました:`, error);
                }
            }
        });

        await Promise.all(deletionPromises); // TODO ここで返すように実装しているのは何故か
    }
}
