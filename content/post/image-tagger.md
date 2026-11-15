---
title: "A Superabundance of Books, Neatly Arranged"
author: "Oran Looney"
date: 2026-11-11
publishdate: 2026-11-11
tags:
  - Computer Vision
  - LLM
  - Visualization
image: /post/image-tagger_files/lead.jpg
---

It started innocently enough. I'd see an interesting book cover and
right-click to save it to a Dropbox folder. Using a VLM to annotate and
categorize images for easy searchability just seemed like the logical next step.

I knew I had a problem when I started using cosine similarity on image embedding
vectors to weed out duplicates, but it wasn't until I
started using classic CV algorithms to detect quadrangles so I could automate the process of
cropping and orthorectifying book covers that my friends started
to worry about me.

Oran, they said. This can't go on. You've already collected nearly a thousand images.
When are you going to stop?

Oh, that's easy, I replied. When I hit 1,260. You could have supplied a calligraphy
class with the blankness of their stares.

You don't understand, I insisted. 1,260 is perfect. Well, not a *perfect* number, *per se*. 
Superabundant. And highly composite too!
But don't you see? That's *better* than perfect.
That's what makes it so perfect! Look, I've made a graph:

![Wall Divisibility Graph](/post/image-tagger_files/divisors.png)

That's when I learned an important lesson:
sometimes having visual aids prepared ahead of time doesn't make you seem *less* crazy. 
I know it seems unfair, but that's just how the world works.

## Organizing Images

Tags, categories, genres, descriptions.

Review tool. My initial idea is this wouldn't be necessary - I
could just edit the plaintext `metadata.csv` file directly. But
this quickly proved onerous because I'd have to first find the
exact row to edit. Putting the form side-by-side with the image
made things much easier, as did the simple dropdowns (which save
immediately, avoiding an extra click) and action buttons.

Another really nice thing was being able to use yellow highlighting
to flag common issues, like oversize images or high NSFW scores.

## Orthorectification

Hough transform and maximum quadrangle. 

Neither algorithm works. Having the VLM "guess" which one will work
*doesn't* work. Running both and having the VLM decide which one
worked better worked a little. Giving the VLM the opportunity to 
adjust the output a little worked even better. 

We still needed a human eye though. I'd say about 40% of the time,
the recommendation could be accepted without modification. 50% of
the time, a couple of corners would need to be tweaked by a few
pixels, but it still provided a good starting point, which saved a 
lot of time. And about 10% of the time, I'd just have to do it
manually.

So, we definitely needed an interactive tool for doing the perspective
correction and crop. 



https://www.oranlooney.com/books/

https://github.com/olooney/image-tagger
https://olooney.github.io/image-tagger/docs/example/dedupe_review.html
https://olooney.github.io/image-tagger/docs/example/wall.html
https://olooney.github.io/image-tagger/docs/example/gallery.html
https://olooney.github.io/image-tagger/docs/example/transform_review.html

![Hasse Diagram 1260](/post/image-tagger_files/1260_ranks.png)

/demos/1260/

## Safe for Work

Proved challenging because the open source content moderation models
I tried seemed trained only to detect nude photography and gave
painting and book covers a pass. I needed a model which could detect
mildly risque book covers, not just explicit pornography. 

The best model I found for this purpose was OpenAI's multimodal
content moderation API, which did a good job at assigning middling
scores to mildly risque book covers:

![Venus on the Half-Shell, by Kilgore Trout](/post/image-tagger_files/risque.png)


## Semantic Similarity Grid

![Etsy Grid](/post/image-tagger_files/etsy_grid.jpg)

* Vintage signs in the lower left
* Cute things in the lower right
* Clay figures upper right
* Masks center right
* Toys, games and puzzles center left
* Antiques upper left

## Number Theory

There are several ways to operationalize our intuition about what it means for a number like 1260 to have "lots" of divisors. 

It starts with an *ad hoc* definition about the percentage of numbers between 1 and 20 which divide it (not too far from Plato's discussion of 5040) and proceeds to two definitions involving the divisor function $\sigma_z(n)$: highly composite numbers and superabundant numbers. The numbers 1260 and 5040 share the infinitely rare property of being both highly composite and highly abundant; I say "infinitely rare" because there are only a finite number of numbers with both properties; [449 of them](https://oeis.org/A166981), in fact. 

See my [JupyterLite notebook][HCN] on highly composite and superabundant numbers for further exploration.

[HCN]: https://notebooks.oranlooney.com/lab/index.html?path=highly_composite.ipynb

## Color Theory

I used a simple [script](/post/image-tagger_files/color_cluster_treemap.py) to flatten
the wall down to its essential colors:

![Color Scheme](/post/image-tagger_files/book_wall_colors.png)

### Overall Impression

* Nostalgic and timeless - The terracotta, mustard, olive, and brown tones recall vintage book covers, old libraries, and mid-century interiors.
* Warm and inviting - The earthy reds and soft neutrals create a sense of comfort and belonging without feeling excessively cheerful.
* Intellectual and contemplative - Charcoal, slate blue, muted purple, and dark brown suggest seriousness, concentration, and introspection.
* Creative but restrained - The bright orange, yellow, and teal provide visual stimulation, balanced by subdued, desaturated surroundings.
* Grounded and authentic - The naturalistic colors evoke craftsmanship, organic materials, permanence, and an appreciation for things that age well.

### Emotional Balance

The palette has several interesting tensions:

- Warmth versus melancholy: The reds and ochres feel welcoming, but the extensive dark and muted areas add a slightly wistful quality.
- Energy versus stillness: Orange and yellow create moments of excitement, while the large charcoal, olive, and gray regions slow the visual rhythm.
- Nostalgia versus modernity: The earthy colors feel historical, while the flat geometric arrangement and teal introduce a contemporary sensibility.
- Individuality versus cohesion: The colors are varied and expressive, but their generally restrained saturation makes them feel related.
In five words: Nostalgic, thoughtful, grounded, creative, comforting.

The strongest impression is that of a quiet, intellectually stimulating environment with warmth and character - more like a thoughtfully curated personal library than a bright, energetic commercial space.

## Mistakes

The original idea was to have the user be able to use the filesystem as 
intended - moving images around, renaming them, editing them - and the 
metadata would just sit off to the side, treating the image file itself
as the source of truth but providing additional annotation.

What is the essence of an image? Not the filename; one of the main functions
of the pipeline is to rename files with a clean, meaningful filename. Not a
hash of the image contents; the pipeline can resize or crop images, convert
it between image formats. 

You can try to put an ID in the image EXIF data, but lots of tools (like MS Paint)
will strip that out when they touch an image.

If I had to do it all over again, I'd put all the metadata in a sqlite3 database,
and I'd use one database for all directories being managed, instead of one metadata
CSV and one vectors.npz per directory.

I think the identity problem could be solved if you watch the file system for changes
with something like [watchdog][WD]. If the contents change but the filename stays
the same, you can update size and other metadata. If the file extension changes, you
can infer it's actually the same image. If a new file appears which has the same
content as another at the same time the original disappears, you can infer that it
was moved. If a new image is saved with new contents and a new filename, you can
check the EXIF data for a unique ID. The only case that can't really be covered is
if all three change simultaneously - for example, if the user opens an image in 
MS Paint, crops it, and saves it as a new filename. The system would initially
detect that as a whole new image, but the semantic dedupe would later be able to
match and collapse them.

HTMX + Vanilla JavaScript worked OK. Very simple, very agent friendly. But the
tension between CLI and web app isn't great. The fundamental reason why the pure
CLI design doesn't work for this use case is because images are visual. You can
really work with them in the terminal. If I had to do it all over, I'd treat the
web app as the primary interface, with the CLI reserved for bulk operations or
scripting. 

Its becoming clear to me that "human in the loop" often requires a UI of some sort.

### Pipeline Orientation

Another thing I'd do differently is flip it from batch-oriented commands to 
item-oriented processing. That is, instead of first doing all the conversions,
then all the tagging, then all the NSFW scoring, then all the quadrangle detection,
I'd run all those steps for a single image, make it available for review, then
move on to the next image. This would let the user review images incrementally
instead of waiting for the batch to complete. The batch-oriented design was
dictated by the CLI design, where it made sense to have separate subcommands
which accepted a directory as a command line argument. This is another indication
that this use case would have been better served by designing it as an application
and not a CLI tool.

[WD]: https://pypi.org/project/watchdog/

