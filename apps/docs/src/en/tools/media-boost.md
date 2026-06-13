---
title: Media Boost
description: Import large APKG media locally without waiting for media sync
---

# Media Boost

Use this tool on device B after note sync has completed but media sync is still running slowly.
It creates a temporary APKG containing helper notes that reference every media file in the original
package, causing Anki to import the missing media directly from the package.

<MediaBoostTool />

## Important

- Processing happens entirely in your browser. The APKG is never uploaded.
- Both latest and legacy APKG files are supported. The output preserves the input format version.
- After importing the generated APKG, delete the **AnkiEco Media Boost** deck.
- The tool does not repair real note references when a different local file already uses the same filename.
