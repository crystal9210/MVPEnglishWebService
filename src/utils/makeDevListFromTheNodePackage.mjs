import * as fs from "fs";
import * as path from "path";

/**
 * About this file:
 * Analyze a Node.js package and output detailed information about its exports.
 *
 * ## Usage
 * This script can be executed directly using Node.js from the project root directory.
 *
 * ### Command
 * ```bash
 * node src/utils/makeDevListFromTheNodePackage.mjs <package-name>
 * ```
 *
 * ### Example
 * ```bash
 * node src/utils/makeDevListFromTheNodePackage.mjs pdfkit
 * ```
 *
 * ### Output
 * - A text file is generated in the `outputNodeModuleInfo` directory.
 * - File name format: `<package-name>-exportDetailInfo.txt`
 * - The file contains detailed information about the package's exports, such as:
 *   - Exported names
 *   - Types (e.g., function, object, class)
 *   - Kinds (e.g., static property, prototype method)
 *   - Nested structures
 *   - Implementations (for functions and methods, if available)
 *
 * ## Example Output
 * For a package like `pdfkit`, the output might include:
 * ```
 * Name: pdfkit.default.LineWrapper
 * Type: function
 * Kind: Function
 * Implementation:
 * class LineWrapper extends events.EventEmitter { ... }
 *
 * Nested:
 *   Name: pdfkit.default.LineWrapper.prototype.wordWidth
 *   Type: function
 *   Kind: Prototype Method
 *   Implementation:
 *   wordWidth(word) { return this.document.widthOfString(word, this) + ... }
 * ```
 *
 * ## Purpose
 * This script is designed to:
 * 1. Provide developers with a structured view of the internal components of a package.
 * 2. Aid in understanding how to use the package by revealing hidden or undocumented exports.
 * 3. Facilitate debugging by exposing function implementations and nested structures.
 * 4. Enable better integration of third-party packages by generating detailed documentation.
 *
 * ## Use Cases
 * - **Documentation**: Generate an overview of a package's API for team members.
 * - **Debugging**: Inspect internal implementations of problematic or undocumented methods.
 * - **Learning**: Understand how a package organizes and exposes its functionality.
 * - **Integration**: Ensure compatibility and identify entry points for extending functionality.
 */


/**
 * Analyze a package and output detailed information about its exports, including implementations.
 * @param packageName - The name of the package to analyze.
 */
const listExportsWithDetails = async (packageName) => {
    try {
        const outputDir = path.resolve(process.cwd(), "outputNodeModuleInfo");
        const outputFile = path.join(outputDir, `${packageName}-exportDetailInfo.txt`);

        if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        }

        const importedModule = await import(packageName);

        // Detect the module structure and choose the appropriate inspection strategy
        const analysisMode = detectModulePattern(importedModule);
        const details = analyzeModule(importedModule, packageName, analysisMode);

        const content = formatExportDetails(details);
        fs.writeFileSync(outputFile, content, "utf8");

        console.log(`Exported details from ${packageName} have been written to ${outputFile}`);
    } catch (error) {
        console.error(`Failed to process package "${packageName}":`, error);
    }
};

/**
 * Detects the pattern of the module's structure.
 * @param module - The imported module to analyze.
 * @returns A string representing the module's analysis mode.
 */
const detectModulePattern = (module) => {
    if (module.default) {
        return "default";
    } else if (Object.keys(module).length > 0) {
        return "named";
    }
    return "unknown";
};

/**
 * Analyzes the module based on its detected pattern.
 * @param module - The imported module to analyze.
 * @param moduleName - The name of the module being analyzed.
 * @param mode - The analysis mode determined by detectModulePattern.
 * @returns An array of analyzed details.
 */
const analyzeModule = (module, moduleName, mode) => {
    switch (mode) {
        case "default":
        return inspectModuleRecursive(module.default, `${moduleName}.default`);
        case "named":
        return inspectModuleRecursive(module, moduleName);
        default:
        return [{ name: moduleName, type: typeof module, kind: "Unknown", nested: [] }];
    }
};

/**
 * Recursively inspects a module and gathers details about its exports.
 * @param module - The module to inspect.
 * @param moduleName - The name of the module.
 * @param visited - A set of visited modules to prevent circular references.
 * @returns An array of detailed export information.
 */
const inspectModuleRecursive = (module, moduleName = "", visited = new Set()) => {
    const details = [];
    if (visited.has(module)) return details;
    visited.add(module);

    for (const [key, value] of Object.entries(module)) {
        const fullName = moduleName ? `${moduleName}.${key}` : key;
        const type = typeof value;
        const kind = value && value.constructor ? value.constructor.name : type;

        let nested = [];
        if (type === "object" && value !== null) {
        nested = inspectModuleRecursive(value, fullName, visited);
        } else if (type === "function") {
        nested = inspectFunctionDetails(value, fullName);
        }

        details.push({
        name: fullName,
        type,
        kind,
        implementation: type === "function" ? value?.toString() : null,
        nested,
        });
    }
    return details;
};

/**
 * Inspects the details of a function, including its prototype and static properties.
 * @param func - The function to inspect.
 * @param funcName - The name of the function.
 * @returns An array of detailed information about the function.
 */
const inspectFunctionDetails = (func, funcName) => {
    const details = [];
    if (func.prototype) {
        for (const key of Object.getOwnPropertyNames(func.prototype)) {
        if (key !== "constructor") {
            details.push({
            name: `${funcName}.prototype.${key}`,
            type: "function",
            kind: "Prototype Method",
            implementation: func.prototype[key]?.toString() || "N/A",
            });
        }
        }
    }
    for (const key of Object.keys(func)) {
        details.push({
        name: `${funcName}.${key}`,
        type: typeof func[key],
        kind: "Static Property",
        implementation: func[key]?.toString() || "N/A",
        });
    }
    return details;
};

/**
 * Formats the detailed export information into a readable string.
 * @param details - The array of detailed export information.
 * @returns A formatted string.
 */
const formatExportDetails = (details) => {
    return details
        .map(({ name, type, kind, implementation, nested }) => {
        let output = `Name: ${name}\nType: ${type}\nKind: ${kind}\n`;
        if (implementation) {
            output += `Implementation:\n${implementation}\n`;
        }
        if (nested && nested.length > 0) {
            output += `Nested:\n${formatExportDetails(nested)
            .split("\n")
            .map((line) => `  ${line}`)
            .join("\n")}\n`;
        }
        return output;
        })
        .join("\n");
};

// The script below is an entry point for the script when run this file directly.
if (process.argv.length > 1 && import.meta.url === `file://${process.argv[1]}`) {
    const packageName = process.argv[2];

    if (!packageName) {
        console.error("Please provide a package name as an argument.");
        console.error("Usage: node src/utils/makeDevListFromTheNodePackage.mjs <package-name>");
        process.exit(1);
    }

    listExportsWithDetails(packageName);
}
