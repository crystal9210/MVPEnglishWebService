import { NextResponse } from "next/server";
import { firestoreAdmin } from "@/lib/firebaseAdmin";
import { verify } from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const registrationToken = url.searchParams.get("registrationToken");
    console.log("受信リクエストのURL:", request.url);
    console.log("取得されたトークン:", registrationToken);


    // トークンが指定されていない場合のエラーハンドリング
    if (!registrationToken) {
      return NextResponse.json(
        { error: "トークンが指定されていません。" },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET!;
    let decoded;

    // トークンの検証
    try {
      decoded = verify(registrationToken, secret, { algorithms: ["HS256"] }) as { email: string };
    } catch (error: any) {
      console.error("トークンの検証に失敗:", error.message);
      return NextResponse.json(
        { error: "無効なトークンです。" },
        { status: 400 }
      );
    }

    const email = decoded.email;

    // メールアドレスが検証されたトークンから取得できなかった場合のエラーハンドリング
    if (!email || typeof email !== "string") {
      console.error("トークンに無効なメールアドレスが含まれています:", email);
      return NextResponse.json(
        { error: "無効なトークンです。" },
        { status: 400 }
      );
    }

    const userDocRef = firestoreAdmin.collection("users").doc(email);

    // Firestoreトランザクションを実行
    await firestoreAdmin.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);

      if (!userDoc.exists) {
        console.error("該当ユーザーがFirestoreに存在しません:", email);
        throw new Error("該当ユーザーは存在しません");
      }

      // ユーザーを確認済みに更新
      transaction.update(userDocRef, { verified: true });
    });

    // リダイレクト先を設定
    return NextResponse.redirect(`http://localhost:3000/verify-email-sent?email=${encodeURIComponent(email)}`);
  } catch (error: any) {
    console.error("登録確認エラー:", error.message);
    return NextResponse.json(
      { error: "登録確認処理に失敗しました。" },
      { status: 500 }
    );
  }
}
