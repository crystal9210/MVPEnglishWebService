// /activity/* においてアクティビティセッションを提供
// TODO problemSets外へのアクセスがあったときはエラーページに遷移、/dashboardに遷移を促す
// TODO /activityへの遷移に対して「goals」「normal( > random / select)」などのパターン指定を可能に
"use client";
import React from "react";
import { ActivityProvider } from "@/app/_contexts/activityContext";

const ActivityLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ActivityProvider>
            {children}
        </ActivityProvider>
    );
};

export default ActivityLayout;
