import NextAuth from "next-auth";
import { authOptions } from "@/handlers/authHandler";

const { signIn, handlers, signOut, auth } = NextAuth(authOptions); // 単一のハンドラが返される
export const { GET, POST } = handlers; // GET, POSTのHTTPメソッドをサポートする形でハンドラをエクスポート(公開)
