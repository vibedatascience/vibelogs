---
name: vibelogs
description: How to add and edit posts on Rahul's vibelogs site (GitHub Pages blog, repo vibedatascience/vibelogs). Use this skill whenever asked to add a post, page, or rule to vibelogs / the blog, or to deslop its content.
---

# vibelogs skill

Personal blog of AI walkthroughs and reference pages. Live at
https://vibedatascience.github.io/vibelogs/

## Repo access

Clone with the GitHub PAT from the user's custom instructions (fine-grained, CONTENTS READ/WRITE ONLY):

```
git clone https://x-access-token:<PAT>@github.com/vibedatascience/vibelogs.git
```

The token cannot rename repos, create repos, enable Pages, or call most non-contents API endpoints (403). Pages deploys automatically on push to main via Actions.

## Structure

```
index.html                 homepage
about.html
posts/<slug>/index.html    one folder per post, assets live next to index.html
  dated slug (2026-07-16-topic) for walkthrough posts
  bare slug (ai-slop-detection) for living reference pages (stable URL)
```

There is no build step and no shared CSS file. Every page carries its own inline <style> block. When creating a new post, copy the <style> block from an existing post verbatim.

## Homepage

The homepage has:

- A top-right nav linking to posts/links/ and posts/ai-glossary/.
- Tag filter buttons.
- A view toggle (LIST or GALLERY) and a sort toggle (DATE or THEME).

All entries live in a hidden `#entries` container. JavaScript groups and renders them into `#rendered` based on the active filter, view, and sort. Do not add markup to `#rendered`; it is rebuilt on every interaction.

Each entry must carry `data-date="YYYY-MM-DD"` and `data-pin` ("1" for reference pages, pinned to the top under date sort; "0" for dated posts).

## Design system (do not deviate)

- Palette: paper #FAFAF8, ink #17171C, cobalt #2545FF, muted #6E6E76, rule #E7E7E2, chip #EEF1FF
- Fonts: Space Grotesk (display), IBM Plex Mono (metadata/labels), Inter (body)
- Post metadata line: [YYYY-MM-DD] + author byline "Rahul" + tag chip. Every post page also carries <meta name="author" content="Rahul">.
- Tags: AGENTS, TOOLING, LLM-APPS, DATA-SCIENCE, REFERENCE, NOTES. New tag = add a filter button on index.html
- Components available in post CSS: pre/code blocks, .gotcha callouts (GOTCHA · LABEL), .pipeline ASCII diagrams, tables

## Adding a post

1. Create posts/<slug>/index.html by copying an existing post and replacing title, meta line, and <article> body.
2. Add one entry block inside `#entries` on index.html (order there does not matter; JS sorts):

```html
<a class="entry" data-date="YYYY-MM-DD" data-pin="0" data-tags="<tag-lowercase>" href="posts/<slug>/">
  <div class="meta"><span>[YYYY-MM-DD]</span><span class="tag">TAG</span></div>
  <h2>Title</h2>
  <p>One-line description.</p>
</a>
```

Reference pages use `data-pin="1"` and a meta line of `[updated YYYY-MM-DD]`.

Inside the post page itself the meta line is: `<span>[YYYY-MM-DD]</span><span>Rahul</span><span class="upd">updated YYYY-MM-DD</span><span class="tag">TAG</span>`. The publish date never changes; bump the "updated" date to today on every content edit to that post.

3. Commit as "Rahul", push to main.
4. Verify live: sleep ~75-90s, then curl the page and grep for new content. A 404 or stale content right after push is normal.

## Writing rules (MANDATORY)

All content must pass the site's own reference page: posts/ai-slop-detection/index.html. Read it before writing. Hard rules:

- No "It's not X, it's Y" constructions.
- No sentence fragments; full sentences always, except inside bullet points.
- No parallel-structure stat ledes.
- No AI vocabulary (delve, leverage, seamless, robust, ...) or ad-speak.
- Minimal language throughout. Terse.
- Punctuation style (dashes, quote marks, heading case) is cosmetic and not enforced.

## Repo rules

- Add ONLY what the user dictates. Do not embellish reference pages with extra items unless asked.
- Never publish internal Pinterest details: no internal hosts, model names, or proxy call formats. Genericize as "internal LLM proxy".
- Redact API keys in published code samples (YOUR_KEY). Never commit credentials.
