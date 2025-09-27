# SpookyTS

```
  .-')     _ (`-.                           .-. .-')                .-') _     .-')   
 ( OO ).  ( (OO  )                          \  ( OO )              (  OO) )   ( OO ). 
(_)---\_)_.`     \ .-'),-----.  .-'),-----. ,--. ,--.   ,--.   ,--./     '._ (_)---\_)
/    _ |(__...--''( OO'  .-.  '( OO'  .-.  '|  .'   /    \  `.'  / |'--...__)/    _ | 
\  :` `. |  /  | |/   |  | |  |/   |  | |  ||      /,  .-')     /  '--.  .--'\  :` `. 
 '..`''.)|  |_.' |\_) |  |\|  |\_) |  |\|  ||     ' _)(OO  \   /      |  |    '..`''.)
.-._)   \|  .___.'  \ |  | |  |  \ |  | |  ||  .   \   |   /  /\_     |  |   .-._)   \
\       /|  |        `'  '-'  '   `'  '-'  '|  |\   \  `-./  /.__)    |  |   \       /
 `-----' `--'          `-----'      `-----' `--' '--'    `--'         `--'    `-----' 
```

A TypeScript translation layer that compiles TypeScript files to JavaScript while maintaining project structure for Odoo projects. Powered by Node, Commander.js and written in TypeScript.

## 📖 Overview

SpookyTS is a specialized compilation tool designed for Odoo project development. It automatically discovers TypeScript folders (`ts/`) in your project structure, compiles them to JavaScript for Odoo, and maintains the exact folder hierarchy in the output (`js/`) directories.

## ✨ Features

- **Smart Discovery**: Recursively finds all `ts/` folders in your project
- **Safety First**: By default, only processes one `ts/` folder to prevent accidental mass compilation
- **Uncapped Mode**: Process all `ts/` folders when explicitly enabled with `--uncapped` or `-u`
- **Structure Preservation**: Maintains exact folder hierarchy from `ts/` to `js/`
- **Asset Copying**: Automatically copies non-TypeScript files (CSS, images, etc.) inside of `ts/` folder
- **Odoo Optimized**: Pre-configured TypeScript settings optimized for Odoo
- **Dry Run**: Preview what would be compiled without making changes
- **Quiet Mode**: Silent operation for automation scripts

## 📌 Requirements
- **Node** v24.8.0 and up (Older versions should also work)
- **NPM** v11.6.1 and up (Older versions should also work)
- **NPX** v11.6.1 and up (Older versions should also work)

## 🚀 Installation

### NPX Usage only (for now)

This is assuming you are in the **cloned spookyts project folder path!**

For example: `Coding/MyRepos/spookyts` 
```bash
npx --no-install spookyts compile [options] [destinations...]
```
or

```bash
npm link
spookyts compile [options] [destinations...]
```
If you use the `npm link` method then spookyts will be available at **any** path location.
Though you must **firstly `npm link` in the spookyts project folder!**
## 📋 Usage

### Basic Commands

```bash
# Compile TypeScript files in current directory (finds first ts/ folder)
spookyts compile .

# Compile multiple specific locations
spookyts compile /path/to/project /another/path

# Compile all ts/ folders in current directory (uncapped mode)
spookyts compile . --uncapped # or -u

# Preview what would be compiled (dry run)
spookyts compile . --dry # or -d

# Silent compilation for scripts
spookyts compile . --quiet # or -q

# Combine flags
spookyts compile /path/to/project --dry --uncapped --quiet
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--quiet` | `-q` | Suppress output messages |
| `--dry` | `-d` | Show what would be compiled without actually compiling |
| `--uncapped` | `-u` | Remove safety limit and process ALL `ts/` folders found |
| `--help` | `-h` | Display help information |
| `--version` | `-V` | Show version number |

## 📁 Project Structure

SpookyTS works with the following project structure:

```
my_odoo_addon/
├── static/
│   └── src/
│       ├── ts/                    # Your TypeScript source files
│       │   ├── main.ts
│       │   ├── components/
│       │   │   └── my_component.ts
│       │   ├── utils/
│       │   │   └── helpers.ts
│       │   └── styles/
│       │       └── component.css
│       └── js/                    # Generated JavaScript files
│           ├── main.js
│           ├── components/
│           │   └── my_component.js
│           ├── utils/
│           │   └── helpers.js
│           └── styles/
│               └── component.css  # Non-TS files are copied
```

## ⚙️ TypeScript Configuration

SpookyTS uses TypeScript compiler options optimized for Odoo v16:

```typescript
{
  target: "ES2020",                    // Modern JavaScript with Odoo v16 compatibility
  module: "ES2020",                    // ES modules for clean imports
  moduleResolution: "Node10",          // Node.js style module resolution
  strict: true,                        // Enable all strict type checking
  esModuleInterop: true,               // Better CommonJS compatibility
  skipLibCheck: true,                  // Skip type checking of declaration files
  forceConsistentCasingInFileNames: true,
  removeComments: false,               // Keep comments for debugging
  sourceMap: false,                    // No source maps for cleaner output
  allowJs: true,                       // Allow JavaScript files
  declaration: false                   // No declaration files needed
}
```

## 🔒 Safety Features

### Capped Mode (Default)
By default, SpookyTS only processes **one** `ts/` folder per destination to prevent accidental mass compilation:

```bash
spookyts compile .
# ✅ Finds: /project/addon1/static/src/ts
# ⏹️ Stops: Doesn't process /project/addon2/static/src/ts
```

### Uncapped Mode
Use `--uncapped` to process **all** `ts/` folders:

```bash
spookyts compile . --uncapped
# ✅ Finds: /project/addon1/static/src/ts
# ✅ Finds: /project/addon2/static/src/ts
# ✅ Processes: Both folders
```

## 🎯 Use Cases

### Single Addon Development
```bash
cd /path/to/my_addon
spookyts compile .
```

### Multi-Addon Project
```bash
cd /path/to/odoo_project
spookyts compile . --uncapped
```

### Continuous Development
```bash
# Preview changes before compiling
spookyts compile . --dry

# Compile when ready
spookyts compile .
```

### CI/CD Integration
```bash
# Silent compilation for build scripts
spookyts compile /project/addons --uncapped --quiet
```

## 🛠️ Development

### Build from Source
```bash
git clone https://github.com/PickleGherkin/spookyts.git
cd spookyts
npm install
npm run build
```

### Available Scripts
```bash
npm run build          # Compile TypeScript to JavaScript
npm run test           # Run test suite
npm run _compile.watch # Watch mode compilation during development
```

## 📊 Examples

### Example Output (Default Mode)
```
🎃 SpookyTS: Starting TypeScript compilation for Odoo v16...
📁 Processing location: /home/user/my_project
🔍 Found ts folder: /home/user/my_project/addons/my_addon/static/src/ts
📝 Compiling: .../ts → .../js
✅ Successfully compiled 5 files
📋 Copied: component.css
✅ SpookyTS: Compilation completed!
```

### Example Output (Uncapped Mode)
```
🎃 SpookyTS: Starting TypeScript compilation for Odoo v16...
📁 Processing location: /home/user/my_project
🔍 Found ts folder: /home/user/my_project/addon1/static/src/ts
📝 Compiling: .../addon1/ts → .../addon1/js
✅ Successfully compiled 3 files
🔍 Found ts folder: /home/user/my_project/addon2/static/src/ts
📝 Compiling: .../addon2/ts → .../addon2/js
✅ Successfully compiled 7 files
✅ SpookyTS: Compilation completed!
```

### Example Output (Dry Run)
```
🎃 SpookyTS: Starting TypeScript compilation for Odoo v16...
📁 Processing location: /home/user/my_project
🔍 Found ts folder: /home/user/my_project/addons/my_addon/static/src/ts
📝 Compiling: .../ts → .../js
🔍 [DRY RUN] Would compile 5 TypeScript files
  /path/to/main.ts → /path/to/main.js
  /path/to/component.ts → /path/to/component.js
✅ SpookyTS: Compilation completed!
```

## 🎨 Why "Spooky"?

Because dealing with TypeScript compilations in Odoo can be scary, but SpookyTS makes it friendly! 🎃 And also because I am known as the **Shade**. This project is a WIP and is intended mainly for my purposes as I am testing new things out at my workplace.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

**shade** - [PickleGherkin](https://github.com/PickleGherkin)

## 🐛 Known Issues

- Imports are kind of messy and need to be adjusted explicitly when using spookyts for Odoo.
- No support for third party type definitions commonly used in Vue.js or React :-(
- No support for TSX files
- I am sure more issues will occur when using in real odoo modules. I guess we will see. 

---

*A sword wields no strength unless the hand that holds it has courage. You may be destined to become the hero of legend... but your current power would disgrace the proud green of the hero's tunic you wear. You must use your courage to seek power... and find it you must. Only then will you become the hero for whom this world despairs 🎃 ~ Hero's Shade*