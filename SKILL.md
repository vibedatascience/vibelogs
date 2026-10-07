---
name: vibelogs
description: How to add a new page or link to Rahul's site (rahulch.site, repo vibedatascience/vibelogs on GitHub Pages). Use whenever asked to add or edit something on vibelogs.
---

# vibelogs

Live at https://rahulch.site/. Pushing to main deploys in about 90 seconds.

Do only what the user asks. Everything beyond the request is added on demand.

## Homepage

index.html is a short intro and a row of past employers. It does not list pages. Do not add page links to it unless the user asks.

## Adding a new page

Every new page gets a link in all/index.html, the "all pages" index (linked from the homepage nav). One line per date, newest first:

```html
<p>YYYY-MM-DD - <a href="../<path>/">Title</a>, <a href="../<path2>/">Title 2</a></p>
```

- If the date already has a line, add the link to that line.
- Pages that belong together go in one group: `Group name (<a ...>Title</a>, <a ...>Title</a>)`.
- Sections with sub-pages (like state-tiles) are listed only by their hub page.

## Page comments

When asked to address comments on a page, follow COMMENTS.md.
