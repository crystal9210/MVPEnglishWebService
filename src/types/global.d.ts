export {};

declare global {
    let crypto: Crypto;
    let TextEncoder: typeof import("util").TextEncoder;
    let TextDecoder: typeof import("util").TextDecoder;
}
