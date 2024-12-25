"use client";

import { openDB, DBSchema, IDBPDatabase } from "idb";
import { IActivitySessionHistoryItem } from "@/schemas/activity/clientSide/activitySessionHistoryItemSchema";
import { ProblemSet } from "@/schemas/activity/clientSide/problemSetSchema";
import { ClientActivitySessionType } from "@/schemas/activity/clientSide/clientActivitySessionSchema";

// TODO
interface ClientActivitySession extends ClientActivitySessionType {}

interface ActivityDB extends DBSchema {
    sessions: {
        key: string; // sessionId
        value: ClientActivitySession;
    };
    history: {
        key: number; // auto-increment
        value: {
            id?: number; // auto-increment optional key for idb
            sessionId: string;
            historyItem: IActivitySessionHistoryItem;
        };
        indexes: { "by-sessionId": string };
    };
}

type Listener = (session: ClientActivitySession | null) => void;

export class ActivityManager {
    private dbPromise: Promise<IDBPDatabase<ActivityDB>>;
    private currentSession: ClientActivitySession | null = null;
    private listeners: Listener[] = [];

    constructor() {
        this.dbPromise = openDB<ActivityDB>("activity-db", 1, {
            upgrade(db) {
                db.createObjectStore("sessions", { keyPath: "sessionId" });
                const historyStore = db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
                historyStore.createIndex("by-sessionId", "sessionId");
            },
        });

        this.initialize();
    }

    private async initialize() {
        // DBから現在のセッションをロード
        const db = await this.dbPromise;
        const allSessions = await db.getAll("sessions");
        this.currentSession = allSessions.length > 0 ? allSessions[0] : null;
        this.notifyListeners();
    }

    async startSession(session: ClientActivitySession): Promise<void> {
        const db = await this.dbPromise;
        await db.put("sessions", session);
        this.currentSession = session;
        this.notifyListeners();
    }

    async endSession(): Promise<void> {
        if (!this.currentSession) return;
        const db = await this.dbPromise;
        await db.delete("sessions", this.currentSession.sessionId);
        this.currentSession = null;
        this.notifyListeners();
    }

    async submitAnswer(historyItem: IActivitySessionHistoryItem): Promise<void> {
        if (!this.currentSession) throw new Error("No active session");
        const db = await this.dbPromise;
        await db.add("history", { sessionId: this.currentSession.sessionId, historyItem });
    }

    getCurrentSession(): ClientActivitySession | null {
        return this.currentSession;
    }

    subscribe(listener: Listener): () => void {
        this.listeners.push(listener);
        // 現在の状態をリスナーに即時通知
        listener(this.currentSession);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.currentSession));
    }

    async getSessionHistory(sessionId: string): Promise<IActivitySessionHistoryItem[]> {
        const db = await this.dbPromise;
        const historyEntries = await db.getAllFromIndex("history", "by-sessionId", sessionId);
        return historyEntries.map(entry => entry.historyItem);
    }

    // 全セッション取得
    async getAllSessions(): Promise<ClientActivitySession[]> {
        const db = await this.dbPromise;
        const sessions = await db.getAll("sessions");
        return sessions;
    }

    // 特定セッション削除
    async deleteSession(sessionId: string): Promise<void> {
        const db = await this.dbPromise;
        await db.delete("sessions", sessionId);
        console.log(`Session with ID ${sessionId} deleted.`);
        // もし削除されたセッションが現在のセッションであれば、currentSession を null に
        if (this.currentSession?.sessionId === sessionId) {
            this.currentSession = null;
            this.notifyListeners();
        }
    }

    // 特定セッション更新
    async updateSession(sessionId: string, updatedSession: Partial<ClientActivitySession>): Promise<void> {
        const db = await this.dbPromise;
        const session = await db.get("sessions", sessionId);

        if (!session) {
            throw new Error(`Session with ID ${sessionId} not found.`);
        }

        // 更新するプロパティが problemSet の場合、必須フィールドを保持
        if (updatedSession.problemSet) {
            const existingProblemSet = session.problemSet;
            updatedSession.problemSet = { ...existingProblemSet, ...updatedSession.problemSet };
        }

        const newSession: ClientActivitySession = {
            ...session,
            ...updatedSession,
        };

        await db.put("sessions", newSession);
        console.log(`Session with ID ${sessionId} updated.`);

        if (this.currentSession?.sessionId === sessionId) {
            this.currentSession = newSession;
            this.notifyListeners();
        }
    }

    // 全ての履歴を取得
    async getAllHistory(): Promise<{ id: number; sessionId: string; historyItem: IActivitySessionHistoryItem }[]> {
        const db = await this.dbPromise;
        const historyEntries = await db.getAll("history");
        return historyEntries.map((entry) => ({
            id: entry.id!,
            sessionId: entry.sessionId,
            historyItem: entry.historyItem,
        }));
    }

    // 特定の履歴を削除
    async deleteHistoryItem(id: number): Promise<void> {
        const db = await this.dbPromise;
        await db.delete("history", id);
        console.log(`History item with ID ${id} deleted.`);
    }

    // 特定の履歴を更新
    async updateHistoryItem(id: number, updatedHistoryItem: Partial<IActivitySessionHistoryItem>): Promise<void> {
        const db = await this.dbPromise;
        const historyEntry = await db.get("history", id);
        if (!historyEntry) {
            throw new Error(`History item with ID ${id} not found.`);
        }
        const newHistoryItem: IActivitySessionHistoryItem = { ...historyEntry.historyItem, ...updatedHistoryItem };
        await db.put("history", { ...historyEntry, historyItem: newHistoryItem });
        console.log(`History item with ID ${id} updated.`);
    }
}
