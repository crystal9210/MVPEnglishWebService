import { firestoreAdmin, authAdmin } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) {
            return new Response("Token is required", { status: 400 });
        }

        // トークンを検証してメールアドレスを取得
        const email = await authAdmin.verifyIdToken(token).then((decoded) => decoded.email);

        if (!email) {
            return new Response("Invalid token", { status: 400 });
        }

        // 仮登録ユーザーを取得
        const tempUserRef = firestoreAdmin.collection("temporaryUsers").doc(email);
        const tempUser = await tempUserRef.get();

        if (!tempUser.exists) {
            return new Response("Temporary user not found", { status: 400 });
        }

        const tempUserData = tempUser.data();
        if (!tempUserData) {
            return new Response("Temporary user data is empty", { status: 500 });
        }

        // 本登録として保存
        await firestoreAdmin.collection("users").doc(email).set(tempUserData);

        // 仮登録データを削除
        await tempUserRef.delete();

        return new Response("Email confirmed successfully", { status: 200 });
    } catch (error) {
        console.error("Error confirming email:", error);
        return new Response("Failed to confirm email", { status: 500 });
    }
}
