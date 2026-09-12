# AGENTS.md

This is the source for oranlooney.com, a personal Blogdown/Hugo site using MathJax.

## Repository Guardrails

- Treat `public/` as generated output and never touch it. You can, however, read it to review generated HTML.
- Avoid editing `style.css`. Make CSS changes in `static/css/custom.css`.
- When changing cache-busted static assets such as `static/css/custom.css`, bump the corresponding `?v=` version once per commit in `layouts/partials/head.html`. Do not bump the version for every individual edit within the same commit. If you've already bumped the version in this session, don't bump it again.
- Do not add a web app manifest or `<link rel="manifest">`; this site should *never* prompt visitors to install it as an app.
- Do not run deployment/staging/release commands.

## Copyediting

- When asked to review, do a tight, narrow copyedit pass that fixes only spelling, grammar, and Markdown formatting errors.
- Make minimal edits and fix unambiguous errors only. Do not make stylistic suggestions.
- The prose voice is intentionally conversational, technical, and essayistic, not formal or academic. Do not flag informal language.
- Do point out factual or technical errors in the chat, but do not fix these unless explicitly asked to.


## Development Commands

- Assume `just serve` is already running and serving on http://localhost:8080/
- Never run `just serve`, `just build` or `just rebuild` yourself. If necessary, ask the user to do that.
- After moving or deleting files, use `just clean` to empty `public/`. Do not do this after adding or modifying files.
- After adding, moving, or modifying lead images, use `just thumbnails` to rebuild lead image thumbnails.
- run `just lint` to ensure no undesired Unicode characters slip through.


## Browser Testing

- Use the Playfair MCP server against `http://localhost:8080/`.
- Test a screenshot of the home page `/`, first article, and `/about/` to verify the layout visually.
- Test both JavaScript and no-JavaScript modes when checking progressive enhancement.
- For `/search/`, test a real hit, a zero-result query, and the no-JS fallback message.
- For `/quotes/`, test filtering, category anchors, flashcards, and readable no-JS content. Click through 4 flashcards.
- For icon strips, DOM visibility is not enough; use `screenshot_page` to confirm Font Awesome glyphs visibly render.
- In no-JS mode, confirm JS-only controls are hidden while normal links and content still work.
- Make no code changes during browser testing, but only report results.


## Content Structure

- Blog posts live in `content/post/`.
- Section pages such as search, quotes, about, and archives live under `content/<section>/`.
- Static post assets generally live under `static/post/<post-slug>_files/` and are referenced as `/post/<post-slug>_files/...`.
- Lead images are declared in front matter with `image: /post/<post-slug>_files/lead.jpg` or `.png`.
- Front matter commonly includes:
  - `title`
  - `author: "Oran Looney"`
  - `date`
  - optional `publishdate`
  - `tags`
  - `image`
  - optional `home`

Use a far-future `publishdate` to suppress draft articles from the site.
Set `home: false` to suppress older, less important articles from the the home page list.


## Markdown Formatting

- Existing posts often use HTML entities such as `&mdash;` and `&deg;`. Preserve this style when editing nearby text.
- In general, use ASCII whenever possible, such as for quotes and hyphens; Blogdown will expand these later.
- Unicode can be used sparingly for Japanese characters or other characters without good ASCII alternatives or well-known, commonly-used HTML entities.
- Refer to `scripts/lint.py` or run `just lint` if you aren't sure if Unicode is appropriate or not.
- Use reference-style Markdown links for most prose links.
- When the user asks to include post image assets, embed them with Markdown image syntax like `![alt text](/post/<post-slug>_files/image.png)` rather than plain links.
- Link reference labels should be short upper-case initialisms, for example `[ABC]`, `[WSC]`, or `[50PP]`.
- Put link reference definitions at the bottom of the post, after any footnotes.
- Preserve existing heading style within a post.
- Preserve MathJax syntax such as `$...$`, `\frac{...}{...}`, and display math already present in the file.
- Use `$...$` for inline MathJax and `\\[...\\]` for display MathJax. Do not use `$$...$$` display delimiters. The doubled backslashes preserve MathJax's `\[...\]` delimiters through Hugo's Markdown processing. For example:

  ```markdown
  Inline math: $x^2$.

  \\[
  x^2 + y^2 = z^2
  \\]
  ```
- Use fenced code blocks with explicit language tags where appropriate.
- Existing posts may contain raw HTML for layout, images, footnotes, and special formatting. Preserve it all exactly; it's there for a reason.


## Footnote Convention

When adding footnotes to a post, do not use Markdown footnote syntax like `[^1]`.
Instead, use inline HTML footnote markers that link to a paragraph at the bottom via an id:
Place the `maintextN` anchor at the start of the relevant paragraph, list item, or question,
even if the visible footnote marker appears later, so returning from the footnote shows the whole context.

```markdown
<p id="maintext1">
Text that needs a note<a href="#footnote1"><sup>*</sup></a> continues here.
</p>
```

At the bottom of the article, before link reference definitions, put the footnotes in their own section:

```markdown
<hr>
Footnotes
---------

<p id="footnote1">
    <sup><a href="#maintext1">*</a></sup>
    Footnote text goes here.
    <a href="#maintext1">Back</a>
</p>
```

For multiple footnotes, use sequential ids such as `maintext1`, `maintext2`, `footnote1`, and `footnote2`.
Use traditional footnote symbols such as `*` and `&dagger;`; match the local context.


## Quotes

Inside of posts, format epigraph-style or cited block quotes as a Markdown blockquote.
Put the citation on the final quoted line using an HTML line break and an HTML em dash entity:

```markdown
> Quote text goes here over one or more lines.
> <br>&mdash;Author Name
```

For a work title in the citation, use Markdown emphasis:

```markdown
> <br>&mdash;Author Name, *Work Title*
```

For the quotes page (`content/quotes/_index.md`) only, use a similar convention
but surrounded by ASCII double quotes instead of using a blockquote. Always put
exactly two blank lines between adjacent quotes:

```markdown
"The most effective debugging tool is still careful thought, coupled with
judiciously placed print statements."
<br>&mdash;Brian Kernighan


"Never test \[at runtime\] for an error condition you don't know how to handle."
<br>&mdash;Steinbach
```


