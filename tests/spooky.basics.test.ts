import { cliSetup } from "../src/cliSetup";
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
  output = "";
})

test("Show help message when running 'spookyts --help'", async () => {
  try {
    await program.parseAsync(["--help"], { from: "user" });
  } catch (cmdError) {
    expect(cmdError.exitCode).toBe(0);
  } finally {
    console.log = oldLog;
  }
  expect(output).toContain("--help");
  expect(output).toContain("--version");
});

test("Show help message when running 'spookyts'", async () => {
  try {
    await program.parseAsync([], { from: "user" });
  } catch (cmdError) {
    expect(cmdError.exitCode).toBe(1);
  } finally {
    console.log = oldLog;
  }
  expect(output).toContain("--help");
  expect(output).toContain("--version");
});

test("Show help message when running 'spookyts compile --help'", async () => {
  try {
    await program.parseAsync(["compile", "--help"], { from: "user" });
  } catch (cmdError) {
    expect(cmdError.exitCode).toBe(0);
  } finally {
    console.log = oldLog;
  }
  expect(output).toContain("destinations");
  expect(output).toContain("--dry");
  expect(output).toContain("--quiet");
  expect(output).toContain("--uncapped");
});

test("Show help message when running 'spookyts compile'", async () => {
  try {
    await program.parseAsync(["compile"], { from: "user" });
  } catch (cmdError) {
    expect(cmdError.exitCode).toBe(0); // this is exit code 0 because a custom hook triggers help
  } finally {
    console.log = oldLog;
  }
  expect(output).toContain("destinations");
  expect(output).toContain("--dry");
  expect(output).toContain("--quiet");
  expect(output).toContain("--uncapped");
});
