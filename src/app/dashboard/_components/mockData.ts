// app/dashboard/_components/mockData.ts

export type Activity = {
  date: string;
  completed: number;
  total: number;
};

export type HistoryItem = {
  id: string;
  unit: string;
  date: string;
  score: number;
};

export type TodoItem = {
  id: string;
  task: string;
  completed: boolean;
};

export type GoalItem = {
  id: string;
  task: string;
  category: '短期' | '中期' | '長期';
};

// サービスごとの取り組み履歴データ
export const mockActivitiesPerService: Record<string, Activity[]> = {
  "英文法問題サービス": [
    { date: '2024-01-01', completed: 5, total: 10 },
    { date: '2024-02-01', completed: 7, total: 10 },
    // 他のデータ
  ],
  "英文問題サービス": [
    { date: '2024-01-01', completed: 3, total: 8 },
    { date: '2024-02-01', completed: 6, total: 8 },
    // 他のデータ
  ],
  // 他のサービスを追加
};

// サービスごとのTODOリストデータ
export const mockTodosPerService: Record<string, TodoItem[]> = {
  "英文法問題サービス": [
    { id: '1', task: '新しい問題を作成', completed: false },
    { id: '2', task: '既存の問題をレビュー', completed: true },
    // 他のタスク
  ],
  "英文問題サービス": [
    { id: '1', task: '問題集を更新', completed: false },
    { id: '2', task: 'ユーザーからのフィードバックを確認', completed: false },
    // 他のタスク
  ],
  // 他のサービスを追加
};

// サービスごとの目標リストデータ
export const mockGoalsPerService: Record<string, GoalItem[]> = {
  "英文法問題サービス": [
    { id: '1', task: '全ての単元をマスターする', category: '長期' },
    { id: '2', task: '毎週10問以上解く', category: '中期' },
    { id: '3', task: '毎日1問解く', category: '短期' },
    // 他の目標
  ],
  "英文問題サービス": [
    { id: '1', task: '500語の語彙を増やす', category: '中期' },
    { id: '2', task: '毎月20問の問題を解く', category: '中期' },
    { id: '3', task: '毎日5分間英語を勉強する', category: '短期' },
    // 他の目標
  ],
  // 他のサービスを追加
};
