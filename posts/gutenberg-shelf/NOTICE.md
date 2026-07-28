# The Gutenberg Shelf

This page is a static export of the Complete Shelf experience from
mintdotgg/mint-playground (experiences/complete-shelf), used under the MIT
license. The original copyright notice is kept in LICENSE next to this file.

Changes from upstream:

- src/app/catalog.ts holds the 20 most downloaded Project Gutenberg books
  instead of the demo catalog, generated from the Gutendex API on 2026-07-28.
- src/app/site-config.ts carries the collection name, wordmark, and labels.
- src/next.config.ts basePath points at /vibelogs/posts/gutenberg-shelf.
- Each catalog url points at reader/?b=<gutenberg id> instead of gutenberg.org,
  with the link label "Open and read".
- Cover images are Project Gutenberg cover scans, resized to 1200px wide webp
  under books/<id>/cover.webp.

## reader/

A separate static page, not part of the Next build. It renders a book as a
two page spread using CSS multi column layout, so the browser does the
pagination. Turning a page translates the column flow by two columns and plays
a flip animation. Chapters are detected from lines like "CHAPTER IV" and fall
back to 14000 character sections when a book has no chapter markers. Reading
position and text size are kept in localStorage.

reader/texts/ holds the full plain text of all 20 books, taken from Project
Gutenberg with the Gutenberg header and footer removed. Every one of these
works is in the United States public domain, which is why Gutenberg
distributes them.

## Rebuilding

    cd src && npm install && npm run build

The build writes to src/dist. Copy its contents up one level, then keep
reader/, LICENSE, THIRD_PARTY_NOTICES.md, and this file in place.
