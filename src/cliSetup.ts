import { Command } from "commander"
import { compile } from "./cmdCompile";

declare global {
    var program: Command;
}
globalThis.program = new Command();

export function cliSetup() {
    program
        .version("1.0.0")
        .description("A typescript translation layer which compiles ts files to js files while maintaining project structure for odoo projects.");

    program.command("compile")
        .argument("[destinations...]", "Destinations to convert ts files.")
        .option("-q, --quiet", "Suppress output", false)
        .option("-d, --dry", "Run in dry mode. Only show what would be compiled without actually compiling anything.", false)
        .option("-u, --uncapped", "Uncap the search safety and allow spookyts to convert all ts folders in given destinations", false)
        .action(compile);
}