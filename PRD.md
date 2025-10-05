# 🧩 PRD: FastHTML VS Code Language Extension

## 1. Overview

FastHTML is a **VS Code language extension** that enables HTML syntax highlighting, IntelliSense, and Emmet support **inside Python triple-quoted strings**.
It’s primarily intended for frameworks like **FastHTML**, **Datastar**, or any project embedding HTML directly in Python (e.g., `div: html = f"""<div>...</div>"""`).

The extension **injects the HTML grammar** into Python string scopes, providing:

* HTML tag and attribute highlighting
* Emmet completions (`div>p*2` → expands automatically)
* Basic folding and syntax awareness
* Optional CSS/JS grammar injection inside `<style>` and `<script>` blocks

---

## 2. Goals

| Type         | Description                                                                |
| ------------ | -------------------------------------------------------------------------- |
| 🎯 Primary   | Provide native HTML editing experience within Python multiline strings     |
| 💅 Secondary | Maintain existing Python syntax highlighting outside HTML blocks           |
| 🚀 Optional  | Allow `.pyhtml` or `.fpy` standalone hybrid files with HTML and Python mix |

---

## 3. Non-Goals

* No runtime validation of Python + HTML integration (only syntax layer).
* No full linting or formatting enforcement.
* No direct interaction with Python Language Server (Pyright/Pylance) for template evaluation.

---

## 4. Functional Requirements

### 4.1 Language Identification

* Register a new language ID: `"fasthtml"`.
* Recognize `.pyhtml` and `.fpy` extensions.
* Inject FastHTML grammar into `source.python` scopes (Python files).

### 4.2 Grammar Injection

* Detect start of multiline string assigned to variables like:

  * `html`, `div`, `section`, `template`
* Inject HTML grammar (`text.html.basic`) between the `"""` delimiters.
* Example match:

  ```regex
  (?<=\b(html|div|section|template)\s*[:=]\s*f?\"\"\")
  ```

### 4.3 Emmet Integration

* Configure `emmet.includeLanguages` so that FastHTML and Python both use HTML expansions.
* Add IntelliSense for tags and attributes within the injected regions.

### 4.4 Basic Formatting Rules

* Inherit comment syntax and bracket rules from Python.
* Auto-closing brackets, quotes, and tag pairs supported through VS Code defaults.

### 4.5 Optional CSS/JS Embedding

* Inside `<style>` → include `source.css`.
* Inside `<script>` → include `source.js`.

---

## 5. Technical Design

### 5.1 File Structure

```
fasthtml/
├─ package.json
├─ language-configuration.json
└─ syntaxes/
   └─ fasthtml.tmLanguage.json
```

### 5.2 `package.json`

Registers the language and grammar injection.

```json
{
  "name": "fasthtml",
  "displayName": "FastHTML",
  "description": "HTML-in-Python hybrid language for FastHTML/Datastar",
  "version": "0.0.1",
  "engines": { "vscode": "^1.80.0" },
  "contributes": {
    "languages": [
      {
        "id": "fasthtml",
        "aliases": ["FastHTML", "fasthtml"],
        "extensions": [".fpy", ".pyhtml"],
        "configuration": "./language-configuration.json"
      }
    ],
    "grammars": [
      {
        "language": "fasthtml",
        "scopeName": "source.fasthtml",
        "path": "./syntaxes/fasthtml.tmLanguage.json",
        "injectTo": ["source.python"]
      }
    ]
  }
}
```

### 5.3 `language-configuration.json`

Defines comments and bracket behavior.

```json
{
  "comments": { "lineComment": "#", "blockComment": ["'''", "'''"] },
  "brackets": [["{", "}"], ["[", "]"], ["(", ")"]],
  "autoClosingPairs": [
    { "open": "\"", "close": "\"" },
    { "open": "'", "close": "'" },
    { "open": "(", "close": ")" },
    { "open": "[", "close": "]" },
    { "open": "{", "close": "}" }
  ]
}
```

### 5.4 `syntaxes/fasthtml.tmLanguage.json`

Injects HTML grammar into Python multiline strings.

```json
{
  "scopeName": "source.fasthtml",
  "injectionSelector": "L:string.quoted.multi.python",
  "patterns": [
    {
      "begin": "(?<=\\b(html|div|section|template)\\s*[:=]\\s*f?\"\"\")",
      "end": "\"\"\"",
      "name": "meta.embedded.html",
      "patterns": [
        {
          "include": "text.html.basic"
        }
      ]
    }
  ]
}
```

---

## 6. Installation & Testing

### 6.1 Local Testing

1. Clone repo to `~/.vscode/extensions/fasthtml/`
2. Reload VS Code.
3. Check “Developer: Inspect Editor Tokens” — HTML scope should appear inside triple-quoted strings.

### 6.2 Building VSIX

```bash
npm install -g vsce
cd fasthtml
vsce package
```

Then install manually:
**Command Palette → Developer: Install Extension from VSIX…**

### 6.3 Settings Recommendation

Add to workspace `.vscode/settings.json`:

```json
{
  "emmet.includeLanguages": {
    "fasthtml": "html",
    "python": "html"
  },
  "files.associations": {
    "*.py": "fasthtml"
  }
}
```

---

## 7. Future Enhancements

| Feature             | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| HTML Lint Bridge    | Integrate with `djlint` or `htmlhint` to lint inline blocks        |
| Inline Autocomplete | Pipe `vscode-html-languageservice` completions into Python regions |
| Semantic Highlight  | Support for variable interpolation inside `{}` within HTML         |

---

## 8. Deliverables

* [ ] Functional VSIX package (`fasthtml-0.0.1.vsix`)
* [ ] Source folder ready for GitHub release
* [ ] README.md describing usage, installation, and screenshots
* [ ] Optional demo repo with example `.py` files showcasing embedded HTML
