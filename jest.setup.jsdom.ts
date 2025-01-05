import { Crypto } from "@peculiar/webcrypto";
import { TextEncoder, TextDecoder } from "util";

if (typeof global.TextEncoder === "undefined") {
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
    global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

const crypto = new Crypto();

Object.defineProperty(window, "crypto", {
    value: crypto,
});

Object.defineProperty(global, "crypto", {
    value: crypto,
});

console.log(
    "Setting up window.crypto and TextEncoder/TextDecoder for jsdom-tests"
);
console.log("window.crypto:", window.crypto);
console.log("window.crypto.subtle:", window.crypto?.subtle);
console.log("global.TextEncoder:", global.TextEncoder);
console.log("global.TextDecoder:", global.TextDecoder);

// `crypto.subtle` の存在確認
if (!window.crypto.subtle) {
    console.error("crypto.subtle is undefined in this environment");
} else {
    console.log("crypto.subtle is defined");
}
