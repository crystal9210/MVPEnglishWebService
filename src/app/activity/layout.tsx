// /activity/* においてアクティビティセッションを提供
// TODO problemSets外へのアクセスがあったときはエラーページに遷移、/dashboardに遷移を促す
// TODO /activityへの遷移に対して「goals」「normal( > random / select)」などのパターン指定を可能に
// src/app/activity/layout.tsx
"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ActivityProvider, useActivity } from "@/contexts/activitySessionContext";
import { toast } from "react-toastify";

const ActivityLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <ActivityProvider>
            <ActivityLayout>{children}</ActivityLayout>
        </ActivityProvider>
    );
};

const ActivityLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { session, endSession } = useActivity();

    useEffect(() => {
        // セッションが存在しない場合、/dashboardにリダイレクトしつつ、エラートーストを表示
        if (!session && !pathname.startsWith("/activity/select")) {
            toast.error("No active session. Please start a session from the dashboard.");
            router.push("/dashboard");
        }
    }, [session, router, pathname]);

    useEffect(() => {
        // パスネームが/activity/*以外に変更された場合情報トーストを表示
        if (pathname && !pathname.startsWith("/activity")) {
            if (session) {
                endSession();
                toast.info("Session ended. Please start a new session from the dashboard.");
            }
        }
    }, [pathname, session, endSession]); // TODO 依存は本当にこれでいいんだっけ(endSessionは固定で渡すのこれでいい?)

    return (
        <div>
            {children}
        </div>
    );
};

export default ActivityLayoutWrapper;
