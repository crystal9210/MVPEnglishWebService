"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { container } from "@/containers/diContainer";
import { ActivityManagerInterface } from "@/interfaces/components/managers/IActivityManager";
import { ActivitySession } from "@/domain/entities/ActivitySession";
import { UserHistoryItem } from "@/domain/entities/userHistoryItem";

/**
 * ActivityContextProps
 *
 * ActivityContext が提供する値の型定義。
 * セッションの状態と操作メソッドを含む。
 */
interface ActivityContextProps {
    session: ActivitySession | null;
    startSession: (session: ActivitySession) => Promise<void>;
    endSession: () => Promise<void>;
    submitAnswer: (historyItem: UserHistoryItem) => Promise<void>;
}

/**
 * ActivityContext
 *
 * Reactのコンテキストオブジェクトを作成。
 * ActivityContextProps 型の値を提供。
 */
const ActivityContext = createContext<ActivityContextProps | undefined>(undefined);

/**
 * ActivityProvider
 *
 * ActivityContext.Provider をラップし、コンテキストの値を管理。
 * ActivityManager を介してセッションの状態を管理・操作する。
 *
 * @param children - プロバイダーの子要素
 */
export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const activityManager: ActivityManagerInterface = container.resolve<ActivityManagerInterface>("IActivityManager");

    const [session, setSession] = useState<ActivitySession | null>(activityManager.getCurrentSession());

    /**
     * セッション開始ハンドラー
     *
     * @param session - 開始するセッションのActivitySessionオブジェクト
     */
    const startSessionHandler = async (session: ActivitySession) => {
        try {
        await activityManager.startSession(session);
        setSession(session);
        } catch (error) {
        console.error("Failed to start session", error);
        // 必要に応じてUIにフィードバックを提供
        }
    };

    /**
     * セッション終了ハンドラー
     */
    const endSessionHandler = async () => {
        if (!session) return;
        try {
        await activityManager.endSession(session.sessionId);
        setSession(null);
        } catch (error) {
        console.error("Failed to end session", error);
        // 必要に応じてUIにフィードバックを提供
        }
    };

    /**
     * 回答提出ハンドラー
     *
     * @param historyItem - 提出するUserHistoryItemオブジェクト
     */
    const submitAnswerHandler = async (historyItem: UserHistoryItem) => {
        if (!session) return;
        try {
        await activityManager.submitAnswer(session.sessionId, historyItem);
        // 必要に応じてセッションの再取得や更新
        } catch (error) {
        console.error("Failed to submit answer", error);
        // 必要に応じてUIにフィードバックを提供
        }
    };

    return (
        <ActivityContext.Provider value={{
        session,
        startSession: startSessionHandler,
        endSession: endSessionHandler,
        submitAnswer: submitAnswerHandler,
        }}>
        {children}
        </ActivityContext.Provider>
    );
};

/**
 * useActivity
 *
 * ActivityContext を利用するためのカスタムフック。
 * コンテキストが未定義の場合はエラーをスロー。
 *
 * @returns ActivityContextProps 型のコンテキスト値
 */
export const useActivity = (): ActivityContextProps => {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error('useActivity must be used within an ActivityProvider');
    }
    return context;
};
