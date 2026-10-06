# Page comments

Rahul comments on pages at `rahulch.site/<page>/comments`. Each page's comments are in `comments/<slug>.json`.

- Slug is the page path without slashes. Nested paths join with `__` (`/state-tiles/ny/` is `state-tiles__ny`). The homepage is `index`.
- `/comments/` on the site lists every comment across pages.
- Read-only agents can fetch `https://rahulch.site/comments/<slug>.json` (about 90 seconds behind) or `https://raw.githubusercontent.com/vibedatascience/vibelogs/main/comments/<slug>.json`.

## Fields

| Field | Meaning |
|---|---|
| `id` | Stable id. Never change it. |
| `status` | `open` or `resolved`. Work only on `open`. |
| `quote` | Exact text he selected. Empty means the comment is about the whole page. |
| `section` | Nearest heading above the quote. |
| `context` | The table row (cells joined with ` \| `) or paragraph around the quote. |
| `prefix`, `suffix` | About 40 characters before and after the quote. Used to place the highlight. |
| `comment` | What he wants. |
| `reply`, `by`, `resolved` | Set these when you close a comment. |

## Addressing comments

1. `git pull`. Read `comments/<slug>.json`. Find each `quote` in the page source (usually `<slug>/index.html`).
2. Make the change the `comment` asks for.
3. For each comment you handled, set `"status": "resolved"`, `"resolved"` to the ISO time, `"by"` to your name (for example `"Claude"`), and `"reply"` to one line that says what changed.
4. If you did not do a comment, leave it `open` and put the reason in `reply`.
5. Do not delete comments. Do not change `quote`, `prefix` or `suffix`.
6. Commit the page and the JSON together: `<Page>: address comments`. Push to main.

The page shows resolved comments greyed out with your reply, so Rahul can check the change in place.

## Private pages

A page with `<meta name="comments" content="local">` keeps comments in the browser only. Rahul hands those over with the "Copy open" button.
