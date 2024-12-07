import { container } from "@/containers/diContainer";
import { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "next-auth/adapters";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import type { ILoggerService } from "@/interfaces/services/ILoggerService";
import type { IAuthService } from "@/interfaces/services/IAuthService";
import type { IUserService } from "@/interfaces/services/IUserService";
import { FieldValue } from "firebase-admin/firestore";

export function CustomFirestoreAdapter(): Adapter {
    const firebaseAdmin = container.resolve<IFirebaseAdmin>("IFirebaseAdmin");
    const logger = container.resolve<ILoggerService>("ILoggerService");
    const authService = container.resolve<IAuthService>("IAuthService");
    const userService = container.resolve<IUserService>("IUserService");
    const firestore = firebaseAdmin.getFirestore();

    const adapter: Adapter = {

        // ユーザーを作成
        async createUser(user: AdapterUser): Promise<AdapterUser> {
            const { email, name, image } = user;

            let firebaseUser = await authService.getUserByEmail(email!);
            if (!firebaseUser) {
                firebaseUser = await authService.createUser(email!, name || undefined, image || undefined);
            }

            const userDocRef = firestore.collection("users").doc(firebaseUser.uid);
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
                emailVerified: firebaseUser.emailVerified ? new Date(firebaseUser.metadata?.lastSignInTime ?? Date.now()) : null,
            } as AdapterUser;
        },

        // ユーザーをIDで取得
        async getUser(id: string): Promise<AdapterUser | null> {
            const userDoc = await firestore.collection("users").doc(id).get();
            if (!userDoc.exists) return null;

            const data = userDoc.data()!;
            return {
                id,
                email: data.email,
                name: data.name,
                image: data.image,
                emailVerified: data.emailVerified ? new Date(data.emailVerified.seconds * 1000) : null,
            } as AdapterUser;
        },

        // メールアドレスでユーザーを取得
        async getUserByEmail(email: string): Promise<AdapterUser | null> {
            const userCollection = firestore.collection("users");
            const userQuerySnapshot = await userCollection.where("email", "==", email).limit(1).get();

            if (userQuerySnapshot.empty) return null;

            const userDoc = userQuerySnapshot.docs[0];
            const userData = userDoc.data();
            return {
                id: userDoc.id,
                email: userData.email,
                name: userData.name,
                image: userData.image,
                emailVerified: userData.emailVerified ? new Date(userData.emailVerified.seconds * 1000) : null,
            } as AdapterUser;
        },

        // アカウント情報からユーザーを取得
        async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string; }): Promise<AdapterUser | null> {
            const accountsCollection = firestore.collection("accounts");
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

        // ユーザー情報を更新
        async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">): Promise<AdapterUser> {
            const userDocRef = firestore.collection("users").doc(user.id);

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
                emailVerified: data.emailVerified ? new Date(data.emailVerified.seconds * 1000) : null,
            } as AdapterUser;
        },

        // ユーザーを削除
        async deleteUser(userId: string): Promise<void> {
            try {
                await authService.deleteUser(userId);

                const userDocRef = firestore.collection("users").doc(userId);
                await userDocRef.delete();
            } catch (error) {
                logger.error(`Error deleting user with ID: ${userId}`, { error });
                throw error;
            }
        },

        // アカウントをリンク
        async linkAccount(account: AdapterAccount): Promise<void> {
            try {
                const accountsCollection = firestore.collection("accounts");
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
                logger.error("Failed to link account", { error });
                throw error;
            }
        },

        // アカウントをリンク解除
        async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string; }): Promise<void> {
            try {
                const accountsCollection = firestore.collection("accounts");
                const accountDocRef = accountsCollection.doc(providerAccountId);

                await accountDocRef.delete();
            } catch (error) {
                logger.error("Failed to unlink account", { error });
                throw error;
            }
        },

        // セッションを作成
        async createSession(session: AdapterSession): Promise<AdapterSession> {
            try {
                const sessionsCollection = firestore.collection("sessions");
                const sessionDocRef = sessionsCollection.doc(session.sessionToken);

                await sessionDocRef.set({
                    sessionToken: session.sessionToken,
                    userId: session.userId,
                    expires: session.expires,
                });

                return session;
            } catch (error) {
                logger.error("Failed to create session", { error });
                throw error;
            }
        },

        // セッションとユーザーを取得
        async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
            try {
                const sessionsCollection = firestore.collection("sessions");
                const sessionDoc = await sessionsCollection.doc(sessionToken).get();

                if (!sessionDoc.exists) return null;

                const sessionData = sessionDoc.data()!;
                const user = await adapter.getUser!(sessionData.userId);

                if (!user) return null;

                return {
                    session: {
                        sessionToken: sessionData.sessionToken,
                        userId: sessionData.userId,
                        expires: sessionData.expires.toDate(),
                    },
                    user,
                };
            } catch (error) {
                logger.error("Failed to get session and user", { error });
                throw error;
            }
        },

        // セッションを更新
        async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">): Promise<AdapterSession | null | undefined> {
            try {
                const sessionsCollection = firestore.collection("sessions");
                const sessionDocRef = sessionsCollection.doc(session.sessionToken);

                await sessionDocRef.update({
                    ...(session.userId && { userId: session.userId }),
                    ...(session.expires && { expires: session.expires }),
                    updatedAt: FieldValue.serverTimestamp(),
                });

                const updatedDoc = await sessionDocRef.get();
                if (!updatedDoc.exists) return null;

                const data = updatedDoc.data()!;
                return {
                    sessionToken: data.sessionToken,
                    userId: data.userId,
                    expires: data.expires.toDate(),
                } as AdapterSession;
            } catch (error) {
                logger.error("Failed to update session", { error });
                throw error;
            }
        },

        // セッションを削除
        async deleteSession(sessionToken: string): Promise<void> {
            try {
                const sessionsCollection = firestore.collection("sessions");
                const sessionDocRef = sessionsCollection.doc(sessionToken);

                await sessionDocRef.delete();
            } catch (error) {
                logger.error("Failed to delete session", { error });
                throw error;
            }
        },

        // 検証トークンを作成
        async createVerificationToken(verificationToken: VerificationToken): Promise<VerificationToken | null | undefined> {
            try {
                const verificationRequestsCollection = firestore.collection("verificationRequests");
                const verificationDocRef = verificationRequestsCollection.doc(verificationToken.identifier);

                await verificationDocRef.set({
                    identifier: verificationToken.identifier,
                    token: verificationToken.token,
                    expires: verificationToken.expires,
                    createdAt: FieldValue.serverTimestamp(),
                });

                return verificationToken;
            } catch (error) {
                logger.error("Failed to create verification token", { error });
                throw error;
            }
        },

        // 検証トークンを使用
        async useVerificationToken(params: { identifier: string; token: string; }): Promise<VerificationToken | null> {
            try {
                const verificationRequestsCollection = firestore.collection("verificationRequests");
                const verificationDoc = await verificationRequestsCollection.doc(params.identifier).get();

                if (!verificationDoc.exists) return null;

                const verificationData = verificationDoc.data()!;
                if (verificationData.token !== params.token) return null;
                if (verificationData.expires.toDate() < new Date()) return null;

                // 検証トークンを削除
                await verificationRequestsCollection.doc(params.identifier).delete();

                return verificationData as VerificationToken;
            } catch (error) {
                logger.error("Failed to use verification token", { error });
                throw error;
            }
        },

        // アカウントを取得
        async getAccount(providerAccountId: string, provider: string): Promise<AdapterAccount | null> {
            try {
                const accountsCollection = firestore.collection("accounts");
                const accountDoc = await accountsCollection.doc(providerAccountId).get();

                if (!accountDoc.exists) return null;

                const accountData = accountDoc.data()!;
                if (accountData.provider !== provider) return null;

                return {
                    type: accountData.type,
                    provider: accountData.provider,
                    providerAccountId: accountData.providerAccountId,
                    userId: accountData.userId,
                    access_token: accountData.access_token || null,
                    refresh_token: accountData.refresh_token || null,
                    expires_at: accountData.expires_at || null,
                    token_type: accountData.token_type || null,
                    scope: accountData.scope || null,
                    id_token: accountData.id_token || null,
                } as AdapterAccount;
            } catch (error) {
                logger.error("Failed to get account", { error });
                throw error;
            }
        },

        // 以下のメソッドは必要に応じて実装してください
        async getAuthenticator(credentialID: string): Promise<any | null> {
            // Implement authenticator retrieval logic if needed
            return null;
        },

        async createAuthenticator(authenticator: any): Promise<any> {
            // Implement authenticator creation logic if needed
            return authenticator;
        },

        async listAuthenticatorsByUserId(userId: string): Promise<any[]> {
            // Implement authenticator listing logic if needed
            return [];
        },

        async updateAuthenticatorCounter(credentialID: string, newCounter: number): Promise<any> {
            // Implement authenticator counter update logic if needed
            return null;
        },
    };

    return adapter as Adapter;
}
