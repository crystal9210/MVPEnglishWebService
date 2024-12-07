// src/handlers/authOptions.ts
import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { CustomFirestoreAdapter } from "@/adapters/customFirestoreAdapter";
import { container } from "tsyringe";
import { AuthService } from "@/services/authService";
import { UserService } from "@/services/userService";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { LoggerService } from "@/services/loggerService";

// DI コンテナからサービスを取得
const authService = container.resolve(AuthService);
const userService = container.resolve(UserService);
const logger = container.resolve(LoggerService);
const adapter = container.resolve(CustomFirestoreAdapter);

export const authOptions: NextAuthConfig = {
  adapter: adapter as CustomFirestoreAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["pkce", "nonce"],
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1時間
    updateAge: 60 * 60, // セッションを1時間ごとに更新
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!account || account.provider !== "google") {
          logger.warn("Unsupported provider attempted.");
          return "/login?error=unsupportedProvider";
        }

        if (!user.email) {
          logger.error("Sign-in failed: No email provided.");
          return "/login?error=noEmail";
        }

        if (!user.email.endsWith("@gmail.com")) {
          logger.error("Sign-in failed: Invalid email domain.");
          return "/login?error=invalidEmail";
        }

        const email = user.email;
        logger.info(`Sign-in initiated for user: ${email}`);

        // Firebase User Fetch or Create
        let firebaseUser = await authService.getUserByEmail(email);
        if (!firebaseUser) {
          logger.info(`Creating Firebase user for email: ${email}`);
          firebaseUser = await authService.createUser(
            email,
            user.name || "Unnamed User",
            user.image || undefined
          );
        }

        // Link account with Firebase Authentication
        if (account) {
          await authService.createAccountEntry(firebaseUser.uid, account);
        }

        // Check Firestore user existence
        const userData = await userService.getUserById(firebaseUser.uid);
        if (!userData) {
          logger.info(`Creating Firestore user data for UID: ${firebaseUser.uid}`);
          const newUser = {
            email: firebaseUser.email!,
            name: firebaseUser.displayName || user.name!,
            image: firebaseUser.photoURL || user.image || undefined,
            emailVerified: firebaseUser.emailVerified || false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await userService.createUser(firebaseUser.uid, newUser);
        }

        // Email Verification
        if (!firebaseUser.emailVerified) {
          logger.warn(`Email verification pending for user: ${email}`);
          await sendVerificationEmail(email);
          return false;
        }

        logger.info(`User ${email} successfully signed in.`);
        return true;
      } catch (error) {
        logger.error("Error during sign-in process.", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = "user";
        token.subscriptionType = "free"; // Example field
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
};
