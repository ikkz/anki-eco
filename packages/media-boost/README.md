# Media Boost

Browser-only APKG transformer used by the AnkiEco documentation site. It creates a helper APKG
that references every media file in an input APKG, allowing missing media to be imported locally
instead of waiting for media sync.

The package supports latest-format APKG files and legacy APKG versions 1 and 2. Output packages
preserve the input format version. Files are processed locally and are never uploaded.
