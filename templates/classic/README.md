# Classic Templates

Interactive Anki templates maintained in the AnkiEco monorepo.

- [Documentation and downloads](https://anki.ikkz.fun/templates/classic/)
- [Feedback and issues](https://github.com/ikkz/anki-eco/issues)

## Development

Run commands from the repository root:

```sh
bun install
bunx nx run @anki-eco/classic-templates:dev -- mcq --locale=en
```

The development server is available at `http://localhost:3000`. Run `setBack(true)` in the browser console to show the back of the card.

## Validation and Packaging

```sh
bunx nx run @anki-eco/classic-templates:test
bunx nx run @anki-eco/classic-templates:build -- --entry=mcq --locale=en
bunx nx run @anki-eco/classic-templates:build -- --all
bunx nx run @anki-eco/classic-templates:package
```

Generated `.apkg` files are written to `templates/classic/output/release`.
