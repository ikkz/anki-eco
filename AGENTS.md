# AGENTS.md

This file gives guidance to AI and automation agents working in this repository. Before changing code, read the root `README.md` and the relevant package `package.json`/`project.json`, then follow the existing local patterns.

## Project Overview

AnkiEco is a monorepo for building cross-platform Anki experiences, including documentation, publishable packages, extensions, and reference templates.

- `apps/docs`: VitePress documentation site with content split between `src/en` and `src/zh`.
- `packages/dev-ui`: Development/debug UI built with Preact.
- `packages/extensions`: Web component extensions published as `@anki-eco/extensions`, including CardMotion, Tldraw, and XMarkdown.
- `packages/kit`: Runtime helpers for templates and extensions, with vanilla, React, and Vue entry points.
- `packages/packager`: `@anki-eco/packager` CLI, with TypeScript entry points and Python packaging logic under `src/python`.
- `packages/shared`: Shared types, utilities, and `packager-schema.json`.
- `packages/vite-plugin`: AnkiEco Vite plugin. Its package entry points live directly in `src/*.js` and `src/*.d.ts`.
- `templates/classic`: Main Classic template project with build scripts, React/Preact template source, tests, and Python packaging scripts.
- `templates/example-react` and `templates/example-vue`: Example templates using `@anki-eco/kit` and `@anki-eco/vite-plugin`.

## Environment And Package Management

- Use Bun as the package manager, script runner, and runtime.
- Classic template and packager builds require `uv`; CI uses `uv 0.4.27`.
- Install dependencies with `bun install`.
- Do not switch to npm, yarn, or pnpm, and do not hand-edit `bun.lock`; dependency changes should go through `bun`.

## Common Commands

Run these from the repository root:

- `bun run lint`: Run `oxlint`.
- `bun run lint:fix`: Apply available lint fixes.
- `bun run fmt`: Format with `oxfmt`.
- `bun run fmt:check`: Check formatting.
- `bunx nx show projects`: List Nx project names.
- `bunx nx affected -t lint test build typecheck package fmt:check`: Run a CI-like affected-project check.
- `bunx nx run @anki-eco/docs:dev`: Start the docs site.
- `bunx nx run @anki-eco/docs:build`: Build the docs site.
- `bunx nx run @anki-eco/classic-templates:dev -- mcq --locale=zh --field=markdown`: Develop a specific Classic template.
- `bunx nx run @anki-eco/classic-templates:build`: Build the Classic templates.
- `bunx nx run @anki-eco/classic-templates:test`: Run Classic template tests.
- `bunx nx run @anki-eco/classic-templates:package`: Package Classic templates via `uv run --frozen build/package.py`.
- `bunx nx run @anki-eco/packager:build`: Build the packager TypeScript output and Python executable.
- `bunx nx run @anki-eco/packager:test`: Validate packager output with `test_data`.

You can also run workspace scripts directly, for example:

- `bun run --filter @anki-eco/docs dev`
- `bun run --filter @anki-eco/classic-templates test`

## Validation Strategy

- After completing any change, run `bun run lint` and `bun run fmt`.
- For small TypeScript/React/Vue changes, run the relevant project `typecheck` or `test`, plus root `bun run lint`/`bun run fmt:check` when appropriate for the risk.
- For Classic template behavior changes, prefer adding or updating Vitest coverage under `templates/classic/tests`, then run `bunx nx run @anki-eco/classic-templates:test`.
- For Classic build or packaging changes, run `build`; if `.apkg` output or Python scripts are involved, run `package`.
- For packager changes, run `bunx nx run @anki-eco/packager:build`; run `test` when packaging behavior may have changed.
- For documentation changes, run `bunx nx run @anki-eco/docs:build`, and check whether both English and Chinese docs need updates.
- For publishable package entry point or export changes, check the relevant `package.json` `exports`, `types`, `files`, and tsconfig references.

If local environment issues, runtime, or missing dependencies prevent validation, state exactly which commands were not run and why in the final response.

## Code Style

- TypeScript is strict. Root `tsconfig.base.json` enables `strict`, `noImplicitReturns`, `noUnusedLocals`, `noFallthroughCasesInSwitch`, and related checks.
- Formatting uses `oxfmt` with single quotes. Do not introduce Prettier or ESLint config as a replacement for the existing tools.
- Linting uses `oxlint` with eslint/typescript/unicorn/react/vue/vitest/import plugins and type-aware checks.
- Prefer existing utilities, stores, hooks, and package boundaries. Avoid creating new global abstractions for local needs.
- Keep ESM style. If a package already uses `.js` source files, preserve that language and export style.
- Avoid committing generated output and caches such as `dist`, `coverage`, `.nx/cache`, and `.nx/workspace-data`, unless the task explicitly requires release artifacts.

## Classic Template Notes

- Main source is in `templates/classic/src`:
  - `entries`: Template entry points.
  - `features`: Interactive features such as `cloze`, `markdown`, `ordering`, `tf`, and `tools`.
  - `store`: Jotai/state configuration.
  - `hooks`, `components`, and `utils`: Shared frontend logic.
- Build logic lives in `templates/classic/build`; the development server plugin is under `build/plugins/dev-server`.
- Development commands accept template, locale, and field arguments, for example `mcq --locale=en --field=native`.
- During development, run `setBack(true)` in the browser console to flip to the back side of a card.
- Template changes must account for Anki Desktop, AnkiMobile, AnkiDroid, and AnkiWeb constraints. Avoid browser or Node APIs that are unavailable in those environments.
- For Classic template changes, update `templates/classic/package.json` version according to semver: new features require a minor version bump, and bug fixes require a patch version bump. If `git` history or the current diff shows the version has already been bumped for the change, keep that existing version change.
- Template release-related changes usually need a changeset; see `templates/classic/README.md`.

## Packager And Python Notes

- `packages/packager/src/bin.ts` and `src/index.ts` are the Node-side entry points.
- `packages/packager/src/python/package.py` contains Python packaging logic. The build uses `uvx pyfuze@2.7.2` to generate the executable.
- `templates/classic/build/package.py` packages Classic templates and is run as `uv run --frozen build/package.py`.
- When changing Python logic, keep `uv.lock` and `pyproject.toml` consistent. Do not bypass `uv` with manual dependency installation.

## Documentation And Content

- Public docs live in `apps/docs`; English content is under `apps/docs/src/en`, and Chinese content is under `apps/docs/src/zh`.
- User-facing behavior changes usually require matching documentation updates.
- Image assets live in `apps/docs/src/assets` or `apps/docs/src/public`; place new assets in the relevant topic directory.
- The root README is for repository-level overview. Put detailed usage guidance in the docs site.

## Collaboration Rules

- Check `git status` before editing, and do not overwrite user changes.
- Keep edits scoped to the task. Avoid unrelated reshuffling, broad formatting, or lockfile noise.
- Before adding a dependency, verify that existing packages or platform APIs are insufficient.
- For Anki template frontend changes, consider mobile layout, dark mode, front/back card state, and offline execution.
- Final responses should state the changed scope, validation commands run, and any remaining unvalidated risk.
