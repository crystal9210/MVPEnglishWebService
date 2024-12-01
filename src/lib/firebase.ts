// https://firebase.google.com/docs/reference/js?_gl=1*1sjgz0w*_up*MQ..*_ga*NjY2MDMzNTQ5LjE3MzExNTIzMzE.*_ga_CW55HF8NVT*MTczMTE1MjMzMS4xLjAuMTczMTE1MjMzMS4wLjAuMA..&hl=ja
import { initializeApp } from "firebase/app"; // depsをきめ細かく制御、Authインスタンス初期化
import { getAuth } from "firebase/auth"; // TODO: 指定されたFirebaseAppに関連づけられているAuthインスタンスを返すとは
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // TODO
export const firestore = getFirestore(app); // TODO
