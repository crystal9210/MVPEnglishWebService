import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**"
      },
    ],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development"; // 開発環境判定
    return [
      {
        source: "/api/:path*", // `/api/` 以下のすべてのパス
        headers: [
          {
            key: "Set-Cookie",
            value: `SameSite=Lax; HttpOnly${isDev ? "" : "; Secure"}`, // 開発環境では Secure を除外
          },
        ],
      },
    ];
  },
};

export default nextConfig;
