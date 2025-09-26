import { Command } from "commander"
import { compile } from "./cmdCompile";
import { join } from "path";
import { readFileSync } from "fs";

declare global {
    var program: Command;
}
globalThis.program = new Command();

export function getLogoAndVersion() {
    const logoPath = join(__dirname, '..', 'logo.txt');
    const logo = readFileSync(logoPath, "utf8");
    return `${logo}\nVersion ${globalThis.program.version()} by Shade\n`;
}

export function cliSetup() {
    program
        .version("1.0.0")
        .description("A typescript translation layer which compiles ts files to js files while maintaining project structure for odoo projects.");

    program.command("compile")
        .argument("[destinations...]", "Destinations to convert ts files.")
        .option("-q, --quiet", "Suppress output messages", false)
        .option("-d, --dry", "Run in dry mode. Show what would be compiled without actually compiling.", false)
        .option("-u, --uncapped", "Remove safety limit and process all ts/ folders found.", false)
        .hook("preAction", compile => {
            if (compile.args.length === 0){
                compile.help();
            }
        })
        .action(compile);

    program.addHelpText("beforeAll", getLogoAndVersion());
}