// src/app/contexts/ActivityContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Session } from '../../domain/models/Session';
import { Problem } from '../../domain/models/Problem';
import { SessionHistory } from '../../domain/models/SessionHistory';
import { injectable, inject } from "tsyringe";
import { ActivityManagerInterface } from "@/interfaces/services/IActivityManager";
import { ActivityManager } from "@/domain/services/ActivityManager";

interface ActivityContextProps {
    session: Session | null;
    currentProblem: Problem | null;
    startSession: (userId: string, problems: Problem[]) => void;
    endSession: () => void;
    submitAnswer: (problemId: string, isCorrect: boolean, notes?: string) => void;
    sessionHistory: SessionHistory[];
}

const ActivityContext = createContext<ActivityContextProps | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);

    const activityManager: ActivityManagerInterface = new ActivityManager();

    const startSessionHandler = (userId: string, problems: Problem[]) => {
        activityManager.startSession(userId, problems);
        const newSession = activityManager.getSession();
        setSession(newSession);
        setCurrentProblem(activityManager.getCurrentProblem());
    };

    const endSessionHandler = () => {
        activityManager.endSession();
        setSession(null);
        setCurrentProblem(null);
        setSessionHistory([]);
    };

    const submitAnswerHandler = (problemId: string, isCorrect: boolean, notes?: string) => {
        activityManager.submitAnswer(problemId, isCorrect, notes);
        setSessionHistory(activityManager.getSessionHistory());
        setCurrentProblem(activityManager.getCurrentProblem());
    };

    return (
        <ActivityContext.Provider value={{
            session,
            currentProblem,
            startSession: startSessionHandler,
            endSession: endSessionHandler,
            submitAnswer: submitAnswerHandler,
            sessionHistory
        }}>
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
