import { Buffer } from "buffer";

const privateKeyBase64 = process.env.PRIVATE_KEY_BASE64!;
const publicKeyBase64 = process.env.PUBLIC_KEY_BASE64!;

export const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf-8");
export const publicKey = Buffer.from(publicKeyBase64, "base64").toString("utf-8");
