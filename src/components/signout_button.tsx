"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function SignOutButton() {
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = () => {
        setIsSigningOut(true);
        setTimeout(() => {
            signOut();
        }, 1000); // 1秒後にサインアウト
    };

    return (
        <button
            onClick={handleSignOut}
            className={`px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-transform duration-300 ${
                isSigningOut ? "opacity-50 scale-90" : "opacity-100"
            }`}
        >
            {isSigningOut ? "Signing Out..." : "SIGN OUT"}
        </button>
    );
}
