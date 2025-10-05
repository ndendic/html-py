# HTML-PY VS Code Extension

HTML-PY brings full HTML language tooling to Python triple-quoted strings so you can work comfortably with embedded templates in FastHTML, Datastar, and similar frameworks.

## ✨ Features

- **Full HTML Language Support**: HTML syntax highlighting, autocomplete, and IntelliSense inside Python strings
- **Smart Detection**: Recognizes `html`, `div`, `section`, `template` variables, names ending in `_html`, or variables with `html` type annotations
- **Virtual Document Technology**: Creates virtual HTML documents for full language server features
- **HTML Diagnostics**: Real-time linting and error checking for HTML within Python strings
- **Emmet Support**: Fast HTML authoring with Emmet expansions (`div>p*2` → expands automatically)
- **CSS & JavaScript**: Full support for `<style>` and `<script>` blocks with their respective language features
- **Seamless Integration**: Works alongside existing Python tooling without interference

## 🚀 Getting Started

### Installation

1. **Install dependencies**: `npm install`
2. **Compile TypeScript**: `npm run compile`
3. **Install extension**:
   - Press F5 to open Extension Development Host, or
   - Copy this folder into your VS Code extensions directory (e.g. `~/.vscode/extensions/html-py`)
4. **Reload VS Code**: ⌘/Ctrl+Shift+P → **Developer: Reload Window**
5. **Try it**: Open a Python file with HTML strings and start typing HTML inside triple-quoted strings

### Recommended Settings

The extension ships with sensible defaults, but you can customise your workspace settings further if needed:

```jsonc
{
  "emmet.includeLanguages": {
    "html-py": "html",
    "python": "html"
  }
}
```

Python files remain associated with the built-in `python` language so linting, type checking, and IntelliSense continue to work as usual.

## 📦 Package as VSIX

```powershell
npm install -g vsce
cd html-py-extension
vsce package
```

Then install via **Command Palette → Developer: Install Extension from VSIX…**.

## 🧪 Sample

```python
html = """
<div class="card">
  <h1>Hello, {{ user.name }}</h1>
  <style>
    .card {
      background: linear-gradient(135deg, #639, #36f);
    }
  </style>
</div>
"""
```

You should see HTML styling, Emmet support, and CSS highlighting inside the `<style>` block.

## 🛠️ Development

### Build Commands

- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development
- Press F5 in VS Code to launch Extension Development Host

### Architecture

The extension uses virtual documents to provide full HTML language features:
- **HTML Extractor**: Detects HTML regions in Python files using regex patterns
- **Virtual Document Provider**: Creates virtual `.html` documents from Python strings
- **Position Mapper**: Translates positions between Python and virtual HTML
- **Completion Provider**: Proxies HTML completions to Python file
- **Diagnostics Manager**: Maps HTML diagnostics back to Python

## 🛣️ Roadmap Ideas

- ✅ Full HTML completions and IntelliSense
- ✅ HTML diagnostics and linting
- ✅ Emmet support
- Multiple HTML regions per file
- F-string variable highlighting
- Go-to-definition for CSS classes/IDs
