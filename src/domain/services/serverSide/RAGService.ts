import { LLMService } from './LLMService';
import { ragSearchEmbeddings } from '@/utils/ai/ragRetriever';

/**
 * RAGService:
 *  1. ragSearchEmbeddingsで類似文書を取得
 *  2. LLMServiceに渡して回答生成
 */
export class RAGService {
  constructor(private llmService: LLMService) {}

  async retrieveAndGenerate(query: string, userContext: string): Promise<string> {
    // (1) Embeddings検索
    const relevantDocs = await ragSearchEmbeddings(this.llmService, query, 3);
    const contextSnippet = relevantDocs.map(d => d.text).join("\n\n");

    // (2) LLMにプロンプト注入
    const prompt = `Context:\n${contextSnippet}\nUserRequest:\n${userContext}\nAnswer:`;
    const answer = await this.llmService.generateCompletion(prompt, "gpt-3.5-turbo");
    return answer;
  }
}
