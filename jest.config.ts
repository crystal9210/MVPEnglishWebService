import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    verbose: true, // whether test-results is logged in detail in the shell.
    testEnvironment: "node",
}

export default config;
