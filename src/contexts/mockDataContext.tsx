"use client";
import React, { createContext, useContext, ReactNode, useState } from 'react';
import {
    mockGoals,
    mockProblemSets,
    mockSessions,
    mockHistory,
    mockNotifications,
    GoalWithId,
    ProblemSetWithId,
    SessionWithId,
    HistoryWithId,
    NotificationWithId
} from '@/sample_datasets/v1/goals';

interface MockDataContextProps {
    goals: GoalWithId[];
    problemSets: ProblemSetWithId[];
    sessions: SessionWithId[];
    history: HistoryWithId[];
    notifications: NotificationWithId[];
    addGoal: (goal: GoalWithId) => void;
    // 他のデータに対する追加・更新関数も必要に応じて追加
}

const MockDataContext = createContext<MockDataContextProps | undefined>(undefined);

export const MockDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [goals, setGoals] = useState<GoalWithId[]>(mockGoals);
    const [problemSets, setProblemSets] = useState<ProblemSetWithId[]>(mockProblemSets);
    const [sessions, setSessions] = useState<SessionWithId[]>(mockSessions);
    const [history, setHistory] = useState<HistoryWithId[]>(mockHistory);
    const [notifications, setNotifications] = useState<NotificationWithId[]>(mockNotifications);

    const addGoal = (goal: GoalWithId) => {
        setGoals(prevGoals => [...prevGoals, goal]);
    };

    // 他のデータに対する追加・更新関数もここに実装可能

    return (
        <MockDataContext.Provider value={{ goals, problemSets, sessions, history, notifications, addGoal }}>
            {children}
        </MockDataContext.Provider>
    );
};

export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (!context) {
        throw new Error('useMockData must be used within a MockDataProvider');
    }
    return context;
};
