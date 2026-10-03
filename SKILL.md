---
name: vibelogs
description: How to add a new page or link to Rahul's site (rahulch.site, repo vibedatascience/vibelogs on GitHub Pages). Use whenever asked to add or edit something on vibelogs.
---

# vibelogs

Live at https://rahulch.site/. Pushing to main deploys in about 90 seconds.

Do only what the user asks. Everything beyond the request is added on demand.

## Adding a new link on the homepage

Every new page gets one entry inside `#entries` in index.html. Order does not matter; the page's JavaScript sorts entries.

```html
<a class="entry" data-date="YYYY-MM-DD" data-pin="0" data-tags="<tag>" href="<path>/">
  <div class="meta"><span>[YYYY-MM-DD]</span><span class="tag">Tag label</span></div>
  <h2>Title</h2>
  <p>One-line description.</p>
</a>
```

- `data-tags` must match a filter button on index.html: apps-tools, data-visualizations, learning-tutorials, walks-places, books-art-essays, reference.
- `data-pin="1"` pins a reference page to the top.
- Gallery view shows `<href>thumb.jpg`, so put a thumb.jpg in the page's folder.
