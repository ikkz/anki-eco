---
title: Anki Media Sync Accelerator
description: Import large APKG media locally without waiting for media sync
---

# Anki Media Sync Accelerator

> Use it online on any device, including your smartphone. Fully local processing—your deck data never leaves your device.

When the Anki client downloads a large number of media files from AnkiWeb—for example,
after importing a new deck on one device and syncing to AnkiWeb, then syncing on another
device—media sync can be extremely slow due to poor network conditions or device performance
limitations. Media Boost generates a temporary APKG that lets Anki import media directly from
a local file, skipping the wait. In practice, 30,000 media files can be imported in an instant.

## How to Use

1. Export the corresponding deck as a `.apkg` file from the device that has complete media files
2. Select the file below and click generate
3. Import the generated file into Anki on the device awaiting media sync
4. After import completes, delete the **AnkiEco Media Boost** deck
5. Click the sync button to complete media sync

<MediaBoostTool />

## How It Works

When Anki imports an APKG, it writes embedded media to the local media folder—but only if the notes have changed. Importing the original APKG on the target device won't work, because the note modification times haven't changed, so Anki won't trigger its media import flow.

Media Boost bypasses this by creating new helper notes: each one references a single media file from the original collection via numerous `<img>` tags. When this temporary APKG is imported, Anki treats it as new content and imports all media directly from the file.

Why not use [Anki's collection transfer](https://docs.ankimobile.net/collection-transfer.html)? Because that method exports all Anki data, which can easily lead to data loss if misused. Media Boost only handles media files, works seamlessly with AnkiWeb, and carries no risk of data loss.
