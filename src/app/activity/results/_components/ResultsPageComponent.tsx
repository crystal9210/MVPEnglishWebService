"use client";
import React, { useState } from "react";
import { useActivity } from "@/app/_contexts/activityContext";
import { toast } from "react-toastify";

const ResultsPageComponent = () => {
    const { session } = useActivity();
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const handleSaveToDB = async () => {
        if (!session) {
            toast.error("No active session to save.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch("/api/activities/results", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(session),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save session");
            }

            toast.success("Session saved to database successfully!");
        } catch (error) {
            console.error("Error saving session:", error);
            toast.error("Failed to save session to database.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Results for Session: {session?.sessionId}</h2>
            <p className="mb-6">Started At: {session?.startedAt}</p>
            {/* セッションの詳細や履歴の表示をここに追加 */}
            <button
                onClick={handleSaveToDB}
                disabled={isSaving}
                className={`mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {isSaving ? "Saving..." : "Save to DB"}
            </button>
        </div>
    );
};

export default ResultsPageComponent;
