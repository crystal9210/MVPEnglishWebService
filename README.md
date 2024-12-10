## All rights reverved@Yuto Seki(2024,2025)

(NOTE: The above is temporary to avoid copyright related issues, and I'm not actually responsible for the codebase.)

# POC English Web Service

## Tech Stack

### **Frontend & Server**

- **Hosting & Deployment:** Vercel
- **Languages & Frameworks:** TypeScript, Next.js 15 (App Router)
- **Libraries:**
  - React
  - Zod
  - Auth.js v5
  - Nodemailer
  - Tailwind CSS
  - IDB
  - tryringe
  - DOMPurify
  - etc

### **Authentication & Security**

- **Protocols:** OpenID Connect, OAuth 2.0
- **Providers:** Google
- **Security Features:**
  - PKCE
  - Nonce
  - CSRF Token
  - JWE (JWT)
  - RCE (Gmail)

### **Database & Backend Services**

- **Database:** Firebase - Cloud Firestore
- **Authentication:** Firebase Authentication

### **Payments**

- **Payment Integration:** Stripe

### **Testing**

- **Test Framework:** Jest

### **Documentation**

- **Notion(confidential)**

## Project Structure Principal is like below:

- **Clean Architecture**
- **DDD**
- **TDD**
- **other general principals**

## NOTES

### 1. This is one of the simple and small personal projects I am personally working on

### 2. I have been working with TypeScript for about 2 months now, so I'm still learning as I am not familiar with the specification.

### 3. About security, scalability, availability of the system architecture: Initially, the project was designed with a space-based, microservices-oriented, and clean architecture approach, adhering to principles such as the principle of least privilege, network segmentation, and role-based access control (RBAC). The tech stack included Docker, Next.js (App Router), TypeScript, Echo, PostgreSQL, Redis, and other components aimed at supporting a large-scale infrastructure.　 The foundational technical setup for this advanced architecture was almost fully implemented, featuring robust security configurations, performance optimizations, and scalable system design. However, considering the project's MVP scope, that architecture was deemed overly engineered. So, I revised the deployment strategy and started developing a simpler and more minimal configuration,though I was not used to TypeScript and related techs; I'm continuously learning and catching up with various techs while redesigning the architecture according to tech specifications as proceeding the implementation. By adopting a monolithic architecture, the system's scalability, availability, flexibility, and security robustness are somewhat reduced. However, this trade-off is acceptable for the MVP stage. In a production environment, the internal structure is planned to be replaced with a large-scale, fully scalable system architecture I've already designed and developed.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
