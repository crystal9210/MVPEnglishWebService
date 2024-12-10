"use client";
import { openDB, DBSchema, IDBPDatabase } from "idb";
import { ClientActivitySession } from "@/domain/entities/clientSide/clientActivitySession";
import { ClientActivitySessionHistoryItem } from "@/domain/entities/clientSide/activitySessionHistoryItem";


interface ActivityDB extends DBSchema {
    sessions: {
        key: string; // sessionId
        value: ClientActivitySession;
    };
    history: {
        key: number; // auto-increment
        value: {
            sessionId: string;
            historyItem: ClientActivitySessionHistoryItem;
        }
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

    async submitAnswer(historyItem: ClientActivitySessionHistoryItem): Promise<void> {
        if (!this.currentSession) throw new Error("No active session");
        const db = await this.dbPromise;
        await db.add("history", { sessionId: this.currentSession.sessionId, historyItem });
    }

    getCurrentSession(): ClientActivitySession | null {
        return this.currentSession;
    }

    // TODO *3
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

    async getSessionHistory(sessionId: string): Promise<ClientActivitySessionHistoryItem[]> {
        const db = await this.dbPromise;
        const historyEntries = await db.getAllFromIndex("history", "by-sessionId", sessionId);
        return historyEntries.map(entry => entry.historyItem);
    }
}
