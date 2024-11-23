// app/grammar/dashboard/_components/mockData.ts

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

// 過去の取り組み履歴データ
export const mockActivities: Activity[] = [
  { date: '2024-01-01', completed: 5, total: 10 },
  { date: '2024-02-01', completed: 7, total: 10 },
  { date: '2024-03-01', completed: 6, total: 10 },
  { date: '2024-04-01', completed: 8, total: 10 },
  { date: '2024-05-01', completed: 9, total: 10 },
  { date: '2024-06-01', completed: 10, total: 10 },
];

// 最新の履歴一覧データ
export const mockHistory: HistoryItem[] = [
  { id: '1', unit: 'Adverbs', date: '2024-06-10', score: 8 },
  { id: '2', unit: 'Comparatives and Superlatives', date: '2024-06-05', score: 7 },
  { id: '3', unit: 'Demonstratives', date: '2024-06-01', score: 9 },
];

// TODOリストデータ
export const mockTodos: TodoItem[] = [
  { id: '1', task: 'Review past quizzes', completed: false },
  { id: '2', task: 'Create new quiz questions', completed: false },
  { id: '3', task: 'Update grammar lists', completed: true },
];

// 目標リストデータ
export const mockGoals: GoalItem[] = [
  { id: '1', task: 'Master all grammar units', category: '長期' },
  { id: '2', task: 'Achieve 90% score on quizzes', category: '中期' },
  { id: '3', task: 'Complete daily grammar exercises', category: '短期' },
  { id: '4', task: 'Expand vocabulary by 500 words', category: '中期' },
];
