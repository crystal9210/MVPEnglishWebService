"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
    return (
        <div>
            <h1>ログイン</h1>
            <button onClick={() => signIn("google")}>Login with Google</button>
            <button onClick={() => signIn("github")}>Login with Github</button>
        </div>
    )
}