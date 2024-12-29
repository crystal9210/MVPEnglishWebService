import { LLMService } from "@/domain/services/serverSide/LLMService";

/**
 * EmbeddingDoc: ベクトル埋め込みを持つ文書のデータ構造
 */
export interface EmbeddingDoc {
    id: string;
    text: string;
    embedding: number[]; // >> vector
}

/**
 * 例: インメモリで保持する文書とそのembedding
 * 実際にはDB/Pinecone/Supabaseなどに格納されることが多いらしい
 */
const sampleEmbeddingDocs: EmbeddingDoc[] = [
    {
        id: "doc1",
        text: "This is a sample text about grammar rules in English.",
        embedding: [0.1, 0.2, 0.3], // ダミー
    },
    {
        id: "doc2",
        text: "Advanced writing techniques can help you communicate effectively.",
        embedding: [0.9, 0.8, 0.7],
    },
    {
        id: "doc3",
        text: "Reading comprehension is an essential skill for language learning.",
        embedding: [0.2, 0.5, 0.2],
    },
];

/**
 * cosSim: ２つのベクトルのコサイン類似度を計算
 */
function cosSim(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error(
            `Vector dimension mismatch: ${vecA.length} vs ${vecB.length}`
        );
    }
    const dot = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((acc, v) => acc + v * v, 0));
    const normB = Math.sqrt(vecB.reduce((acc, v) => acc + v * v, 0));

    return normA === 0 || normB === 0 ? 0 : dot / (normA * normB);
}

/**
 * Mock関数: query文字列をembeddingに変換
 * 本来は openai.embeddings.create({ model: 'text-embedding-ada-002', input: query }) などを用いる
 */
async function getEmbeddingForQuery(query: string): Promise<number[]> {
    // ダミーで固定vector or ランダムを返す
    // (実際には LLMService経由で embeddings API を叩く等)
    return [0.5, 0.5, 0.5];
}

/**
 * ragSearchEmbeddings:
 *   1. query を embedding化
 *   2. 既存 embeddingDocs との cosSim を計算
 *   3. 上位 topK の doc を返す
 *
 * @param llmService - LLMService インスタンス
 * @param query - 検索クエリ
 * @param topK - 上位K件を返す
 * @param embeddingDocs - 埋め込み文書の配列
 * @returns 上位K件の EmbeddingDoc 配列
 */
export async function ragSearchEmbeddings(
    llmService: LLMService,
    query: string,
    topK = 3,
    embeddingDocs: EmbeddingDoc[] = sampleEmbeddingDocs
): Promise<EmbeddingDoc[]> {
    // query埋め込み取得
    const queryEmbedding = await llmService.getEmbedding(query);

    // cosSimを計算
    const scored = embeddingDocs.map((doc) => ({
        doc,
        score: cosSim(doc.embedding, queryEmbedding),
    }));

    // 類似度が高い順にsort→topK
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map((s) => s.doc);
}
