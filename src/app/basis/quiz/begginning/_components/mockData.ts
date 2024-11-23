export type Question = {
  id: number;
  example: string;
  explanation: string;
  options: { text: string; images: string[] }[];
  answer: string;
};

export const questions: Question[] = [
  {
    id: 1,
    example: 'He walked ___ the next town.',
    explanation: '「to」は到達を表します。この場合、「隣町に到達した」という意味です。',
    options: [
      {
        text: 'to',
        images: ['/images/basis/to/1/question1_to_1.png', '/images/basis/to/1/question1_to_2.png'],
      },
      {
        text: 'for',
        images: ['/images/basis/to/1/question1_for_1.png', '/images/basis/to/1/question1_for_2.png'],
      },
    ],
    answer: 'to',
  },
  {
    id: 2,
    example: 'I cooked a special dinner ___ him.',
    explanation: '「for」は「方向性」を意味します。「彼のために」という目的を表します。',
    options: [
      {
        text: 'to',
        images: ['/images/basis/to/2/question2_to_1.png', '/images/basis/to/2/question2_to_2.png'],
      },
      {
        text: 'for',
        images: ['/images/basis/to/2/question2_for_1.png', '/images/basis/to/2/question2_for_2.png'],
      },
    ],
    answer: 'for',
  },
  {
    id: 3,
    example: 'The film moved me ___ tears.',
    explanation: '「to tears」は「涙を流すまでに至る」を表します。',
    options: [
      {
        text: 'to',
        images: ['/images/basis/to/3/question3_to_1.png', '/images/basis/to/3/question3_to_2.png'],
      },
      {
        text: 'for',
        images: ['/images/basis/to/3/question3_for_1.png', '/images/basis/to/3/question3_for_2.png'],
      },
    ],
    answer: 'to',
  },
  {
    id: 4,
    example: 'Our hotel can accommodate up ___ 300 guests.',
    explanation: '「up to」は「～まで」を意味します。',
    options: [
      {
        text: 'to',
        images: ['/images/basis/to/4/question4_to_1.png', '/images/basis/to/4/question4_to_2.png'],
      },
      {
        text: 'for',
        images: ['/images/basis/to/4/question4_for_1.png', '/images/basis/to/4/question4_for_2.png'],
      },
    ],
    answer: 'to',
  },
];
