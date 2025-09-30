import { readdirSync } from "fs";
import { cliSetup } from "../../src/cliSetup";
import { Command } from "commander";

let output = "";
let oldLog: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
}

beforeEach(() => {
    globalThis.program = new Command();
    program.exitOverride((cmdError) => {
        throw cmdError;
    });

    cliSetup();

    oldLog = console.log;
    console.log = (str: string) => { output += str + "\n"; oldLog(str); };
    program.configureOutput({
        writeOut: (str: string) => (output += str),
        writeErr: (str: string) => (output += str),
    });
})

afterEach(() => {
    console.log = oldLog;
    output = "";
})

test("Compile simple module folder in dry mode", async () => {
    const pathToExample = process.cwd() + "/tests/examples/multiple_file_example_module/";
    try {
        await program.parseAsync(["compile", "--dry", pathToExample], { from: "user" })
    } catch (cmdError) {
        expect(cmdError.exitCode).toBe(0);
    }
    expect(output).toContain(pathToExample);
})

test("Compile simple module folder in quiet and dry mode", async () => {
    const pathToExample = process.cwd() + "/tests/examples/multiple_file_example_module/";
    try {
        await program.parseAsync(["compile", "--dry", "--quiet", pathToExample], { from: "user" })
    } catch (cmdError) {
        expect(cmdError.exitCode).toBe(0);
    }
    expect(output).toBeFalsy();
})

test("Compile simple module folder with two ts files", async () => {
    const pathToExample = process.cwd() + "/tests/examples/multiple_file_example_module/";
    try {
        await program.parseAsync(["compile", pathToExample], { from: "user" })
    } catch (cmdError) {
        expect(cmdError.exitCode).toBe(0);
    }
    expect(output).toContain(pathToExample);
    expect(output).toContain("2 TypeScript files")
    const readJsFiles = () => readdirSync(pathToExample + "static/src/js");
    expect(readJsFiles).not.toThrow();
    const jsFiles = readJsFiles();
    expect(jsFiles).toBeDefined();
    expect(jsFiles).toHaveLength(2);
})

test("Compile simple module folder with one ts file", async () => {
    const pathToExample = process.cwd() + "/tests/examples/single_file_example_module/";
    try {
        await program.parseAsync(["compile", pathToExample], { from: "user" })
    } catch (cmdError) {
        expect(cmdError.exitCode).toBe(0);
    }
    expect(output).toContain(pathToExample);
    expect(output).toContain("1 TypeScript files")
    const readJsFiles = () => readdirSync(pathToExample + "static/src/js");
    expect(readJsFiles).not.toThrow();
    const jsFiles = readJsFiles();
    expect(jsFiles).toBeDefined();
    expect(jsFiles).toHaveLength(1);
})

test("Compile multiple module folders", async () => {
    const pathToExample = process.cwd() + "/tests/examples/single_file_example_module/";
    const pathToAnotherExample = process.cwd() + "/tests/examples/multiple_file_example_module/";
    try {
        await program.parseAsync(["compile", "--uncapped", pathToExample, pathToAnotherExample], { from: "user" })
    } catch (cmdError) {
        expect(cmdError.exitCode).toBe(0);
    }
    expect(output).toContain(pathToExample);
    expect(output).toContain(pathToAnotherExample);
    const readJsFiles = () => readdirSync(pathToExample + "static/src/js");
    expect(readJsFiles).not.toThrow();
    const readAnotherJsFiles = () => readdirSync(pathToAnotherExample + "static/src/js");
    const jsFiles = readJsFiles().concat(readAnotherJsFiles());
    expect(jsFiles).toBeDefined();
    expect(jsFiles).toHaveLength(3);
})

test("Compile simple module folder in quiet and dry mode", async () => {
    const pathToExample = process.cwd() + "/tests/examples/multiple_file_example_module/";
    try {
        await program.parseAsync(["compile", "--quiet", pathToExample], { from: "user" })
    } catch (cmdError) {
        expect(cmdError.exitCode).toBe(0);
    }
    expect(output).toBeFalsy();
})

test("Compile module folder with no ts files", async () => {
    const pathToExample = process.cwd() + "/tests/examples/empty_file_example_module/";
    try {
        await program.parseAsync(["compile", pathToExample], { from: "user" })
    } catch (cmdError) {
        expect(cmdError.exitCode).toBe(0);
    }
    expect(output).toContain("Compilation aborted");
})

test("Compile in non-existent path", async () => {
    const pathToNonExistent = process.cwd() + "/non/existent";
    try {
        await program.parseAsync(["compile", pathToNonExistent], { from: "user" })
    } catch (cmdError) {
        expect(cmdError.exitCode).toBe(1);
    }
    expect(output).toContain("does not exist");
})

test("Compile cwd", async () => {
    const cwd = process.cwd();
    try {
        await program.parseAsync(["compile", cwd], { from: "user" })
    } catch (cmdError) {
        expect(cmdError.exitCode).toBe(0);
    }
    expect(output).toContain(cwd);
    expect(output).not.toContain("folders")
})