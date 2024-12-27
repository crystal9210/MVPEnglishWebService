import type { Config } from "jest";

const config: Config = {
    projects: [
        {
            displayName: "node-tests", // node environment tests setting
            preset: "ts-jest",
            testEnvironment: "node",
            testMatch: ["**/*.node.test.ts"], // *.test.ts >> executed in node environment.
            testPathIgnorePatterns: ["/node_modules/", "/dist/"],
            moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
            moduleNameMapper: {
                "^@/(.*)$": "<rootDir>/src/$1", // >> path alias
            },
        },
        {
            displayName: "jsdom-tests", // jsdom environment tests setting
            preset: "ts-jest",
            testEnvironment: "jsdom",
            testMatch: ["**/*.jsdom.test.ts"], // *.jsdom.test.ts >> the test is executed in jsdom environment.
            testPathIgnorePatterns: ["/node_modules/", "/dist/"],
            moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
            moduleNameMapper: {
                "^@/(.*)$": "<rootDir>/src/$1",
            },
            setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
        },
    ],
    verbose: true, // whether test-results is logged in detail in the shell.
};

export default config;
