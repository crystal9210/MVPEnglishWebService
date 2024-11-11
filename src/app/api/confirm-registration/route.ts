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
      return NextResponse.json(
        { error: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    await userDocRef.update({ verified: true });
    return NextResponse.redirect("http://localhost:3000/verify-email-sent?email=" + encodeURIComponent(email));
  } catch (error) {
    console.error("登録確認エラー:", error);
    return NextResponse.json(
      { error: "登録確認処理に失敗しました。" },
      { status: 500 }
    );
  }
}
