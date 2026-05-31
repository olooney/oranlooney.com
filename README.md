Oranlooney.com
==============

Personal website, built with Blogdown/Hugo. Uses MathJax and highlight.js.

Development
-----------

* `python scripts/dev-server.py` to run a dev server that serves `/public` and auto-rebuilds on file changes.
* Or manually: `blogdown::build_site()` in R to rebuild, then serve `/public` with a static server.
* `python scripts/thumbnails.py` to rebuild the thumbnails for lead images.


Testing
---------

* Run `./scripts/setup-playwright.sh` to setup the test server, then `node scripts/check-mathjax.js`.
* Run `lychee .` in `/public/` to check links.


Deployment
----------

* `git push` to copy GitHub. 
* `sudo bin/stage` and check staging.
* `sudo bin/stage_branch BRANCH_NAME` to stage a branch.
* `sudo bin/release` to copy staging to prod.

If something goes wrong:

* `sudo bin/rollback` to revert prod to the previous snapshot.
* `sudo bin/unstage` to revert to staging to the previous snapshop.

To see the analytics:

* `uv run analytics.py`


