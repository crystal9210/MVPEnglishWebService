import { NextResponse } from "next/server";
import { firestoreAdmin } from "@/lib/firebaseAdmin";
import { verify } from "jsonwebtoken";
import { publicKey } from "@/utils/keys";

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

    let decoded;

    // トークンの検証
    try {
      decoded = verify(registrationToken, publicKey, { algorithms: ["RS256"] }) as { email: string };
    } catch (error) {
    if (error instanceof Error) {
      console.error("トークンの検証に失敗:", error.message);
    } else {
      console.error("トークンの検証中に予期しないエラーが発生しました。");
    }
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

    const userCollection = firestoreAdmin.collection("users");
    console.log("Firestoreコレクションの中身を表示:");

    const allDocs = await userCollection.get();
    allDocs.forEach(doc => {
      console.log(`Doc ID: ${doc.id}, Data:`, doc.data());
    });
    const userQuerySnapshot = await userCollection
      .where("email", "==", email)
      .limit(1)
      .get();

    if(userQuerySnapshot.empty) {
      console.error(`該当ユーザがFirestoreに存在しません: ${email}`);
      throw new Error("該当ユーザは存在しません。");
    }

    const userDocRef = await userQuerySnapshot.docs[0].ref;

    // Firestoreトランザクションを実行
    await firestoreAdmin.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);

      if (!userDoc.exists) {
        console.error("該当ユーザーがFirestoreに存在しません:", email);
        throw new Error("該当ユーザーは存在しません");
      }

      // ユーザーを確認済みに更新
      transaction.update(userDocRef, { emailVerified: true });
    });

    // リダイレクト先を設定
    return NextResponse.redirect(`http://localhost:3000/verify-email-sent?email=${encodeURIComponent(email)}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("登録確認エラー:", error.message);
    } else {
      console.error("登録確認中に予期しないエラーが発生しました");
    }
    return NextResponse.json(
      { error: "登録確認処理に失敗しました。" },
      { status: 500 }
    );
  }
}
