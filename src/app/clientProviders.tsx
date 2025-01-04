"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { MemoProvider } from "../contexts/MemoContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <MemoProvider>
                {children}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </MemoProvider>
        </SessionProvider>
    );
}
