import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    verbose: true, // whether test-results is logged in detail in the shell.
    testEnvironment: "node",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', // パスエイリアスのマッピング
    }
};

export default config;
