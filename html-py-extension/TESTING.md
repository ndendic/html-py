# Testing Guide for HTML-PY Extension

## Quick Test

1. **Launch Extension Development Host**
   - Open the `html-py-extension` folder in VS Code
   - Press `F5` to launch Extension Development Host
   - This opens a new VS Code window with the extension loaded

2. **Open Test File**
   - In the Extension Development Host window, open `/home/ndendic/WebDev/Datastar/html-py/test.py`

3. **Test Features**

### ✅ Syntax Highlighting
- HTML tags should be colored differently from Python code
- CSS inside `<style>` should have CSS syntax highlighting
- JavaScript inside `<script>` should have JS syntax highlighting

### ✅ HTML Autocomplete
1. Place cursor inside an HTML tag (e.g., after `<button`)
2. Type a space and start typing an attribute name (e.g., `class`)
3. You should see HTML attribute suggestions
4. Try typing `<div` and you should see tag completion

### ✅ Emmet Support
1. Place cursor on a new line inside the HTML string
2. Type `div.container>ul>li*3` and press Tab
3. It should expand to proper HTML structure

### ✅ HTML Diagnostics
1. Add a malformed HTML tag (e.g., `<div><span></div>`)
2. You should see a warning/error diagnostic
3. The diagnostic should appear in the Python file at the correct line

### ✅ CSS Completions
1. Inside the `<style>` tag, start typing CSS properties
2. You should get CSS autocomplete suggestions
3. Try typing `display:` and you should see value options

### ✅ JavaScript Completions
1. Inside the `<script>` tag, type `document.`
2. You should see JavaScript completions for document methods
3. Try adding a new function and verify JS syntax highlighting

## Expected Behavior

**What Works:**
- HTML tag and attribute completions
- HTML diagnostics (unclosed tags, invalid attributes)
- Emmet expansions
- CSS and JS completions in their respective tags
- Syntax highlighting for all three languages

**What's Limited:**
- Only the first HTML region in a file gets full tooling (by design for v1)
- F-string interpolations aren't specially handled yet
- Position mapping might be slightly off with complex indentation

## Troubleshooting

### Extension not activating
- Check the Output panel (View → Output → select "HTML-PY" or "Extension Host")
- Verify you're opening a `.py` file

### No completions appearing
- Ensure you're typing inside a triple-quoted string after `my: html = """`
- Try triggering manually with Ctrl+Space
- Check that the virtual document was created (look for console logs)

### Diagnostics not showing
- Diagnostics may take a moment to appear
- Try making a change to trigger an update
- HTML diagnostics are prefixed with "[HTML]"

## Debug Console

To see what's happening:
1. In the Extension Development Host, open Help → Toggle Developer Tools
2. Look at the Console tab for debug messages
3. You should see "HTML-PY extension is now active" when it loads
