import { Adapter, AdapterUser } from "next-auth/adapters";
import { firestoreAdmin } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getUserByEmail, createUser } from "./authService";

export function CustomFirestoreAdapter(): Adapter {
    return {
        async createUser(user) {
            const { email, name, image } = user;

            // Firebase Authentication でユーザーを確認または作成
            let firebaseUser = await getUserByEmail(email!);
            if (!firebaseUser) {
                firebaseUser = await createUser(email!, name || undefined, image || undefined);
                console.log(`新規作成された Firebase ユーザー UID: ${firebaseUser.uid}`);
            } else {
                console.log(`取得済み Firebase ユーザー UID: ${firebaseUser.uid}`);
            }

            // Firestore にユーザーを保存
            const userDocRef = firestoreAdmin.collection("users").doc(firebaseUser.uid);
            await userDocRef.set({
                email,
                name,
                image,
                emailVerified: firebaseUser.emailVerified,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            });

            return {
                id: firebaseUser.uid,
                email,
                name,
                image,
                emailVerified: firebaseUser.emailVerified ? new Date() : null,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as AdapterUser;
        },
        async getUser(id) {
            const userDoc = await firestoreAdmin.collection("users").doc(id).get();
            if (!userDoc.exists) return null;

            const data = userDoc.data()!;
            return {
                id,
                email: data.email,
                name: data.name,
                image: data.image,
                emailVerified: data.emailVerified,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as AdapterUser;
        },
        async getUserByEmail(email) {
            const userCollection = firestoreAdmin.collection("users");
            const userQuerySnapshot = await userCollection.where("email", "==", email).limit(1).get();

            if (userQuerySnapshot.empty) return null;

            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();
            return {
                id: userDoc.id,
                email: userData.email,
                name: userData.name,
                image: userData.image,
                emailVerified: userData.emailVerified,
                createdAt: userData.createdAt?.toDate(),
                updatedAt: userData.updatedAt?.toDate(),
            } as AdapterUser;
        },
        async getUserByAccount({ provider, providerAccountId }) {
            const accountsCollection = firestoreAdmin.collection("accounts");
            const accountQuerySnapshot = await accountsCollection
                .where("provider", "==", provider)
                .where("providerAccountId", "==", providerAccountId)
                .limit(1)
                .get();

            if (accountQuerySnapshot.empty) return null;

            const accountData = accountQuerySnapshot.docs[0].data();
            if(!accountData.userId) {
                throw new Error("Account data does not contain a valid userId.");
            }
            if(typeof this.getUser !== "function") {
                throw new Error("getUser method is not implemented in the adapter.");
            }
            return await this.getUser(accountData.userId);
        },
        async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">): Promise<AdapterUser> {
            const userDocRef = firestoreAdmin.collection("users").doc(user.id);

            // Firestoreのドキュメントを更新
            await userDocRef.update({
                name: user.name,
                image: user.image,
                emailVerified: user.emailVerified,
                updatedAt: FieldValue.serverTimestamp(),
            });

            // Firestoreから最新のデータを取得して返却
            const updatedDoc = await userDocRef.get();
            const data = updatedDoc.data();

            if (!data) {
                throw new Error(`Failed to fetch updated user data for id: ${user.id}`);
            }

            return {
                id: user.id,
                email: data.email || "",
                name: data.name || null,
                image: data.image || null,
                emailVerified: data.emailVerified || null,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as AdapterUser;
        }
    };
}
