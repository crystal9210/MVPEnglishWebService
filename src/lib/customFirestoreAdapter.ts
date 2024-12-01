import { Adapter, AdapterUser } from "next-auth/adapters";
import { firestoreAdmin } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getUserByEmail, createUser, deleteUserFromAuth } from "./authService";

export function CustomFirestoreAdapter(): Adapter {
    return {
        async createUser(user) {
            const { email, name, image } = user;

            let firebaseUser = await getUserByEmail(email!);
            if (!firebaseUser) {
                firebaseUser = await createUser(email!, name || undefined, image || undefined);
                console.log(`新規作成された Firebase ユーザー UID: ${firebaseUser.uid}`);
            }

            const userDocRef = firestoreAdmin.collection("users").doc(firebaseUser.uid);
            await userDocRef.set({
                email: firebaseUser.email,
                name: firebaseUser.displayName || name,
                image: firebaseUser.photoURL || image,
                emailVerified: firebaseUser.emailVerified,
                // createdAt: FieldValue.serverTimestamp(),
                // updatedAt: FieldValue.serverTimestamp(),
            });

            return {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || name,
                image: firebaseUser.photoURL || image,
                emailVerified: firebaseUser.emailVerified ? new Date() : null,
                // createdAt: new Date(),
                // updatedAt: new Date(),
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
                // createdAt: data.createdAt?.toDate(),
                // updatedAt: data.updatedAt?.toDate(),
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
                // createdAt: userData.createdAt?.toDate(),
                // updatedAt: userData.updatedAt?.toDate(),
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
            if (!accountData.userId) {
                throw new Error("Account data does not contain a valid userId.");
            }

            const getUser = this.getUser; // ローカルに格納して参照
            if (typeof getUser !== "function") {
                console.error("getUser method is not implemented in the adapter.");
                return null;
            }

            const user =await getUser(accountData.userId);

            console.log(`debugging user: ${JSON.stringify(user, null, 2.)}`);

            return user;
        },
        async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">): Promise<AdapterUser> {
            const userDocRef = firestoreAdmin.collection("users").doc(user.id);

            await userDocRef.update({
                ...(user.name && { name: user.name }),
                ...(user.image && { image: user.image }),
                ...(user.emailVerified !== undefined && { emailVerified: user.emailVerified }),
                updatedAt: FieldValue.serverTimestamp(),
            });

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
                // createdAt: data.createdAt?.toDate() || new Date(),
                // updatedAt: data.updatedAt?.toDate() || new Date(),
            } as AdapterUser;
        },
        async deleteUser(id: string): Promise<void> {
            try {
                await deleteUserFromAuth(id);

                const userDocRef = firestoreAdmin.collection("users").doc(id);
                await userDocRef.delete();
                console.log(`Firestore ユーザ削除完了: ${id}`);
            } catch (error) {
                console.error(`ユーザ削除処理中にエラー発生: ${id}`, error);
                throw error;
            }
        }
    };
}

