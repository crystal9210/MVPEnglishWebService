// app/dashboard/_components/problemHistoryMock.ts

export type ProblemHistory = {
  id: string;
  problem: string;
  answer: string;
  options: string[];
  details: string;
  isCorrect: boolean;
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  startDate: string;    // ISO形式の日時文字列
  endDate: string;      // ISO形式の日時文字列
  memo: string;
};

export const problemHistoryMock: ProblemHistory[] = [
  {
    id: "1",
    problem: "Choose the correct adverb: 'She sings ___.'",
    answer: "Beautifully (美しく)",
    options: [
      "Beautifully (美しく)",
      "Beautiful (美しい)",
      "Beautify (美化する)"
    ],
    details: "'Beautifully' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 5,
    correctCount: 4,
    wrongCount: 1,
    startDate: "2023-11-20T10:00:00Z",
    endDate: "2023-11-20T10:05:00Z",
    memo: "正解！文脈に合っている。",
  },
  {
    id: "2",
    problem: "Choose the correct adverb: 'He ran ___.'",
    answer: "Quickly (速く)",
    options: [
      "Quick (速い)",
      "Quickly (速く)",
      "Quicker (より速い)"
    ],
    details: "'Quickly' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 3,
    correctCount: 3,
    wrongCount: 0,
    startDate: "2023-11-21T11:00:00Z",
    endDate: "2023-11-21T11:03:00Z",
    memo: "正解！素早い動作を表現。",
  },
  {
    id: "3",
    problem: "Choose the correct adverb: 'They arrived ___.'",
    answer: "Late (遅く)",
    options: [
      "Lately (最近)",
      "Late (遅く)",
      "Later (後で)"
    ],
    details: "'Late' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 4,
    correctCount: 3,
    wrongCount: 1,
    startDate: "2023-11-22T09:30:00Z",
    endDate: "2023-11-22T09:35:00Z",
    memo: "時間に遅れて到着した。",
  },
  {
    id: "4",
    problem: "Choose the correct adverb: 'She speaks English ___.'",
    answer: "Fluently (流暢に)",
    options: [
      "Fluent (流暢な)",
      "Fluently (流暢に)",
      "Fluency (流暢さ)"
    ],
    details: "'Fluently' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 6,
    correctCount: 5,
    wrongCount: 1,
    startDate: "2023-11-23T14:20:00Z",
    endDate: "2023-11-23T14:25:00Z",
    memo: "英語を流暢に話せる。",
  },
  {
    id: "5",
    problem: "Choose the correct adverb: 'He completed the task ___.'",
    answer: "Easily (簡単に)",
    options: [
      "Easy (簡単な)",
      "Easily (簡単に)",
      "Ease (簡単さ)"
    ],
    details: "'Easily' は動詞を修飾する副詞です。",
    isCorrect: false,
    totalAttempts: 2,
    correctCount: 2,
    wrongCount: 0,
    startDate: "2023-11-24T08:15:00Z",
    endDate: "2023-11-24T08:20:00Z",
    memo: "タスクを簡単に完了した。",
  },
  {
    id: "6",
    problem: "Choose the correct adverb: 'She dances ___.'",
    answer: "Gracefully (優雅に)",
    options: [
      "Grace (優雅)",
      "Gracefully (優雅に)",
      "Gracious (優雅な)"
    ],
    details: "'Gracefully' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 4,
    correctCount: 4,
    wrongCount: 0,
    startDate: "2023-11-25T16:45:00Z",
    endDate: "2023-11-25T16:50:00Z",
    memo: "優雅なダンスを披露した。",
  },
  {
    id: "7",
    problem: "Choose the correct adverb: 'They worked ___.'",
    answer: "Hard (熱心に)",
    options: [
      "Hard (熱心に)",
      "Hardly (ほとんど～ない)",
      "Harden (固くする)"
    ],
    details: "'Hard' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 5,
    correctCount: 5,
    wrongCount: 0,
    startDate: "2023-11-26T12:10:00Z",
    endDate: "2023-11-26T12:15:00Z",
    memo: "熱心に働いた。",
  },
  {
    id: "8",
    problem: "Choose the correct adverb: 'He listens ___.'",
    answer: "Attentively (注意深く)",
    options: [
      "Attentive (注意深い)",
      "Attentively (注意深く)",
      "Attention (注意)"
    ],
    details: "'Attentively' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 3,
    correctCount: 2,
    wrongCount: 1,
    startDate: "2023-11-27T07:50:00Z",
    endDate: "2023-11-27T07:55:00Z",
    memo: "注意深く聞いた。",
  },
  {
    id: "9",
    problem: "Choose the correct adverb: 'She arrived ___.'",
    answer: "Promptly (迅速に)",
    options: [
      "Prompt (迅速な)",
      "Promptly (迅速に)",
      "Prompting (促す)"
    ],
    details: "'Promptly' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 4,
    correctCount: 3,
    wrongCount: 1,
    startDate: "2023-11-28T13:25:00Z",
    endDate: "2023-11-28T13:30:00Z",
    memo: "迅速に到着した。",
  },
  {
    id: "10",
    problem: "Choose the correct adverb: 'He ___ accepted the invitation.'",
    answer: "Graciously (丁重に)",
    options: [
      "Gracious (丁重な)",
      "Graciously (丁重に)",
      "Grace (優雅)"
    ],
    details: "'Graciously' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 2,
    correctCount: 2,
    wrongCount: 0,
    startDate: "2023-11-29T15:40:00Z",
    endDate: "2023-11-29T15:45:00Z",
    memo: "丁重に招待を受け入れた。",
  },
  {
    id: "11",
    problem: "Choose the correct adverb: 'She reads ___.'",
    answer: "Quickly (速く)",
    options: [
      "Quick (速い)",
      "Quickly (速く)",
      "Quickest (最も速い)"
    ],
    details: "'Quickly' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 3,
    correctCount: 2,
    wrongCount: 1,
    startDate: "2023-11-30T09:05:00Z",
    endDate: "2023-11-30T09:10:00Z",
    memo: "速く読んだ。",
  },
  {
    id: "12",
    problem: "Choose the correct adverb: 'He solved the problem ___.'",
    answer: "Easily (簡単に)",
    options: [
      "Easy (簡単な)",
      "Easily (簡単に)",
      "Ease (簡単さ)"
    ],
    details: "'Easily' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 4,
    correctCount: 4,
    wrongCount: 0,
    startDate: "2023-12-01T10:30:00Z",
    endDate: "2023-12-01T10:35:00Z",
    memo: "簡単に問題を解決した。",
  },
  {
    id: "13",
    problem: "Choose the correct adverb: 'They waited ___.'",
    answer: "Patiently (忍耐強く)",
    options: [
      "Patient (忍耐強い)",
      "Patiently (忍耐強く)",
      "Patience (忍耐)"
    ],
    details: "'Patiently' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 3,
    correctCount: 2,
    wrongCount: 1,
    startDate: "2023-12-02T14:55:00Z",
    endDate: "2023-12-02T15:00:00Z",
    memo: "忍耐強く待った。",
  },
  {
    id: "14",
    problem: "Choose the correct adverb: 'She writes ___.'",
    answer: "Neatly (きれいに)",
    options: [
      "Neat (きれいな)",
      "Neatly (きれいに)",
      "Neatness (きれいさ)"
    ],
    details: "'Neatly' は動詞を修飾する副詞です。",
    isCorrect: false,
    totalAttempts: 2,
    correctCount: 2,
    wrongCount: 0,
    startDate: "2023-12-03T11:20:00Z",
    endDate: "2023-12-03T11:25:00Z",
    memo: "きれいに書いた。",
  },
  {
    id: "15",
    problem: "Choose the correct adverb: 'He speaks ___.'",
    answer: "Softly (優しく)",
    options: [
      "Soft (優しい)",
      "Softly (優しく)",
      "Softness (優しさ)"
    ],
    details: "'Softly' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 4,
    correctCount: 3,
    wrongCount: 1,
    startDate: "2023-12-04T16:10:00Z",
    endDate: "2023-12-04T16:15:00Z",
    memo: "優しく話した。",
  },
  {
    id: "16",
    problem: "Choose the correct adverb: 'They answered the questions ___.'",
    answer: "Correctly (正しく)",
    options: [
      "Correct (正しい)",
      "Correctly (正しく)",
      "Correction (訂正)"
    ],
    details: "'Correctly' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 3,
    correctCount: 3,
    wrongCount: 0,
    startDate: "2023-12-05T13:45:00Z",
    endDate: "2023-12-05T13:50:00Z",
    memo: "正しく質問に答えた。",
  },
  {
    id: "17",
    problem: "Choose the correct adverb: 'She sings ___.'",
    answer: "Beautifully (美しく)",
    options: [
      "Beautiful (美しい)",
      "Beautifully (美しく)",
      "Beautify (美化する)"
    ],
    details: "'Beautifully' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 2,
    correctCount: 2,
    wrongCount: 0,
    startDate: "2023-12-06T10:50:00Z",
    endDate: "2023-12-06T10:55:00Z",
    memo: "美しく歌った。",
  },
  {
    id: "18",
    problem: "Choose the correct adverb: 'He drives ___.'",
    answer: "Carefully (注意深く)",
    options: [
      "Careful (注意深い)",
      "Carefully (注意深く)",
      "Care (注意)"
    ],
    details: "'Carefully' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 3,
    correctCount: 3,
    wrongCount: 0,
    startDate: "2023-12-07T09:15:00Z",
    endDate: "2023-12-07T09:20:00Z",
    memo: "注意深く運転した。",
  },
  {
    id: "19",
    problem: "Choose the correct adverb: 'They played ___.'",
    answer: "Happily (幸せに)",
    options: [
      "Happy (幸せな)",
      "Happily (幸せに)",
      "Happiness (幸せ)"
    ],
    details: "'Happily' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 4,
    correctCount: 4,
    wrongCount: 0,
    startDate: "2023-12-08T14:30:00Z",
    endDate: "2023-12-08T14:35:00Z",
    memo: "幸せに遊んだ。",
  },
  {
    id: "20",
    problem: "Choose the correct adverb: 'She finished the work ___.'",
    answer: "Efficiently (効率的に)",
    options: [
      "Efficient (効率的な)",
      "Efficiently (効率的に)",
      "Efficiency (効率)"
    ],
    details: "'Efficiently' は動詞を修飾する副詞です。",
    isCorrect: true,
    totalAttempts: 5,
    correctCount: 5,
    wrongCount: 0,
    startDate: "2023-12-09T11:40:00Z",
    endDate: "2023-12-09T11:45:00Z",
    memo: "効率的に仕事を終えた。",
  },
];
