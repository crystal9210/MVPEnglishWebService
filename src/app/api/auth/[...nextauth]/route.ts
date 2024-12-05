import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions); // 単一のハンドラが返される
export { handler as GET, handler as POST }; // GET, POSTのHTTPメソッドをサポートする形でハンドラをエクスポート(公開)
