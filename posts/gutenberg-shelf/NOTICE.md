# The Gutenberg Shelf

This page is a static export of the Complete Shelf experience from
mintdotgg/mint-playground (experiences/complete-shelf), used under the MIT
license. The original copyright notice is kept in LICENSE next to this file.

Changes from upstream, all in src/:

- app/catalog.ts holds the 20 most downloaded Project Gutenberg books instead
  of the demo catalog, generated from the Gutendex API on 2026-07-28, with a
  gutenbergId field added to CatalogBook.
- app/site-config.ts carries the collection name, wordmark, and labels.
- app/VolumeReader.tsx is new: the in scene reader overlay.
- app/ProgressLibrary.tsx gains a pointer handler on the canvas, so a tap on a
  volume that is already pulled out opens it, plus Enter on the focused canvas.
- app/globals.css gains the .rdr styles for the reader.
- next.config.ts basePath points at /vibelogs/posts/gutenberg-shelf.
- Cover images are Project Gutenberg cover scans, resized to 1200px wide webp
  under books/<id>/cover.webp.

## Opening a book

Pull a volume out, then tap it again and it opens in place. The shelf stays
mounted behind the overlay, so closing with Escape returns you to the same
volume rather than reloading the experience.

The reader lays a chapter out with CSS multi column, so the browser does the
pagination. Turning translates the column flow by two columns and plays a flip
against the gutter. Chapters come from lines like "CHAPTER IV", and any section
under 600 characters is dropped, which is what removes the contents listing
that otherwise becomes dozens of one line chapters.

## reader/

reader/index.html is a standalone fallback page, not part of the Next build.
reader/texts/ holds the full plain text of all 20 books, taken from Project
Gutenberg with the Gutenberg header and footer removed. Every one of these
works is in the United States public domain, which is why Gutenberg
distributes them. Only bibliographic metadata and these public domain texts
are stored.

## Rebuilding

    cd src && npm install && npm run build

The build writes to src/dist. Copy its contents up one level, then keep
reader/, LICENSE, THIRD_PARTY_NOTICES.md, and this file in place.
