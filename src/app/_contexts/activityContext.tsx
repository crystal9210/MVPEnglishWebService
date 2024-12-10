// 設計
// useStateフックを使用、ActivityManagerインスタンスを生成・ライフサイクル管理
// useEffect: ActivityManagerセッションの状態変更をリッスン、反映
// 操作メソッド

"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ActivityManager } from "@/_components/managers/activityManager";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { UserHistoryItem } from "@/domain/entities/userHistoryItem";

interface ActivityContextProps {
    session: ClientActivitySession | null;
    startSession: (session: ClientActivitySession) => Promise<void>;
    endSession: () => Promise<void>;
    submitAnswer: (historyItem: UserHistoryItem) => Promise<void>;
    getSessionHistory: (sessionId: string) => Promise<UserHistoryItem[]>;
}

const ActivityContext = createContext<ActivityContextProps | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<ClientActivitySession | null>(null);
    const [activityManager] = useState<ActivityManager>(() => new ActivityManager());

    useEffect(() => {
        const unsubscribe = activityManager.subscribe(setSession);
        return () => {
            unsubscribe();
        };
    }, [activityManager]);

    const startSession = async (session: ClientActivitySession) => {
        await activityManager.startSession(session);
    };

    const endSession = async () => {
        await activityManager.endSession();
    };

    const submitAnswer = async (historyItem: UserHistoryItem) => {
        await activityManager.submitAnswer(historyItem);
    };

    const getSessionHistory = async (sessionId: string): Promise<UserHistoryItem[]> => {
        return await activityManager.getSessionHistory(sessionId);
    };

    return (
        <ActivityContext.Provider value={{ session, startSession, endSession, submitAnswer, getSessionHistory }}>
            {children}
        </ActivityContext.Provider>
    );
};

export const useActivity = (): ActivityContextProps => {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error('useActivity must be used within an ActivityProvider');
    }
    return context;
};
