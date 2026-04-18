# ikkz Templates

For the directly usable version, please download it from the [here](https://template.ikkz.fun).

For suggestions and feedback, please submit them [here](https://github.com/ikkz/anki-template/issues).

## Templates

| Template | Description                           | Links                                                                                                       |
| -------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| mcq      | Multiple choice question (6 options)  | [Preview](https://template.ikkz.fun/?template=mcq.en.native) [Docs](https://template.ikkz.fun/docs/mcq)     |
| mcq_10   | Multiple choice question (10 options) | [Preview](https://template.ikkz.fun/?template=mcq_10.en.native) [Docs](https://template.ikkz.fun/docs/mcq)  |
| mcq_26   | Multiple choice question (26 options) | [Preview](https://template.ikkz.fun/?template=mcq_26.en.native) [Docs](https://template.ikkz.fun/docs/mcq)  |
| match    | Drag and drop interactive matching    | [Preview](https://template.ikkz.fun/?template=match.en.native) [Docs](https://template.ikkz.fun/docs/match) |
| tf       | True or false                         | [Preview](https://template.ikkz.fun/?template=tf.en.native) [Docs](https://template.ikkz.fun/docs/tf)       |
| basic    | Basic Q&A                             | [Preview](https://template.ikkz.fun/?template=basic.en.native) [Docs](https://template.ikkz.fun/docs/basic) |
| cloze    | Cloze template                        | [Preview](https://template.ikkz.fun/?template=cloze.en.native) [Docs](https://template.ikkz.fun/docs/cloze) |
| input    | Type in answer                        | [Preview](https://template.ikkz.fun/?template=input.en.native) [Docs](https://template.ikkz.fun/docs/input) |

All of the templates have the following common features:

- Markdown support: see [here](https://template.ikkz.fun/docs/markdown) for details
- After selecting text, you can directly click to ask gpt, search or translate the corresponding text, and customization is also supported
- Support larger question text.
- Support dark mode and light mode.
- Countdown: Give you motivation to learn.

## Contribution Guide

This project welcomes any form of open-source contribution. Here is some information to help you get started quickly.

### Project Initialization

This project uses node's [type stripping](https://nodejs.org/en/learn/typescript/run-natively) feature, so you need to install node version 23.6.0 or above.

After installation, run the following commands to install project dependencies.

```
corepack enable
pnpm install
```

### Starting the Development Server

This project provides specific development commands. For example, to develop the `mcq` template, run:

```
pnpm dev mcq
```

Then visit `http://localhost:3000`, by default you will see the `mcq.en.native` template.

You can also specify the development language and field type through parameters:

```
pnpm dev mcq --locale=zh --field=markdown
```

To flip the card during development, execute the following in the browser console:

```
setBack(true)
```

### Testing in Anki

Generating an Anki apkg format package requires two steps:

1. Build: Run `pnpm build` to build all templates. You can also pass parameters similar to the development command to specify the build. Omitting an option means all possible values for that option will be built.

```
pnpm build --entry=mcq --locale=en --field=native
```

2. Package: `pnpm package`

The Apkg file will be located in the `release` directory.

### Publishing

If your PR modifies the templates, please run `pnpm changeset`. This will ask for a description of your changes. Please fill it out according to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Be sure to include the generated Markdown file in the PR.
