// 設計
// useStateフックを使用、ActivityManagerインスタンスを生成・ライフサイクル管理
// useEffect: ActivityManagerセッションの状態変更をリッスン、反映
// 操作メソッド

// useEffect:クライアントサイドでActivityManagerをインスタンス化
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ActivityManager } from "@/app/_components/managers/activityManager";
import { IClientActivitySession } from "@/schemas/activity/clientSide/clientActivitySessionSchema";
import { ClientActivitySessionHistoryItem } from "@/domain/entities/clientSide/activitySessionHistoryItem";

interface ClientActivitySession extends IClientActivitySession{}

interface ActivityContextProps {
    session: ClientActivitySession | null;
    startSession: (session: ClientActivitySession) => Promise<void>;
    endSession: () => Promise<void>;
    submitAnswer: (historyItem: ClientActivitySessionHistoryItem) => Promise<void>;
    getSessionHistory: (sessionId: string) => Promise<ClientActivitySessionHistoryItem[]>;
    getAllSessions: () => Promise<ClientActivitySession[]>;
    deleteSession: (sessionId: string) => Promise<void>;
    updateSession: (sessionId: string, updatedSession: Partial<ClientActivitySession>) => Promise<void>;
    getAllHistory: () => Promise<{ id: number; sessionId: string; historyItem: ClientActivitySessionHistoryItem }[]>;
    deleteHistoryItem: (id: number) => Promise<void>;
    updateHistoryItem: (id: number, updatedHistoryItem: Partial<ClientActivitySessionHistoryItem>) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextProps | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<ClientActivitySession | null>(null);
    const [activityManager, setActivityManager] = useState<ActivityManager | null>(null);

    useEffect(() => {
        // クライアントサイドでのみ ActivityManager を初期化
        const manager = new ActivityManager();
        setActivityManager(manager);
        const unsubscribe = manager.subscribe(setSession);
        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        console.log("ActivityContext session state updated:", session);
    }, [session]);

    const startSession = async (session: ClientActivitySession) => {
        if (activityManager) {
            await activityManager.startSession(session);
        }
    };

    const endSession = async () => {
        if (activityManager) {
            await activityManager.endSession();
        }
    };

    const submitAnswer = async (historyItem: ClientActivitySessionHistoryItem) => {
        if (activityManager) {
            await activityManager.submitAnswer(historyItem);
        }
    };

    const getSessionHistory = async (sessionId: string): Promise<ClientActivitySessionHistoryItem[]> => {
        if (activityManager) {
            return await activityManager.getSessionHistory(sessionId);
        }
        return [];
    };

    // 追加メソッドの定義
    const getAllSessions = async (): Promise<ClientActivitySession[]> => {
        if (activityManager) {
            return await activityManager.getAllSessions();
        }
        return [];
    };

    const deleteSessionMethod = async (sessionId: string): Promise<void> => {
        if (activityManager) {
            await activityManager.deleteSession(sessionId);
        }
    };

    const updateSessionMethod = async (sessionId: string, updatedSession: Partial<ClientActivitySession>): Promise<void> => {
        if (activityManager) {
            await activityManager.updateSession(sessionId, updatedSession);
        }
    };

    const getAllHistory = async (): Promise<{ id: number; sessionId: string; historyItem: ClientActivitySessionHistoryItem }[]> => {
        if (activityManager) {
            return await activityManager.getAllHistory();
        }
        return [];
    };

    const deleteHistoryItemMethod = async (id: number): Promise<void> => {
        if (activityManager) {
            await activityManager.deleteHistoryItem(id);
        }
    };

    const updateHistoryItemMethod = async (id: number, updatedHistoryItem: Partial<ClientActivitySessionHistoryItem>): Promise<void> => {
        if (activityManager) {
            await activityManager.updateHistoryItem(id, updatedHistoryItem);
        }
    };

    if (!activityManager) {
        // ActivityManager の初期化中はローディング表示
        return <div>Loading...</div>;
    }

    return (
        <ActivityContext.Provider
            value={{
                session,
                startSession,
                endSession,
                submitAnswer,
                getSessionHistory,
                getAllSessions,
                deleteSession: deleteSessionMethod,
                updateSession: updateSessionMethod,
                getAllHistory,
                deleteHistoryItem: deleteHistoryItemMethod,
                updateHistoryItem: updateHistoryItemMethod,
            }}
        >
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
