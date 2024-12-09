import { Adapter, AdapterUser } from "next-auth/adapters";
import { firestoreAdmin } from "../domain/services/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getUserByEmail, createUser, deleteUserFromAuth } from "./authService";

export function CustomFirestoreAdapter(): Adapter {
    const adapter: Adapter = {
        async linkAccount(account) {
            try {
                const accountsCollection = firestoreAdmin.collection("accounts");
                const accountDocRef = accountsCollection.doc(account.providerAccountId);

                await accountDocRef.set({
                    userId: account.userId,
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token || null,
                    refresh_token: account.refresh_token || null,
                    expires_at: account.expires_at || null,
                    token_type: account.token_type || null,
                    scope: account.scope || null,
                    id_token: account.id_token || null,
                });
            } catch (error) {
                console.error("Failed to link account", error);
                throw error;
            }
        },
        async createUser(user) {
            const { email, name, image } = user;

            let firebaseUser = await getUserByEmail(email!);
            if (!firebaseUser) {
                firebaseUser = await createUser(email!, name || undefined, image || undefined);
            }

            const userDocRef = firestoreAdmin.collection("users").doc(firebaseUser.uid);
            await userDocRef.set({
                email: firebaseUser.email,
                name: firebaseUser.displayName || name,
                image: firebaseUser.photoURL || image,
                emailVerified: firebaseUser.emailVerified,
            });

            return {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || name,
                image: firebaseUser.photoURL || image,
                emailVerified: firebaseUser.emailVerified ? new Date() : null,
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

            const user = await adapter.getUser!(accountData.userId);
            return user;
        },
        async updateUser(user) {
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
            } as AdapterUser;
        },
        async deleteUser(id) {
            try {
                await deleteUserFromAuth(id);

                const userDocRef = firestoreAdmin.collection("users").doc(id);
                await userDocRef.delete();
            } catch (error) {
                console.error(`Error deleting user with ID: ${id}`, error);
                throw error;
            }
        },
    };

    return adapter as Adapter; // 明示的な型キャストで型の整合性を確保
}
