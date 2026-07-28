# The Gutenberg Shelf

This page is a static export of the Complete Shelf experience from
mintdotgg/mint-playground (experiences/complete-shelf), used under the MIT
license. The original copyright notice is kept in LICENSE next to this file.

Changes from upstream:

- app/catalog.ts holds the 20 most downloaded Project Gutenberg books instead
  of the demo catalog, generated from the Gutendex API on 2026-07-28.
- app/site-config.ts carries the collection name, wordmark, and link labels for
  this shelf.
- next.config.ts basePath points at /vibelogs/posts/gutenberg-shelf.
- Cover images are Project Gutenberg cover scans, resized to 1200px wide webp
  under books/<id>/cover.webp.

Only bibliographic metadata is stored: titles, authors, subject headings, and
download counts. No book text is included.
