import { TextEncoder, TextDecoder } from "util";
import { webcrypto } from "crypto";

if (typeof global.TextEncoder === "undefined") {
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
    global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

if (typeof global.crypto === "undefined") {
    global.crypto = webcrypto as unknown as Crypto;
}

console.log(
    "Setting up global crypto and TextEncoder/TextDecoder for node-tests"
);
console.log("global.crypto:", global.crypto);
console.log("global.crypto.subtle:", global.crypto?.subtle);
console.log("global.TextEncoder:", global.TextEncoder);
console.log("global.TextDecoder:", global.TextDecoder);
