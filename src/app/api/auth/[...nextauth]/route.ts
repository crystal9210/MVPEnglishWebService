import NextAuth from "next-auth";
import { authOptions } from "@/handlers/authHandler";

const { handlers } = NextAuth(authOptions);
export const { GET, POST } = handlers; // GET, POSTのHTTPメソッドをサポートする形でハンドラをエクスポート(公開)
