import { firestoreAdmin } from "@/domain/services/firebaseAdmin";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({ error: "Invalid email format" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const tempUserRef = firestoreAdmin.collection("temporaryUsers").doc(email);

        await firestoreAdmin.runTransaction(async (transaction) => {
            const tempUserSnapshot = await transaction.get(tempUserRef);

            if (!tempUserSnapshot.exists) {
                throw new Error("Temporary user not found");
            }

            const tempUserData = tempUserSnapshot.data();
            if (!tempUserData) {
                throw new Error("Temporary user data is empty");
            }

            // 本登録として保存
            transaction.set(firestoreAdmin.collection("users").doc(email), {
                ...tempUserData,
                verified: true, // 確認済みとしてフラグを更新
            });

            // 仮登録データを削除
            transaction.delete(tempUserRef);
        });

        return new Response(JSON.stringify({ message: "Email confirmed successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error confirming email:", error);
        return new Response(JSON.stringify({ error: "Failed to confirm email" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
