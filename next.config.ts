import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* Other Next.js configuration options can be added here */

    /**
     * Webpack configuration to modify how modules are resolved and bundled.
     * Specifically, it excludes 'pdfkit' from the server-side bundle to prevent
     * path resolution issues related to internal font files like 'Helvetica.afm'.
     */
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Initialize externals if not already present
            config.externals = config.externals || [];

            /**
             * Exclude 'pdfkit' from the server-side bundle.
             * This prevents Webpack from bundling 'pdfkit' and allows it to be
             * required at runtime, ensuring internal paths are resolved correctly.
             */
            config.externals.push({
                pdfkit: "commonjs pdfkit",
            });

            /**
             * Fallback configurations to prevent bundling of certain Node.js built-in modules.
             * Setting 'child_process' and 'fs' to false ensures they are not bundled,
             * which can prevent potential conflicts or unnecessary code inclusion.
             */
            config.resolve.fallback = {
                ...config.resolve.fallback,
                child_process: false, // Prevent bundling of 'child_process' module
                fs: false, // Prevent bundling of 'fs' (File System) module
            };
        }

        // Return the modified config
        return config;
    },

    /**
     * Configuration for handling remote images.
     * This allows images from specified remote patterns to be optimized and served.
     */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
                pathname: "/**",
            },
        ],
    },

    /**
     * Custom HTTP headers configuration.
     * Specifically, it sets the 'Set-Cookie' header for API routes to enforce security policies.
     */
    async headers() {
        const isDev = process.env.NODE_ENV === "development"; // Check if the environment is development

        return [
            {
                // Apply headers to all API routes under '/api/*'
                source: "/api/:path*",
                headers: [
                    {
                        key: "Set-Cookie",
                        value: `SameSite=Lax; HttpOnly${
                            isDev ? "" : "; Secure"
                        }`,
                        // In production, add 'Secure' flag to cookies
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
