// 責任: ビジネスロジック処理、APIサービス層・indexedDB永続化層との連携
import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { ApiService } from "@/interfaces/clientSide/services/memoApiService.ts";
import { toast } from "react-toastify";
import { IDBPDatabase } from "idb";
import { IMemoRepository } from "@/interfaces/clientSide/repositories/IMemoRepository";
// TODO Firestoreに対するアクセスや制御に関しては後で追加

export class MemoManager {
    private memoRepo: IMemoRepository;
    constructor(memoRepo: IMemoRepository) {
        this.memoRepo = memoRepo;
    }

    async createMemo(content: string, tags: string[]): Promise<void> {
        const memo: Memo = {
            id: this.generateId();
        }
    }

    async autoDeleteExpiredMemoList(): Promise<void> {
        const trashedMemoList: Memo[] = await this.db.getAll("trashedMemoList");
        const now = new Date();
        const timeOfAWeekBefore = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const deletionPromises = trashedMemoList.map(async (memo) => {
            if (memo.deletedAt && memo.deletedAt < timeOfAWeekBefore) {
                try {
                await this.memoRepo.deleteMemo("trashedMemoList", memo.id);

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

    // TODO ID生成系のユーティリティ関数を実装し、抽象化、各リポジトリおよび永続化層オブジェクトに対応した配列をサーバサイドで保持・キャッシングするように実装し、アクセス制御を厳密化 + マネージャによりRBACを設計・実装・セキュリティ対策、マネージャにより処理の抽象化
    // 優先度が低いので仮としてプライベートメソッド実装
    private generateId(): string {
        return "_" + Math.random().toString(36).substring(2, 9);
    }
}
