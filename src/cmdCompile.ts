import { OptionValues } from 'commander';
import { existsSync } from 'fs';
import { copyFile, mkdir, readdir } from 'fs/promises';
import { dirname, join, relative, resolve } from 'path';
import * as ts from 'typescript';

class SpookyTS {
    private constructor(private destinations: string[], private options: OptionValues) {
        this.prepareSystem();
    }

    public static async compile(destinations: string[], options: OptionValues): Promise<void> {
        const spookyts = new SpookyTS(destinations, options);
        spookyts.validateDestinationsNotEmpty();
        await spookyts.walkDestinations();
        spookyts.finishSystem();
    }

    private prepareSystem(): void {
        if (!this.options.quiet)
            console.log('🎃 SpookyTS: Starting TypeScript compilation for Odoo v16...');
    }

    private validateDestinationsNotEmpty(): void {
        if (this.destinations.length === 0)
            globalThis.program.error("No destinations provided. Please specify at least one directory to convert ts folders into js folders.");
    }

    private finishSystem(): void {
        if (!this.options.quiet)
            console.log('✅ SpookyTS: Compilation completed!');
    }

    private async walkDestinations(): Promise<void> {
        for (const destination of this.destinations) {
            try {
                await this.processLocation(destination);
            } catch (error) {
                globalThis.program.error(`❌ Error processing location '${destination}':`, error);
            }
        }
    }
    private async processLocation(location: string): Promise<void> {
        const absolutePath = resolve(location);

        if (!existsSync(absolutePath)) {
            throw new Error(`Location '${location}' does not exist`);
        }

        if (!this.options.quiet) {
            console.log(`📁 Processing location: ${absolutePath}`);
        }

        const tsFolders = await this.findTsFolders(absolutePath);

        if (tsFolders.length === 0) {
            if (!this.options.quiet) {
                console.log(`⚠️  No 'ts' folders found in ${location}`);
            }
            return;
        }

        for (const tsFolder of tsFolders) {
            if (!this.options.quiet) {
                console.log(`🔍 Found ts folder: ${tsFolder}`);
            }
            await this.compileTsFolder(tsFolder);
        }
    }

    private async findTsFolders(dir: string): Promise<string[]> {
        const tsFolders: string[] = [];
        const uncapped = this.options.uncapped
        let foundTsFolder = false;

        async function walkDir(currentDir: string): Promise<void> {
            if (foundTsFolder) return;

            try {
                const entries = await readdir(currentDir, { withFileTypes: true });

                for (const entry of entries) {
                    if (foundTsFolder) return;
                    const fullPath = join(currentDir, entry.name);

                    if (!entry.isDirectory()) {
                        continue;
                    }
                    if (entry.name === 'ts') {
                        tsFolders.push(fullPath);
                        if (!uncapped) {
                            foundTsFolder = true;
                            return;
                        }
                    } else {
                        if (!['node_modules', '.git', '.vscode'].includes(entry.name)) {
                            await walkDir(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Skip directories that can't be read
            }
        }

        await walkDir(dir);
        return tsFolders;
    }

    private async compileTsFolder(tsFolder: string): Promise<void> {
        const parentDir = dirname(tsFolder);
        const jsFolder = join(parentDir, 'js');

        if (!this.options.quiet) {
            console.log(`📝 Compiling: ${tsFolder} → ${jsFolder}`);
        }

        const compilerOptions: ts.CompilerOptions = {
            target: ts.ScriptTarget.ES2020, // TODO: Make these as an option in options member
            module: ts.ModuleKind.ES2020, // TODO: Make these as an option in options member
            moduleResolution: ts.ModuleResolutionKind.Node10, // TODO: Make these as an option in options member
            allowJs: true,
            declaration: false,
            outDir: jsFolder,
            rootDir: tsFolder,
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            removeComments: false,
            sourceMap: false,
        };

        const tsFiles = await this.findTsFiles(tsFolder);

        if (tsFiles.length === 0) {
            if (!this.options.quiet) {
                console.log(`⚠️  No TypeScript files found in ${tsFolder}`);
            }
            return;
        }

        if (!this.options.dry) {
            if (!existsSync(jsFolder)) {
                await mkdir(jsFolder, { recursive: true });
            }

            // Compile TypeScript files
            const program = ts.createProgram(tsFiles, compilerOptions);
            const emitResult = program.emit();

            // Check for compilation errors
            const allDiagnostics = ts
                .getPreEmitDiagnostics(program)
                .concat(emitResult.diagnostics);

            if (allDiagnostics.length > 0) {
                console.error('❌ TypeScript compilation errors:');
                allDiagnostics.forEach(diagnostic => {
                    if (diagnostic.file) {
                        const { line, character } = ts.getLineAndCharacterOfPosition(
                            diagnostic.file,
                            diagnostic.start!
                        );
                        const message = ts.flattenDiagnosticMessageText(
                            diagnostic.messageText,
                            '\n'
                        );
                        console.error(
                            `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
                        );
                    } else {
                        console.error(
                            ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
                        );
                    }
                });
            } else if (!this.options.quiet) {
                console.log(`✅ Successfully compiled ${tsFiles.length} files`);
            }

            await this.copyNonTsFiles(tsFolder, jsFolder);
        } else {
            if (!this.options.quiet) {
                console.log(`🔍 [DRY RUN] Would compile ${tsFiles.length} TypeScript files`);
                tsFiles.forEach(file => {
                    const relativePath = relative(tsFolder, file);
                    const outputPath = join(jsFolder, relativePath.replace(/\.ts$/, '.js'));
                    console.log(`  ${file} → ${outputPath}`);
                });
            }
        }
    }

    private async findTsFiles(dir: string): Promise<string[]> {
        const tsFiles: string[] = [];

        async function walkDir(currentDir: string): Promise<void> {
            try {
                const entries = await readdir(currentDir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = join(currentDir, entry.name);

                    if (entry.isDirectory()) {
                        await walkDir(fullPath);
                    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
                        tsFiles.push(fullPath);
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        }

        await walkDir(dir);
        return tsFiles;
    }

    private async copyNonTsFiles(sourceDir: string, targetDir: string): Promise<void> {
        async function copyRecursive(src: string, dest: string): Promise<void> {
            try {
                const entries = await readdir(src, { withFileTypes: true });

                for (const entry of entries) {
                    const srcPath = join(src, entry.name);
                    const destPath = join(dest, entry.name);

                    if (entry.isDirectory()) {
                        if (!existsSync(destPath)) {
                            await mkdir(destPath, { recursive: true });
                        }
                        await copyRecursive(srcPath, destPath);
                    } else if (entry.isFile() && !entry.name.endsWith('.ts')) {
                        // Copy non-TypeScript files (CSS, images, etc.)
                        await copyFile(srcPath, destPath);
                        if (!this.options.quiet) {
                            console.log(`📋 Copied: ${entry.name}`);
                        }
                    }
                }
            } catch (error) {
                // Skip files we can't copy
            }
        }

        await copyRecursive(sourceDir, targetDir);
    }
}

export async function compile(destinations: string[], options: OptionValues): Promise<void> {
    await SpookyTS.compile(destinations, options);
}
