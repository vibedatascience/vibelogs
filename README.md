# vibelogs
Rahul's Site. Live at https://rahulch.site/

## Comment mode

Add `/comments` to any page URL (for example `rahulch.site/baby-shower/comments`) to comment on it like Google Docs. Select text to comment on it, or use "+ Page note" for the whole page.

- Comments save to `comments/<slug>.json` in this repo through the GitHub API. Each browser needs a GitHub token once: open any comment URL with `#t=<token>` or paste it under "Sync".
- `rahulch.site/comments/` lists open comments across all pages.
- Agents address comments by following [COMMENTS.md](COMMENTS.md).
- Code: `404.html` loads the page for any `/comments` URL and adds `comments.js`.
