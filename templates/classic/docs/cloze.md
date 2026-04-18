# Cloze

Cloze template.

Besides the dedicated cloze template, all other templates can enable the cloze function in settings (effective on the next card).

To use, wrap the text you want to cloze with double curly braces, for example, {{text}}. Multiple clozes and image/formula clozes are also supported.

During the review, you can click the gray box to view the answer, or click anywhere outside the box to view the next answer.

## How to migrate from Anki's cloze field

Anki's cloze field is formatted as `{{c1::text}}`, so we can use [Find and Replace](https://docs.ankiweb.net/browsing.html?highlight=Find%20replace#find-and-replace) to transform it to this project's cloze format. Here's the settings:

- Find: `\{\{c\d+::`
- Replace With: `{{`
- Select "regular expression"

## Fields

All fields are consistent with the basic template.
