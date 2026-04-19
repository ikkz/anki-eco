# AnkiEco

> [!NOTE]
> If you are here to download templates/extensions, please visit https://anki.ikkz.fun/

AnkiEco is a toolkit for building cross-platform Anki experiences with template-driven extensions, interactive templates, and developer utilities.

## Documentation

- [Extensions](https://anki.ikkz.fun/extension/) – template-based add-ons such as CardMotion and Tldraw
- [Classic templates](https://anki.ikkz.fun/templates/classic/) – interactive templates (MCQ, Cloze, Match, Input, etc.) with usage guides
- [Packager CLI](https://anki.ikkz.fun/guide/packager) – instructions for packaging templates into `.apkg` decks

## Highlights

- **Template-first extensions**: CardMotion adds polished review animations; Tldraw embeds a full whiteboard across Anki Desktop, AnkiMobile, AnkiDroid, and AnkiWeb
- **Classic template library**: Ready-to-use templates covering multiple choice, cloze, input, match, and true/false flows with markdown, math, and Mermaid support
- **Deck packaging workflow**: `@anki-eco/packager` converts template sources into shareable `.apkg` archives for single or multi-deck projects
- **Shared toolkits**: `@anki-eco/kit`, `@anki-eco/shared`, and related packages provide reusable runtime helpers for templates and extensions

## Repository Overview

- `apps/docs`: VitePress site backing the documentation links above
- `packages/extensions`: Source for published web-component extensions (CardMotion, Tldraw, etc.)
- `packages/packager`: CLI that bundles template source directories into Anki decks
- `packages/kit`, `packages/shared`, `packages/dev-ui`: Internal libraries that power extensions and template state
- `templates/`: Reference template projects, including the Classic bundle plus React and Vue examples

## Sponsors

Thanks to the following sponsors for their support! ❤️

<!-- sponsors-start -->

| Avatar                                                                                                                     | Sponsor                                |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| <a href="https://github.com/PEDR0HK"><img src="https://github.com/PEDR0HK.png" width="50" height="50" alt="PEDR0HK" /></a> | [@PEDR0HK](https://github.com/PEDR0HK) |

<!-- sponsors-end -->

[Become a sponsor →](https://github.com/sponsors/ikkz)

## Getting Started

**Prerequisites**

- Node.js 23.6.0 or newer (for native TypeScript support)
- Enable Corepack (ships with Node ≥ 16.9) so pnpm 9 is available: `corepack enable`
- Install [`uv`](https://docs.astral.sh/uv/getting-started/installation/) for the Python tooling used in the packager build

**Setup**

1. Install dependencies: `pnpm install`
2. Launch the documentation site locally: `pnpm nx run docs:dev`

Refer to the documentation site for detailed setup instructions, template configuration snippets, and customization guides.
