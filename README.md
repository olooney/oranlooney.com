Oranlooney.com
==============

Personal website, built with Blogdown/Hugo. Uses MathJax and highlight.js.

Development
-----------

* `python scripts/dev-server.py` to run a dev server that serves `/public` and auto-rebuilds on file changes.
* Or manually: `blogdown::build_site()` in R to rebuild, then serve `/public` with a static server.
* `python scripts/thumbnails.py` to rebuild the thumbnails for lead images.

Notes:

* Don't touch `themes/whiteplain/` if you can help it; over it in `layouts` instead.
* Don't touch `style.css` either, make CSS changes in `/static/custom.css` instead.
* Remember to manually update `static/search/index.html` when changing shared header, social, CSS, or Font Awesome assets.


Testing
---------

* Run `./scripts/setup-playwright.sh` to setup the test server, then `node scripts/check-mathjax.js`.
* Run `lychee .` in `/public/` to check links.


Deployment
----------

* `git push` to copy GitHub. 
* `sudo scripts/bin/stage` and check staging.
* `sudo scripts/bin/release` to copy staging to prod.

If something goes wrong:

* `sudo scripts/bin/rollback` to revert prod to the previous snapshot.
* `sudo scripts/bin/unstage` to revert staging to the previous snapshot.

To see the analytics:

* `uv run analytics.py`


Structure
---------

```
.
├── content/                    # Blog posts and pages
│   ├── post/                   # Articles
│   ├── about/                  # About me
│   ├── quotes/                 # Quotes & Poems
│   └── archives/               # Archive List
├── public/                     # Generated static site (output)
├── static/                     # Static assets (images, fonts, etc)
│   ├── games/                  # JS games and demos
├── layouts/                    # Custom Hugo templates
├── themes/whiteplain/          # Site theme
├── config.toml                 # Hugo configuration
├── scripts/                    # Dev and testing scripts
│   └── bin/                    # Deployment scripts (staging, release, rollback)
```
