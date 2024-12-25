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
    const isDev = process.env.NODE_ENV === "development";
    return [
      {
        source: "/api/:path*", // >> i.e. the ui paths of `/api/*`
        headers: [
          {
            key: "Set-Cookie",
            value: `SameSite=Lax; HttpOnly${isDev ? "" : "; Secure"}`, // exclude 'Secure' option in the 'dev' (server's) environment.
          },
        ],
      },
    ];
  },
};

export default nextConfig;



// --- upgrade sample ---
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "lh3.googleusercontent.com",
//         port: "",
//         pathname: "/**"
//       },
//     ],
//   },
//   async headers() {
//     const isDev = process.env.NODE_ENV === "development"; // 開発環境判定
//     return [
//       // APIルートに特化したヘッダー
//       {
//         source: "/api/:path*",
//         headers: [
//           {
//             key: "Set-Cookie",
//             value: `SameSite=Lax; HttpOnly${isDev ? "" : "; Secure"}`, // 開発環境では Secure を除外
//           },
//         ],
//       },
//       // 全てのルートに適用するセキュリティヘッダー
//       {
//         source: "/(.*)",
//         headers: [
//           {
//             key: "Content-Security-Policy",
//             value: `
//               default-src 'self';
//               script-src 'self';
//               style-src 'self' 'unsafe-inline';
//               img-src 'self' data:;
//               connect-src 'self';
//               font-src 'self';
//               frame-src 'none';
//             `.replace(/\s+/g, ' ').trim(),
//           },
//           {
//             key: "Strict-Transport-Security",
//             value: "max-age=63072000; includeSubDomains; preload",
//           },
//           {
//             key: "X-Content-Type-Options",
//             value: "nosniff",
//           },
//           {
//             key: "X-Frame-Options",
//             value: "DENY",
//           },
//           {
//             key: "X-XSS-Protection",
//             value: "1; mode=block",
//           },
//           {
//             key: "Referrer-Policy",
//             value: "no-referrer",
//           },
//           {
//             key: "Permissions-Policy",
//             value: "geolocation=(), microphone=(), camera=()",
//           },
//         ],
//       },
//     ];
//   },
// };

// export default nextConfig;
