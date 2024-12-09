// src/sample_datasets/v1/goals.ts

import { Goal } from '@/schemas/goalSchemas';
import { ProblemSet } from '@/schemas/customProblemSetSchema';
import { Session } from '@/schemas/sessionSchemas';
import { History } from '@/schemas/historySchemas';
import { Notification } from '@/schemas/notificationSchema';

// 新しい型の定義
export type GoalWithId = { id: string } & Goal;
export type ProblemSetWithId = { id: string } & ProblemSet;
export type SessionWithId = { id: string } & Session;
export type HistoryWithId = { id: string } & History;
export type NotificationWithId = { id: string } & Notification;

// 拡充後のモックデータ
export const mockGoals: GoalWithId[] = [
  {
    id: 'goal1',
    type: 'short-term',
    criteria: {
      mode: 'iteration',
      details: {
        problemSetIds: ['ps1', 'ps2'],
        requiredIterations: 3,
      },
    },
    targetQuestions: 50,
    currentProgress: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
    iterationCount: 3,
    completedIterations: 1,
    deadlines: {
      reasonableDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 一週間後
      bestDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 三日後
    },
    perPeriodTargets: {
      enabled: true,
      period: 'daily',
      targetRate: 20, // 20%
    },
  },
  {
    id: 'goal2',
    type: 'medium-term',
    criteria: {
      mode: 'score',
      details: {
        serviceId: 'service1',
        categoryId: 'category1',
        stepId: 'step1',
        minimumScore: 80,
      },
    },
    targetQuestions: 100,
    currentProgress: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
    deadlines: {
      reasonableDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 一ヶ月後
      bestDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15日後
    },
    perPeriodTargets: {
      enabled: false,
    },
  },
  {
    id: 'goal3',
    type: 'long-term',
    criteria: {
      mode: 'count',
      details: {
        serviceId: 'service2',
        categoryId: null,
        stepId: null,
        requiredCount: 200,
      },
    },
    targetQuestions: 200,
    currentProgress: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
    deadlines: {
      reasonableDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 三ヶ月後
      bestDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 二ヶ月後
    },
    perPeriodTargets: {
      enabled: true,
      period: 'weekly',
      targetRate: 25, // 25%
    },
  },
  {
    id: 'goal4',
    type: 'short-term',
    criteria: {
      mode: 'time',
      details: {
        serviceId: 'service3',
        categoryId: 'category3',
        stepId: 'step3',
        requiredTime: 3600, // 1時間
      },
    },
    targetQuestions: 30,
    currentProgress: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
    deadlines: {
      reasonableDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 二週間後
      bestDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 一週間後
    },
    perPeriodTargets: {
      enabled: false,
    },
  },
  {
    id: 'goal5',
    type: 'medium-term',
    criteria: {
      mode: 'score',
      details: {
        serviceId: 'service2',
        categoryId: 'category2',
        stepId: 'step2',
        minimumScore: 85,
      },
    },
    targetQuestions: 120,
    currentProgress: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active',
    deadlines: {
      reasonableDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 一ヶ月半後
      bestDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 二週間後
    },
    perPeriodTargets: {
      enabled: true,
      period: 'daily',
      targetRate: 15, // 15%
    },
  },
  // 他のモックデータを必要に応じて追加
];

export const mockProblemSets: ProblemSetWithId[] = [
  {
    id: 'ps1',
    serviceId: 'service1',
    categoryId: 'category1',
    stepId: 'step1',
    problemIds: ['p1', 'p2', 'p3', 'p6'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ps2',
    serviceId: 'service1',
    categoryId: 'category2',
    stepId: 'step2',
    problemIds: ['p4', 'p5', 'p7'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ps3',
    serviceId: 'service2',
    categoryId: null,
    stepId: null,
    problemIds: ['p8', 'p9', 'p10', 'p11'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ps4',
    serviceId: 'service3',
    categoryId: 'category3',
    stepId: 'step3',
    problemIds: ['p12', 'p13', 'p14'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // 他のモックデータを必要に応じて追加
];

export const mockSessions: SessionWithId[] = [
  {
    id: 'session1',
    goalId: 'goal1',
    startedAt: new Date(),
    endedAt: null,
    problems: [
      {
        problemId: 'p1',
        result: 'correct',
        timeSpent: 45,
        attempts: 1,
        notes: [],
      },
      {
        problemId: 'p2',
        result: 'incorrect',
        timeSpent: 60,
        attempts: 2,
        notes: ['理解不足'],
      },
      {
        problemId: 'p3',
        result: 'correct',
        timeSpent: 50,
        attempts: 1,
        notes: [],
      },
    ],
    status: 'active',
  },
  {
    id: 'session2',
    goalId: 'goal2',
    startedAt: new Date(),
    endedAt: new Date(),
    problems: [
      {
        problemId: 'p4',
        result: 'correct',
        timeSpent: 30,
        attempts: 1,
        notes: [],
      },
      {
        problemId: 'p5',
        result: 'correct',
        timeSpent: 25,
        attempts: 1,
        notes: [],
      },
    ],
    status: 'completed',
  },
  // 他のモックデータを必要に応じて追加
];

export const mockHistory: HistoryWithId[] = [
  {
    id: 'history1',
    sessionId: 'session1',
    goalId: 'goal1',
    completedAt: new Date(),
    achievement: false,
  },
  {
    id: 'history2',
    sessionId: 'session2',
    goalId: 'goal2',
    completedAt: new Date(),
    achievement: true,
  },
  // 他のモックデータを必要に応じて追加
];

export const mockNotifications: NotificationWithId[] = [
  {
    id: 'notif1',
    type: 'achievement',
    message: '目標を1周達成しました！',
    read: false,
    createdAt: new Date(),
  },
  {
    id: 'notif2',
    type: 'reminder',
    message: '今日の目標達成率を確認しましょう。',
    read: false,
    createdAt: new Date(),
  },
  {
    id: 'notif3',
    type: 'new_content',
    message: '新しい問題セットが追加されました。',
    read: true,
    createdAt: new Date(),
  },
  // 他のモックデータを必要に応じて追加
];
