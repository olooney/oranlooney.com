Replacement Blog, now with blogdown and Hugo.

Run `python thumbnails.py` to rebuild the thumbnails for lead images.

Delete the `public` folder and use `blogdown::build_site()` to completely
rebuild the static site.

`git push` to copy to github. Then on the server, `bin/stage` and 
checking <http://staging.oranlooney.com>. Finally, `bin/release` to 
publish the content to <https://www.oranlooney.com>.
