Oranlooney.com
==============

Personal website, built with Blogdown/Hugo. Uses MathJax and highlight.js.

Development
-----------

* In R, `blogdown::build_site()` to rebuild `/public`.

* `python thumbnails.py` to rebuild the thumbnails for lead images.

Testing
-------

To setup the playright test server:

```
export WIN_HOST="$(ip route show default | awk '{print $3}')"
echo "WIN_HOST=$WIN_HOST"
echo "Base URL: http://$WIN_HOST:8080"
npm install -D playwright
npx playwright install chromium
sudo env "PATH=$PATH" npx playwright install-deps chromium
```

Then run `node check-mathjax.js`.

Run `lychee .` in `/public/` to check links.


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


