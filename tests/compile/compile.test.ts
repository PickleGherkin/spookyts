import { vi } from "vitest";
import { cliSetup } from "../../src/cliSetup";

beforeEach(() => {
  cliSetup();
  program.exitOverride();
})

test("Show default help message when running 'spookyts'", () => {
  let output = "";
  const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation((str) => {
    output += str;
    return true;
  });

  expect(() => program.parse(["node", "spookyts.js", "--help"], { from: "user" }))
    .toThrow();

  expect(writeSpy).toHaveBeenCalled();
  expect(output).toContain("--help");
  expect(output).toContain("--version");
  expect(output).not.toContain("--dry");
  expect(output).not.toContain("--uncapped");
  expect(output).not.toContain("--quiet");
});
