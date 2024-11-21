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
    // メールアドレスに基づいてユーザーデータを検索
    const userQuerySnapshot = await firestoreAdmin
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    // クエリ結果を確認
    if (userQuerySnapshot.empty) {
      return NextResponse.json({ emailVerified: false });
    }

    // ユーザーデータを取得
    const userDoc = userQuerySnapshot.docs[0];
    const userData = userDoc.data();

    // `emailVerified`フィールドを確認
    return NextResponse.json({ emailVerified: !!userData?.emailVerified });
  } catch (error) {
    console.error("登録確認エラー:", error);
    return NextResponse.json(
      { error: "登録状態の確認に失敗しました。" },
      { status: 500 }
    );
  }
}
