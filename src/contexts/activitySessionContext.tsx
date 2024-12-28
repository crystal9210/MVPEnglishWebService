/* eslint-disable no-unused-vars */
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ActivityManager } from "@/app/_components/activity/managers/activitySessionManager";
import { ActivitySession, SessionAttempt } from "@/schemas/activity/activitySessionSchema";
import { IIndexedDBActivitySessionRepository } from "@/interfaces/clientSide/repositories/IIdbActivitySessionRepository";
import { IndexedDBActivitySessionRepository } from "@/domain/repositories/idb/idbActivitySessionRepository";
import IndexedDBManager from "@/idb/index";
/**
 * Interface defining the properties and methods provided by the ActivityContext.
 */
interface ActivityContextProps {
    session: ActivitySession | null;
    startSession: (session: ActivitySession) => Promise<void>;
    endSession: () => Promise<void>;
    submitAnswer: (historyItem: SessionAttempt) => Promise<void>;
    getSessionHistory: (sessionId: string) => Promise<SessionAttempt[]>;
    getAllSessions: () => Promise<ActivitySession[]>;
    deleteSession: (sessionId: string) => Promise<void>;
    updateSession: (sessionId: string, updatedSession: Partial<ActivitySession>) => Promise<void>;
    getAllHistory: () => Promise<{ sessionId: string; historyItem: SessionAttempt }[]>;
    deleteHistoryItem: (sessionId: string, attemptId: string) => Promise<void>;
    updateHistoryItem: (sessionId: string, attemptId: string, updatedHistoryItem: Partial<SessionAttempt>) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextProps | undefined>(undefined);

/**
 * ActivityProvider component that provides activity session context to its children.
 * It initializes the ActivityManager with the IndexedDB repository and manages session state.
 */
export const ActivityProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<ActivitySession | null>(null);
    const [activityManager, setActivityManager] = useState<ActivityManager | null>(null);

    useEffect(() => {
        // Initialize IndexedDB repository using the singleton instance
        const idbManager = IndexedDBManager.getInstance();
        const idbRepository: IIndexedDBActivitySessionRepository = new IndexedDBActivitySessionRepository(idbManager);

        // Initialize ActivityManager with the repository
        const manager = new ActivityManager(idbRepository);
        setActivityManager(manager);

        // Subscribe to session state changes
        const unsubscribe = manager.subscribe(setSession);

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        console.log("ActivityContext session state updated:", session);
    }, [session]);

    /**
     * Starts a new activity session.
     * @param session - The ActivitySession to start.
     */
    const startSession = async (session: ActivitySession) => {
        if (activityManager) {
            await activityManager.startSession(session);
        }
    };

    /**
     * Ends the current activity session.
     */
    const endSession = async () => {
        if (activityManager) {
            await activityManager.endSession();
        }
    };

    /**
     * Submits an answer (SessionAttempt) to the current session.
     * @param historyItem - The SessionAttempt to submit.
     */
    const submitAnswer = async (historyItem: SessionAttempt) => {
        if (activityManager) {
            await activityManager.submitAnswer(historyItem);
        }
    };

    /**
     * Retrieves the history (attempts) of a specific session.
     * @param sessionId - The ID of the session.
     * @returns An array of SessionAttempt.
     */
    const getSessionHistory = async (sessionId: string): Promise<SessionAttempt[]> => {
        if (activityManager) {
            return await activityManager.getSessionHistory(sessionId);
        }
        return [];
    };

    /**
     * Retrieves all activity sessions.
     * @returns An array of ActivitySession.
     */
    const getAllSessions = async (): Promise<ActivitySession[]> => {
        if (activityManager) {
            return await activityManager.getAllSessions();
        }
        return [];
    };

    /**
     * Deletes a specific session.
     * @param sessionId - The ID of the session to delete.
     */
    const deleteSessionMethod = async (sessionId: string): Promise<void> => {
        if (activityManager) {
            await activityManager.deleteSession(sessionId);
        }
    };

    /**
     * Updates a specific session.
     * @param sessionId - The ID of the session to update.
     * @param updatedSession - The updates to apply to the session.
     */
    const updateSessionMethod = async (sessionId: string, updatedSession: Partial<ActivitySession>): Promise<void> => {
        if (activityManager) {
            await activityManager.updateSession(sessionId, updatedSession);
        }
    };

    /**
     * Retrieves all history (attempts) across all sessions.
     * @returns An array of objects containing sessionId and SessionAttempt.
     */
    const getAllHistory = async (): Promise<{ sessionId: string; historyItem: SessionAttempt }[]> => {
        if (activityManager) {
            return await activityManager.getAllHistory();
        }
        return [];
    };

    /**
     * Deletes a specific history item (SessionAttempt) from a session.
     * @param sessionId - The ID of the session containing the attempt.
     * @param attemptId - The ID of the attempt to delete.
     */
    const deleteHistoryItemMethod = async (sessionId: string, attemptId: string): Promise<void> => {
        if (activityManager) {
            await activityManager.deleteHistoryItem(sessionId, attemptId);
        }
    };

    /**
     * Updates a specific history item (SessionAttempt) within a session.
     * @param sessionId - The ID of the session containing the attempt.
     * @param attemptId - The ID of the attempt to update.
     * @param updatedHistoryItem - The updates to apply to the attempt.
     */
    const updateHistoryItemMethod = async (sessionId: string, attemptId: string, updatedHistoryItem: Partial<SessionAttempt>): Promise<void> => {
        if (activityManager) {
            await activityManager.updateHistoryItem(sessionId, attemptId, updatedHistoryItem);
        }
    };

    if (!activityManager) {
        // Display a loading state while ActivityManager is initializing
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

/**
 * Custom hook to use the ActivityContext.
 * @returns ActivityContextProps
 * @throws Error if used outside of ActivityProvider
 */
export const useActivity = (): ActivityContextProps => {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error("useActivity must be used within an ActivityProvider");
    }
    return context;
};
