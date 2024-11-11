import { NextResponse } from "next/server";
import { firestoreAdmin } from "@/lib/firebaseAdmin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "メールアドレスが指定されていません。" },
      { status: 400 }
    );
  }

  try {
    const userDocRef = firestoreAdmin.collection("users").doc(email);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ verified: false });
    }

    const userData = userDoc.data();
    return NextResponse.json({ verified: !!userData?.verified });
  } catch (error) {
    console.error("登録確認エラー:", error);
    return NextResponse.json(
      { error: "登録状態の確認に失敗しました。" },
      { status: 500 }
    );
  }
}
