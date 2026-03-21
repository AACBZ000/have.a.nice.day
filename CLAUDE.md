# CLAUDE.md

## Project Overview

**have.a.nice.day** is a static, single-page web application for Chinese Ba Zi (八字, "Eight Characters") fortune-telling. It is titled 因基玄微 and hosted as a GitHub Pages site. Users enter their birth-date characters (八字) and receive an AI-generated reading via the DeepSeek chat API.

## Repository Structure

```
have.a.nice.day/
├── README.md            # Minimal project stub
└── 八字测算.html         # Entire application — single self-contained HTML file
```

There are no build tools, package managers, frameworks, or configuration files. The entire application lives in one HTML file.

## Technology Stack

| Concern       | Choice                                              |
|---------------|-----------------------------------------------------|
| Language      | Vanilla HTML + CSS + JavaScript (no transpilation)  |
| Markdown      | [marked.js](https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js) loaded from CDN |
| AI backend    | [DeepSeek API](https://api.deepseek.com) (`deepseek-chat` model) |
| Hosting       | GitHub Pages (static, no server-side code)          |

## Key Files

### `八字测算.html`

The sole application file. It contains:

- **CSS** — inline `<style>` block. Color scheme: light yellow (`#FFF8DC`) background, dark brown (`#8B4513`) text/borders. Includes a spinning Bagua/yin-yang loading animation.
- **HTML structure** — header, main input form, result box, loading spinner, footer.
- **JavaScript** — a single async function `calculateBazi()` that:
  1. Reads user input from `#bazi`.
  2. Shows the loading spinner.
  3. POSTs to `https://api.deepseek.com/v1/chat/completions` with the hardcoded API key.
  4. Renders the markdown response using `marked.parse()`.
  5. Hides the spinner and displays results (or an error message).

## Security Warning — Hardcoded API Key

**The DeepSeek API key is hardcoded directly in the JavaScript source (`八字测算.html` line 181).** Because this is a public GitHub Pages site, this key is fully exposed to anyone who views the page source. Consequences:

- Any visitor can extract and abuse the key.
- The key owner is liable for all charges incurred by third parties.

**Recommended remediation:** Move API calls to a server-side proxy (e.g., a Cloudflare Worker or serverless function) that keeps the key out of the browser. Do not commit API keys to this repository.

## Development Conventions

### Editing the Application

- The entire app is in `八字测算.html`. Edit that file directly — there is no build step.
- Maintain the existing inline structure (styles in `<head>`, scripts at end of `<body>`).
- The page targets Chinese-speaking users; UI text and comments are in Simplified Chinese.

### No Build / No Tests

There are no test suites, linters, or CI pipelines. Manual browser testing is the only verification method currently in place.

### Deployment

Pushing to the `main` branch (or `master` in older configurations) triggers GitHub Pages to serve the updated static files automatically. No deployment scripts are needed.

### Branching

- Feature branches follow the pattern `claude/<description>-<id>` (e.g., `claude/add-claude-documentation-ANz4h`).
- The primary deployed branch is `main`.

## Potential Improvements (for reference)

- Replace the hardcoded API key with a server-side proxy.
- Add input validation for the Ba Zi format (should be exactly 8 Chinese celestial/terrestrial stem characters).
- Add streaming support so results appear incrementally rather than all at once.
- Add a `<meta name="description">` tag and Open Graph tags for social sharing.
