# AGENTS.md

This is the source for oranlooney.com, a personal Blogdown/Hugo site using MathJax.


## Scope

These instructions apply to the entire repository unless a more specific instruction file overrides them.


## Repository Guardrails

- Treat `public/` as generated output and never touch it. You can, however, read it to review generated HTML.
- Avoid editing `themes/whiteplain/`. Make local overrides in `layouts/`.
- Avoid editing `style.css`. Make CSS changes in `static/css/custom.css`.
- When changing cache-busted static assets such as `static/css/custom.css`, bump the corresponding `?v=` version once per commit in `layouts/partials/head.html`. Do not bump the version for every individual edit within the same commit.
- Do not run deployment/staging/release commands unless the user explicitly asks.
- Keep changes narrow and preserve the author’s voice. For prose edits, prefer spelling, grammar, clarity, and small rhythm fixes over rewriting.


## Development Commands

- Use `just serve` to run the local dev server.
- Use `just build` for a one-shot Blogdown/Hugo build.
- Use `just clean` to empty `public/`, or `just rebuild` to clean and build.
- Use `just thumbnails` to rebuild lead image thumbnails.


## Content Structure

- Blog posts live in `content/post/`.
- Section pages such as search, quotes, about, and archives live under `content/<section>/`.
- Static post assets generally live under `static/post/<post-slug>_files/` and are referenced as `/post/<post-slug>_files/...`.
- Lead images are declared in front matter with `image: /post/<post-slug>_files/lead.jpg` or similar.
- Front matter commonly includes:
  - `title`
  - `author: "Oran Looney"`
  - `date`
  - optional `publishdate`
  - `tags`
  - `image`


## Markdown Style

- Use reference-style Markdown links for most prose links.
- Link reference labels are usually short upper-case initialisms, for example `[ABC]`, `[WSC]`, or `[50PP]`.
- Put link reference definitions at the bottom of the post, after any footnotes.
- Preserve existing heading style within a post.
- Preserve MathJax syntax such as `$...$`, `\frac{...}{...}`, and display math already present in the file.
- Use fenced code blocks with explicit language tags where appropriate.
- Existing posts may contain raw HTML for layout, images, footnotes, and special formatting. Preserve it all exactly; it's there for a reason.


## Footnote Convention

When adding footnotes to a post, do not use Markdown footnote syntax like `[^1]`.
Instead, use inline HTML footnote markers that link to a paragraph at the bottom via an id:
Place the `maintextN` anchor at the start of the relevant paragraph, list item, or question, even if the visible footnote marker appears later, so returning from the footnote shows the whole context.

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

For multiple footnotes, use sequential ids such as `maintext1`, `maintext2`, `footnote1`, and `footnote2`. Existing posts use symbols such as `*` and `&dagger;`; match the local context.


## Quotes

Format epigraph-style or cited block quotes as Markdown blockquotes, with the citation on the final quoted line using an HTML line break and an HTML em dash entity:

```markdown
> Quote text goes here over one or more lines.
> <br>&mdash;Author Name
```

For a work title in the citation, use Markdown emphasis:

```markdown
> <br>&mdash;Author Name, *Work Title*
```

## Copyediting

- When asked to review, do a tight, narrow copyedit pass that fixes only spelling, grammar, and Markdown formatting errors.
- Make minimal edits and fix unambiguous errors only.
- Do point out factual or technical errors in the chat, but do not fix these unless explicitly asked to.
- Existing posts often use HTML entities such as `&mdash;` and `&deg;`. Preserve this style when editing nearby text.
- The prose voice is intentionally conversational, technical, and essayistic, not formal or academic. Do not flag informal language.