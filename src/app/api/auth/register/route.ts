import { NextResponse } from "next/server";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        if (!email || !name) {
            return NextResponse.json({ error: "Email and Name are required." }, { status: 400 });
        }

        // Firestoreにユーザーが既に存在するか確認
        const userRef = doc(firestore, "users", email);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return NextResponse.json({ error: "User already exists." }, { status: 400 });
        }

        // Firestoreに新規ユーザーを作成
        await setDoc(userRef, {
            email,
            name,
            emailVerified: false,
            createdAt: new Date(),
        });

        // 確認メールを送信
        const actionCodeSettings = {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/confirm-email`, // 確認リンクのリダイレクト先
            handleCodeInApp: true, // アプリ内で確認
        };
        await sendVerificationEmail(email, actionCodeSettings);

        return NextResponse.json({ message: "Registration successful. Please verify your email." });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
    }
}
