# HTML-PY VS Code Extension

HTML-PY brings full HTML language tooling to Python triple-quoted strings so you can work comfortably with embedded templates in FastHTML, Datastar, and similar frameworks.

## ✨ Features

- HTML syntax highlighting and IntelliSense inside Python multiline strings assigned to `html`, `div`, `section`, `template`, names ending in `_html`, or variables annotated with an `html` type alias
- Built-in HTML, CSS (within `<style>`), and JavaScript (within `<script>`) completions powered by VS Code’s language services
- Emmet expansions for rapid authoring (`div>p*2` → expands automatically)
- Optional CSS and JavaScript grammar injection inside `<style>` and `<script>` blocks
- Works alongside existing Python highlighting outside the embedded regions

## 🚀 Getting Started

1. Copy this folder into your VS Code extensions directory (e.g. `%USERPROFILE%/.vscode/extensions/html-py`).
2. Reload VS Code (⌘/Ctrl+Shift+P → **Developer: Reload Window**).
3. Open a Python file that contains a supported triple-quoted string (see above). The editor should display HTML highlighting inside the string while preserving normal Python tooling.

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

## 🛣️ Roadmap Ideas

- Broader detection heuristics for template variables
- Inline linting powered by HTML/CSS linters
- Semantic highlighting for Python expressions inside template braces
