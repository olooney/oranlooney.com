---
title: "20,000 Years of Computing"
author: "Oran Looney"
date: 2025-09-21
publishdate: 2025-09-21
tags:
  - Computer Science
  - History
  - Math
image: /post/history-of-computing_files/lead.png
---

Ask the average CS student to tell you about the history of computing and
they'll probably start with [Babbage][CB]'s [Analytical Engine][AE]. Fair
enough: our modern conception of a "computer" is strongly linked to the
[universal Turing machine][UTM], which can take a program as input and carry
out an arbitrary computation<a
href="https://youtube.com/shorts/XKsPaX2NVOs?si=IyHbls2EdumElmsS">&mdash;</a>anything
less, we tend to dismiss as a mere "calculator." Since Babbage was the first to
propose a machine with conditional branching (making it Turing complete) it
does mark a watershed moment. 

But there's so much more to the story than that! Babbage's machine did not
spring Athena-like from his forehead; it was an iteration on a long tradition
of mechanical calculators and other technology. Considerations of computation
time, space, and precision go back for millennia, realized in tables and
ingenious tools that despite not having a single gear or transistor in them
still greatly enhanced our ability to carry out practical calculations.

I propose to flesh out the missing history, starting in prehistoric Africa and
ending in Victorian-era England. I won't be exhaustive; with so much ground to
cover even to try would exhaust both you and me. Instead, we'll go skipping
down the corridors of time like a stone across a still lake, touching down
only at key moments. That way, we'll have enough breathing room to really dig
into each breakthrough. If I do my job right, you'll practically hear a little
"Level Up!" chime with each discovery.

Let's start with the single oldest evidence of computation I'm aware of.


The Ishango Bone
----------------

The [Ishango Bone][IB] is a scraped and polished mammal bone, four inches (10
cm) long and probably around 20,000 years old. Divided into three separate
columns are sixteen groups of short, parallel, evenly spaced notches which
could only have been made with a sharp stone knife:

![Ishango Bone](/post/history-of-computing_files/ishango_bone.jpg)

It's quite hard to see the notches in the above picture, so here's an AI
recreation of what it would have looked like when new:

![Ishango Bone](/post/history-of-computing_files/ishango_bone_clean.png)

Archaeologists have found plenty of [tally sticks][TS] at dig sites around the
world, but what makes this one special are the numbers encoded in the grouped
tally marks. There are three series of numbers, carved into three separate
sides:

* 3, 6, 4, 8, 10, 5, 5, 7
* 11, 13, 17, 19
* 11, 21, 19, 9

It's not hard to spot the patterns:

* In the first series, we see many examples of doubling and halving.
* In the second, we see every prime number between 10 and 20.
* In the third, two pairs of numbers each differing by 10.

Is this just [pareidolia][PRD]? I don't think so. If we apply [Tenenbaum's
"number game" approach][MLPP], it becomes clear that it would be
extraordinarily unlikely for so many meaningful patterns to appear, even when
we consider the larger hypothesis space of other patterns we also would have
found "meaningful" (tripling, powers of two, Fibonacci sequences, etc.) In
particular, the doubling and halving of the first series suggests that some
kind of mathematical calculation is taking place, making the Ishango bone the
oldest piece of evidence we have of humans using an external object for
computation.


Cuneiform Tablets
-----------------

Which brings us to the first computer: the clay tablet. 

<a href="https://en.wikipedia.org/wiki/Plimpton_322" target="_blank">
    <img src="/post/history-of-computing_files/cuneiform_clay_tablet.png">
</a>

Operation is simple: you press into the soft, wet clay with a [stylus][CTS] to
make [cuneiform symbols][CNS]. You can smooth it over and re-use it for scratch
calculations, or bake it for permanent storage.

The above image is of [Plimpton 322][P322], a Mesopotamian clay tablet about
four thousand years old, showing a table of known [Pythagorean triples][PYT].
This suggests that even at that early date, mathematics had progressed beyond
counting and arithmetic and was already being studied for its abstract beauty.

"Wait," I hear you ask, "how is poking mud with a stick a computer?" To see
why, try the following 10-digit multiplication problem: 

\\[
\\begin{array}{r}
\\hspace{8mm} 6847027875 \\\\ 
\\times \\hspace{3mm} 2463797377 \\\\ 
\\hline
\\end{array}
\\]

<p>&nbsp;</p>

All done? Were you able to do it in your head? Or did you resort to pen and paper?

Look, here's the calculation shown in gory detail using the [grade-school multiplication][SMA] algorithm:

\\[
\\begin{array}{r}
\\hspace{8mm} 6847027875 \\\\ 
\\times \\hspace{3mm} 2463797377 \\\\ 
\\hline
47929195125 \\\\ 
479291951250 \\\\ 
2054108362500 \\\\ 
47929195125000 \\\\ 
616232508750000 \\\\ 
4792919512500000 \\\\ 
20541083625000000 \\\\ 
410821672500000000 \\\\ 
2738811150000000000 \\\\ 
13694055750000000000 \\\\ 
\\hline
16869689318670883875 \\\\ 
\\end{array}
\\]

To do it without recourse to external storage, you'd have to be able to store
a minimum of 51 digits in [working memory][WM]: ten each for the original
factors, eleven more for the row you're currently working on, and up to twenty
for the running sum of rows. And that's assuming that you compute the running
total after each row! A running total saves space but wastes time; it's much
easier to write out all the rows first and then sum up the rows with carry.
However, that approach requires at least 150 digits of working memory. Maybe
some trained mnemonist could do that, but I sure couldn't. 


The human brain has about [7±2 digits of working memory][MN7PM2], while a single
tablet can easily hold hundreds. Thus, while the tablet can't add even two
digits together, and a human can't store hundreds of digits in their head, the
system composed of the human and the tablet together *can*. So while it may not
seem like very advanced technology at first glance, by increasing the scribe's
effective working memory it trivializes calculations that would otherwise be
impossible.


Papyrus
-------

Before we move on, a brief word about papyrus. Why did I choose to talk about
clay tablets instead of papyrus? After all, the [Rhind and Moscow papyri][RMP]
are from roughly the same time period and also exhibit early abstract
mathematics:

![Rhind Papyrus](/post/history-of-computing_files/rhind_papyrus.png)

The reason is simple: papyrus was expensive and could not easily be reused. It
would have been used for important records, but was far too valuable to use as
scratch paper. Thus it would have been easily erasable clay tablets or
[ostraka][OST] that were actually used to carry out such calculations.


The Abacus
----------

You've certainly seen an abacus before:

![Abacus](/post/history-of-computing_files/abacus.jpg)

And you probably know that each column of beads encodes a single digit. But if
you haven't practiced using one, you probably don't have any idea how fluent
they can be.

Want to add two numbers? Your fingers already know the procedure: push these
beads up, carry one over there, slide a few back down. Multiplication and
division? Same story: the algorithms are encoded in muscle memory and can be
executed very quickly, almost without conscious thought.

In other words, the abacus isn't just a calculator; it’s a prototypical
[register machine][CSRM].

Feynman tells [this story][FVA] about winning against an abacus in a cube root
competition through a combination of pure luck and mathematical intuition.
Afterwards, he concludes:

> With the abacus, you don't have to memorize a lot of arithmetic combinations;
> all you have to do is to learn to push the little beads up and down. You
> don't have to memorize 9+7=16; you just know that when you add 9, you push a
> ten's bead up and pull a one's bead down. So we're slower at basic
> arithmetic, but we know numbers.

It's a funny anecdote, but I think his conclusion is backwards. Physicists
often start with simple models that can be understood intuitively and solved
exactly, and then add real-world complexity back in as a series of
[approximations][PPT] to obtain numerically precise predictions. Naturally,
Feynman views his approach (a moment of intuitive insight refined by later
calculation) as superior. But had he been a computer scientist he would have
realized that the very fact that the abacus operator was carrying out the
calculation *without* thinking about the specific numbers involved shows that
his approach is entirely [algorithmic][CSALG]. If there's one thing that
[Turing, Church, and Gödel][CTT] can all agree on, it's that [rote, unthinking
procedures][CSEM] are the essence of computation.


Ptolemy's Almagest
------------------

[Claudius Ptolemy][PT] was an astronomer active in 2nd-century CE Alexandria.
His [*Almagest*][PTA] is the second most successful textbook of all time,
surpassed only by Euclid's [*Elements*][EE]. It includes everything that
was known at the time about the theory and practice of astronomy and continued
to be widely used until the Copernican revolution in the 16th century.

There's a tremendous amount that could be said about this influential book but
we'll focus on only a section that has direct relevance to our topic: the
table of chords. If you want a more in-depth analysis of *Almagest* as a whole,
the blog [Following Kepler][FK] has done a multi-year [deep dive][FKA] into it. 

A "chord" is a line segment which connects two points on a circle. The table of
chords relates the opposite angle (in degrees) to the length of chord;
essentially the same relationship as $\sin(\theta)$ in modern trigonometry with
some scaling factors:

\\[
\operatorname{chord}(\theta) = 2 R \sin\left(\frac{\theta}{2}\right)
\\]

Ptolemy precalculated this chord length for a large number of angles and
published them as a table in his book. It wasn't quite the first such
table&mdash;Hipparchus had earlier developed a similar table of
chords&mdash;but that table is now lost and is thought to have been less
extensive than Ptolemy's.

Here is a small sample of Ptolemy's table, from a [later Latin edition][GCL]:

![Almagest Chord Table](/post/history-of-computing_files/almagest.png)

The column labeled "Arcu" is the angle; the "partes" is the angle in degrees
and the "m" (for minuta) is one-sixtieth of a degree, so we can see each
row represents a half-degree increment. 

The column labelled "Chordarum" is the chord length given to a precision of
about 1/3600, or about four decimal places. The table runs from $0^{\circ}$ to
$180^{\circ}$ in half-degree increments so has about 360 rows. It would have
been an impressive accomplishment in the 12th century, let alone the 2nd.

How did Ptolemy create this table? He used the theorem that bears his name to
this day. [Ptolemy's theorem][PTT] gives a relationship between the edges and
diagonals of a [cyclic quadrilateral][CQ]:

![Ptolemy Theorem](/post/history-of-computing_files/ptolemy_theorem.png)

\\[
    \overline{AD} \times \overline{BC} + 
    \overline{AB} \times \overline{CD} = 
    \overline{AC} \times \overline{BD} 
\\]

While seemingly elegant, it's probably not at all obvious at first glance how
this could have any practical use. It turns out, though, that it's a powerful
Swiss army knife for working with angles and chord lengths. To see how, let's
translate it into trigonometry so that it's more recognizable to modern
readers.

We do this by setting up the quadrilateral in a special way. We'll choose $B$
and $D$ to be exactly opposite on the circle, and the diameter $\overline{BD}$
to be exactly one. Then we consider two angles, $\alpha$ and $\beta$, on
opposite sides of this line:

![Angle Addition Theorem](/post/history-of-computing_files/angle_addition.png)

By the [inscribed angle theorem][IAT], $\angle DAB$ and $\angle DCB$ are both
right angles. That gives us two right triangles with hypotenuse $1$, so we
can easily label the edge lengths as $\overline{BC} = \sin(\alpha)$, 
$\overline{AD} = \cos(\beta)$ and so on.

Now we can apply Ptolemy's theorem. Since we chose $\overline{DB} = 1$, 
the right-hand side is just $\overline{AC}$. By the [law of sines][LOS],
$\overline{AC} = \sin(\alpha+\beta)$. Thus Ptolemy's theorem gives us the
[angle addition formula][AAF]:

\\[
    \sin(\alpha{+}\beta) = \sin(\alpha) \cos(\beta) + \cos(\alpha) \sin(\beta) 
\\]

It's this theorem that allowed Ptolemy to build out his table. He first
calculated $\sin(1^{\circ})$ and $\sin(½^{\circ})$ and repeatedly added them
together starting from the nearest known value (such as $\sin(30^{\circ}) = ½$)
until the entire table was filled in.

Perhaps this is the point where you leap up from your chair and loudly
complain, "how is this a computer? It's not even a machine! It's just a book!"

But a table *is* a computing device, just as much as a [TI-85][TI85]. It's an
external object that greatly reduces the time it takes to perform a
calculation. Even modern computers routinely trade [space for time][STT] with
lookup tables and caches.

How did Ptolemy decide on four decimal places? Why not three or five? He must
have known, probably through long experience, that after the handful of
calculations involved in finding the position of a planet you'd still be left
with three sig figs&mdash;enough to actually find the object in the sky. Such
considerations anticipate modern [numerical analysis][NA].


The Sector
----------

This device is called a [sector][SI]:


<a href="https://www.si.edu/object/italian-style-sector-jacobus-lusuerg:nmah_1127307" target="_blank">
    <img src="/post/history-of-computing_files/sector.png">
</a>

It seems kind of silly&mdash;it's just a hinge&mdash;but it's much more useful
than it first appears. The sector translates angles, for which there are few
useful tools, into distances, which can easily be manipulated with a
[compass][CDT].

The Smithsonian has an extensive [collection of historical sectors][SCS], from
which the above image is borrowed. 

[Galileo][GG] produced and sold a sector described in his 1606 book
[*The Operations of the Geometric and Military Compass*][LOC]. His version
included multiple scales in an attempt to squeeze as many useful functions into
a single device as possible. It was, in a word, the scientific calculator of
his day.

Chris Staecker has a good video demonstrating in detail the use of this
specific sector for those who want to go into the details:


<style>
.youtube-container {
    display: flex;
    justify-content: center;
}
iframe.youtube-iframe {
    aspect-ratio: 16 / 9;
    width: 100% !important;
}
</style>


<div class="youtube-container">
    <iframe class="youtube-iframe" src="https://www.youtube.com/embed/qmmRuh_xEiM?si=iBnrDEfJ8_hJTfQX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>


I want to draw attention to one scale in particular on Galileo's sector, the C
scale. The C scale is just a physical representation of Ptolemy's table of
chords. Open the sector to any angle and measure the distance across the sector
with a [compass][RC]; that's the chord length. Pick up the compass and move it
to the C scale on the sector; the value you read off is the angle in degrees.
This process can be reversed as well, allowing you to open the sector to a
particular angle that you only know as a number of degrees.

The disadvantage of using a sector for this purpose when compared to Ptolemy's
table is that you only get two or three sig figs, which is often sufficient
for practical navigation work but not necessarily for precise astronomy. The
advantage, of course, is that the operation is far more convenient than
consulting a table.

We'll see this tension between precision and computation time again when we
discuss the logarithm, but first I want to spend a little time on one of the
underappreciated giants of early computation.

Edmund Gunter
-------------

Edmund Gunter was a prolific inventor and proponent of practical computing
devices, tables, and techniques. Many of his inventions and incremental
improvements can be found in the posthumously published [*Works of
Edmund Gunter*][EGW]. A few of the more famous are Gunter's quadrant, a kind
of astrolabe:

![Gunter's Quadrant](/post/history-of-computing_files/gunter_quadrant.png)

A table of trig functions given to an unprecedented seven decimal places of precision:

![Gunter's Canon Triangulorum](/post/history-of-computing_files/gunter_table.png)

[Gunter's chain][EGC], used by surveyors to measure distances over rough
terrain which continued in common use until surprisingly recently:

![Gunter's Chain](/post/history-of-computing_files/gunter_chain.jpg)

And numerous others. Really, just go flip through his [book][EGW]; it's freely
available in full on the Internet Archive.

But the main reason I bring him up is so I can relate [this anecdote][EGS] which
I think tells us a lot about how computation was viewed until quite recently,
before Turing et al. put it on a respectable academic footing:

> \[Gunter\] brought with him his sector and quadrant, and fell to resolving
> triangles and doing a great many fine things. Said the grave knight [Savile],
> "Do you call this reading of geometry? This is showing of tricks, man!", and
> so dismissed him with scorn, and sent for Henry Briggs.

This quote stood out for me because it highlights the extent to which his
contemporaries fixated on theory and devalued computation, a theme we'll return
to later.


The Logarithm
-------------

The next leg of our journey is the logarithm, and in particular the two competing
(or perhaps complementary) ways of materializing it: the log table and the
slide rule.

The logarithm has its origin in an almost offhand comment by Michael Stifel on
the connection between exponents and arithmetic/geometric series in his book
[*Arithmetica Integra*][MSAI]:

<a href="https://archive.org/details/bub_gb_ywkW9hDd7IIC/page/n539/mode/2up">
  <img src="/post/history-of-computing_files/arithmetic_geometric_series.png" alt="Arithmetica Integra, Volume III, pg. 249">
</a>

The second comment under the table translates to, "Just as geometric
progression operates by multiplication and division, arithmetic progression
follows addition and subtraction." The table itself shows several examples of
negative and positive exponents of 2, clearly illustrating the point.

In modern notation, we would write:
\\[
\log(xy) = \log(x) + \log(y)
\\]

The power of this statement&mdash;the magic really&mdash;is that addition and
multiplication are far more closely related than anyone had guessed. The
practical relevance to computation is that *addition* and *subtraction* are considerably faster and
easier than *multiplication* or *long division*... so if they're basically the 
same thing, why not do it the easy way?


John Napier
-----------

Napier had already been searching for a way to make multiplication faster, and
had had some success with a device called [Napier's bones][NB]:

![Napier Bones](/post/history-of-computing_files/napiers_bones.jpg)

We don't know if Napier took inspiration from Stifel or not; *Arithmetica
Integra* was a very famous book (it introduced exponents and negative numbers)
so perhaps Napier had read it, or perhaps he developed the idea completely
independently. But at some point he grasped the importance of the logarithm and
how it could be used to efficiently perform multiplication.

He then spent an unknown number of hours in painstaking calculation over the
next twenty years working out his tables to seven decimal places in a book he
called the [*Mirifici Logarithmorum Canonis Descriptio*][MLCD], or the
*Description of the Wonderful Canon of Logarithms*, published in 1614.

After a brief description of how to use the table, the remaining [90 pages][NTOP] of 
the book all look like this:

![Wonderful Canon of Logarithms](/post/history-of-computing_files/napier_table.jpg)

They give the logarithms (and closely related sines) to seven decimal places.

Napier's book was a success and was immediately put to good use by scientists
such as [Johannes Kepler][JK], who referred to it as a "[happy calamity][JKHC]" because its
timely publication saved him an enormous amount of effort in the construction
of his own [planetary tables][JKRT].

[JKHC]: https://www.milestone-books.de/pages/books/001922/johannes-kepler/tabulae-rudolphinae-quibus-astronomicae-scientiae-temporum-longinquitate-collapsae?soldItem=true

Napier's table of logarithms was a monumental breakthrough. It was a personal
triumph: the glorious marriage of genius and industry. It attracted immediate
and widespread acclaim. And it was obsolete almost from the moment the ink was
dry.

Henry Briggs
------------

Napier had made one unfortunate decision in his table; he implicitly chose
a base of $\frac{1}{e}$ and a scale factor of $10^7$:

\\[
n(x) = -10^7 \ln\left(\frac{x}{10^7}\right)
\\]

I say "unfortunate" because this convention adds an ugly magic number to every
multiplication operation:

\\[
n(xy) = n(x) + n(y) - 161180956
\\]

This constant arises because $10^7 \ln\left(10^{7}\right) \;\approx\;
161180956.509\ldots$ Not a huge deal, but it does add an extra step to every
single calculation. 

It was [Henry Briggs][HB] (the same one mentioned in the Edmund Gunter anecdote
above) who realized that this constant could be eliminated entirely. He
proposed what we would today call the base 10 logarithm:

\\[
    \log\_{10}(xy) = \log\_{10}(x) + \log\_{10}(y)
\\]

Briggs discussed his idea with Napier, and then spent several years working out
the new and improved table by hand, ultimately publishing it as the [*Arithmetica
Logarithmica*][HBAL] in 1624. It included 30,000 rows and gave its results to
fourteen decimal places.

The logarithm revolutionized computation. Anyone who needed to multiply,
divide, or find roots of numbers to a high degree of precision could now do so
quickly and reliably. There was only one problem with the method: very often,
one needed only a handful of significant figures, for which purposes flipping
through the lengthy tables was overkill. What was needed was some convenient
way to do quick-and-dirty calculations.

<!--
[Jost Bürgi][JB2] - circular log table 

[JB2]: https://cacm.acm.org/blogcacm/jost-brgi-and-the-discovery-of-logarithms/

![Jost Bürgi Circular Logarithm](/post/history-of-computing_files/jost_burgi_circle.jpg)

A circle makes sense because every time you go up one order of magnitude, the
logarithm essentially repeats, just shifted over one decimal place.

Mechanical [circular slide rules][CSR] manufactured much later.

[CSR]: https://cacm.acm.org/blogcacm/rare-circular-slide-rules/

-->

The Slide Rule
---------------

I can't really do justice to the full [history of the slide rule][HSR], which saw
many improvements and incremental innovations during the three centuries in
which it was in widespread use, but will at least sketch its origin story.

Edmund Gunter was the [first][EGR] to print Napier's log scale on a ruler:

<a href="https://nzeldes.com/article/gunter/" target="_blank">
    <img src="/post/history-of-computing_files/gunter_rule.jpg">
</a>

In conjunction with a compass, it could be used in a conceptually similar way
to a log table. To multiply two numbers $x$ and $y$, first find where the
number $x$ is printed on the log scale and use a compass to measure the
distance to the origin. This distance is roughly $\log(x)$. Then find the point
where $y$ is printed. Pick up the compass, pinching its pivot so that it
retains its length, and add that distance to the point for $y$. Since these two
lengths added together make $\log(x) + \log(y) = \log(xy)$, the number printed on
the scale at this new point is $x \times y$. 

This isn't terribly precise; maybe two or three sig figs in practice. But it's
a lot faster than flipping through 90 pages of tables. 

It was [William Oughtred][WO] who took the next step and gave us the first
recognizable slide rule by simply placing two Gunter rules next to each
other. This eliminated the need for a compass and made the whole operation
quicker and more precise. Oughtred's original slide rule does not survive, so
here is a much later version:

<a href="https://unsplash.com/photos/a-large-ruler-mounted-to-the-side-of-a-wall-2IoVLcS3DnU?utm_content=creditShareLink&utm_medium=referral&utm_source=unsplash" target="_blank">
    <img src="/post/history-of-computing_files/slide_rule_closeup.jpg">
</a>

This later version features many innovations and ergonomic conveniences, such
as the cursor (a simple addition which greatly improves precision) and the
addition of other scales (for trigonometric functions, etc.) reminiscent of
the multiple scales engraved onto Galileo's sector.

Perhaps Oughtred would not have appreciated being remembered as "the inventor
of the slide rule" as he believed that mathematical proof was far more
important than mere calculation, which he likened to a juggler's tricks:

<a href="https://archive.org/details/bim_early-english-books-1475-1640_the-circles-of-proportio_oughtred-william_1632/page/n5/mode/2up" target="_blank">
    <img src="/post/history-of-computing_files/william_oughtred_dedication.png">
</a>

An attitude which echoes Savile's dismissal of Gunter. It's easy with the
benefit of hindsight to view this as naïve; after all, we know how important the
slide rule turned out to be, an importance that is only magnified when we view
it as a stepping stone to the modern computer. But none of this would have been
obvious even to the best minds of the time. Living in an essentially agrarian
society, writing with quill pens on parchment by candlelight, caught between
the church and feudal lords in a world of handcrafted objects, they could not
have conceived the value that a pocket slide rule would have to a 20th century
engineer.

> "Some of the greatest discoveries consist mainly in the clearing away of
> psychological roadblocks which obstruct the approach to reality; which is
> why, *post factum*, they appear so obvious."<br>&mdash;Arthur Koestler


Pascal
------

We enter the era of mechanical calculators in 1642 when [Pascal][BP]
invented a machine, charmingly called the [pascaline][PN], which could perform
addition and subtraction:

![The Pascaline](/post/history-of-computing_files/pascaline.jpg)

The primary problem that must be solved to build a working adding machine,
mechanical or electrical, is the [carry][CA]. Yes, I'm talking about that
operation you learned in elementary school, where you "carry the 1" when the
digits in a column add up to more than 10. This problem is far less trivial
than it sounds; even today, chip designers must decide to implement either a
simple [ripple-carry adder][RCA] or one of many competing designs for a
[carry-lookahead adder][CLA] depending on their transistor budget and logic
depth. Carry, it turns out, is the very soul of the adding machine.

That's why the pascaline represents such a crucial breakthrough: it featured
the world's first successful mechanical [carry mechanism][CM].

Still, the machine wasn't very useful - adding and subtracting aren't
particularly hard, and the time spent fiddling with the dials to input the
numbers easily dwarfed the time saved. The real prize would be a machine that
could multiply and divide, and that was the problem that [Gottfried Wilhelm
von Leibniz][GLCB] set out to solve.


Leibniz
-------

Leibniz, if you've only heard of him as a philosopher, may seem like an
unlikely person to tackle this problem. In philosophy he's chiefly remembered
for his incomprehensible theory of monads and for stating that this was the
best of all possible worlds, a point of view that was caricatured by Voltaire
as the thoroughly unworldly and deeply impractical Dr. Pangloss in his novel
*Candide*. 

But of course he also helped invent Calculus, proved that kinetic energy was a
conserved quantity distinct from momentum, designed hydraulic fountains and
pumps, and generally produced an enormous body of work that was original,
practical, and rigorous. If luminaries such as Voltaire viewed him as
ridiculous, it was perhaps because he was *too* logical; or rather that he kept
trying to apply rigorous logic to theology and the humanities, which is rarely
a recipe for success.

In fact, Leibniz is something of an unacknowledged [grandfather][WLC] of
computer science, with multiple parallel threads leading back to him. The first
of these is mechanical computation. Leibniz built the first 4-operation
calculator, which he called the [stepped reckoner][GLSR]:

![Leibniz's Stepped Reckoner](/post/history-of-computing_files/stepped_reckoner.jpg)

The name comes from a key internal component, the stepped drum, also known as
the [Leibniz wheel][LW]. This animation from Wikipedia perfectly illustrates
its operation:

<a href="https://en.wikipedia.org/wiki/Leibniz_wheel#/media/File:Cylindre_de_Leibniz_anim%C3%A9.gif" target="_blank">
    <img src="/post/history-of-computing_files/leibniz_wheel.gif">
</a>

Each time the drum makes one complete revolution, the smaller red gear rotates
by a number of ticks determined by its position. Slide the red gear to the top
of the drum, and it will catch all nine teeth and advance a full revolution.
Slide it part way down, and it will catch only some of the teeth and miss
others, resulting in less rotation. Thus, if you slide the red gear to a
position representing $n$ and perform $m$ complete rotations of the drum, the
rotation of the red axle will encode $n \times m$. Furthermore, the carry
increments by one each time the red axle completes one full rotation, so it's
not hard to imagine how a mechanical carry could be implemented. The full
stepped reckoner is simply a series of Leibniz wheels coupled by the [carry
mechanism][LCM].

Leibniz worked on his machine for decades, producing a series of prototypes,
giving live demonstrations, and writing several papers about it, but in his
lifetime the machine never worked well enough to see any practical adoption.
Despite its flaws, other inventors could see its potential and for the next [two
centuries][MC18], the Leibniz wheel and the [Pinwheel calculator][PWC] (a variation
which also traces back to Leibniz's 1685 book) would dominate the field. Nearly
every mechanical calculator produced in this time derived from Leibniz’s ideas.

Two centuries later, the Leibniz wheel would form the basis of the first
commercially successful mechanical calculator, the [Colmar arithmometer][ARTH]. 
Even a cursory glance at its internals shows how little the basic design had
changed:

<a href="https://www.crisvandevel.de/tdc.htm" target="_blank">
    <img src="/post/history-of-computing_files/arithmometer_internal.jpg">
</a>

So why did the Colmar succeed where Leibniz failed? The answer is simple: the
vast improvement in precision machining techniques in the intervening
centuries.

While we don’t have time to go into the full [history][MTH] of [precision][GB]
[machining][IPO] during the [industrial][DENG] [revolution][ASM], suffice it to
say that what was impossible for a lone craftsman in the 17th century was
commonplace by the 19th. Leibniz himself lamented the difficulties, saying:

> "If only a craftsman could execute the instrument as I had thought the model!"
> <br>&mdash;Leibniz

This is the main reason I don't think we would have ended up with a [steampunk
computing era][TDE] even if Leibniz or Babbage had gotten their machines to
work&mdash;machines made of metal and gears are orders of magnitude slower, more
expensive, and harder to work with than those made with [CMOS][CMOS] and
[photolithography][PLTH]. (Matthew Jones goes into considerable detail about
these technical and financial difficulties in his book, *[Reckoning with
Matter][RWM]*.) While limited by the technology of his time, Leibniz clearly
saw their vast potential:

> "It is unworthy of excellent men to lose hours like slaves in the labour of
> calculation which could safely be relegated to anyone else if machines were
> used."<br>&mdash;Leibniz

Formal Languages
----------------

There's another thread that links Leibniz to modern computer science, on the
theoretical rather than practical side. As a young man, he wrote a paper called
[*On the Combinatorial Art*][GLCA] where he envisioned encoding concepts as
numbers and operating on them algebraically. Throughout the rest of his life,
he tried to develop what he called "[Characteristica universalis][GLCU]", a kind
of universal formal language. One of his attempts in this direction, the
[plus-minus calculus][GLPM], was a formal, axiomatic language which presaged
Boolean algebra and set theory. He [dreamed][GLDM] of setting logic and
mathematics on the same solid foundation as Euclidean geometry so that
arguments could be [formally verified][FV]:

[FV]: https://en.wikipedia.org/wiki/Formal_verification
[GLPM]: https://iep.utm.edu/leib-log/#SH3c
[GLCA]: https://en.wikipedia.org/wiki/De_Arte_Combinatoria
[GLDM]: https://spectrum.ieee.org/in-the-17th-century-leibniz-dreamed-of-a-machine-that-could-calculate-ideas
[LPA]: https://en.wikipedia.org/wiki/Lean_(proof_assistant)
[MM]: https://us.metamath.org/
[GF]: https://en.wikipedia.org/wiki/Gottlob_Frege
[GLCU]: https://en.wikipedia.org/wiki/Characteristica_universalis

> "When there are disputes among persons, we can simply say, ‘Let us
> calculate,’ and without further ado, see who is right."
> <br>&mdash;Leibniz

Leibniz's ideas on this subject never got as far as he liked, but nevertheless
proved fruitful&mdash;[Frege][GF] cites Leibniz as an inspiration, placing him
at the head of the chain that led to Russell, Gödel, and the entire field of
formal logic and the foundations of mathematics. Today we have tools like
[Lean][LPA] or [Metamath][MM] which can automatically verify proofs.

When talking about Leibniz, it's easy to forget he was working in the 17th
century, not the 19th. His work would have been credible and relevant (and
perhaps better appreciated) even two centuries later.


Approximation Theory
--------------------

For this next section, I'm going to do something slightly inadvisable: I'm
going to deviate from strict chronological order and jump ahead a few decades
to discuss some mathematics that wasn't fully developed until decades after
Babbage's career. Later, we'll jump back in time to discuss the Difference
Engine. This detour is necessary to appreciate why the Difference Engine (the
sub-Turing precursor to the Analytical Engine) was such a good idea. Babbage
certainly understood in a rough-and-ready way that [finite difference
methods][FDM] were useful in approximating functions, but he couldn't have
known that in some sense they were all we really need, because Chebyshev hadn't
proved it yet.

[Pafnuty Chebyshev][PF] was a 19th-century Russian mathematician who is best
known for his theoretical work in number theory and statistics:

![Chebyshev's Magnificent Beard](/post/history-of-computing_files/chebyshev.png)

He was also very interested in the practical problem of designing linkages. A
[linkage][LKG] is a series of rigid rods that sweep a particular motion. They
are used in the design of everything from [steam engines][WL] to [oil
pumps][PJ]. Chebyshev even designed one himself that closely approximates
linear motion over a portion of its path without undue strain on any of the
rods:

<img style="height: 50%; width: 50%;" alt="Chebyshev Linkage" src="/post/history-of-computing_files/chebyshev_linkage.gif">

But it's not linkages as such that we're interested in, but rather how they
inspired Chebyshev. Trying to design a linkage that approximates a certain path
[led him][PFLA] to the abstract mathematical question of how well we can
approximate *any* function, which today we call [approximation theory][APT].

Chebyshev's most important result in this area was the [equioscillation
theorem][EQT], which shows that any well-behaved continuous function can be
approximated by a polynomial over a finite region with an uniform bound on
error. Such approximations will "oscillate" around the true value of the
function, sometimes shooting high, sometimes low, but always keeping to within
some fixed $\varepsilon$ of the true value.

![Equioscillation Example](/post/history-of-computing_files/remez.png)

Chebyshev's proof was non-constructive&mdash;it didn't tell you how to find
such a polynomial, only that it exists&mdash;but it certainly waggled its
eyebrows in that direction, and by 1934 Remez was able to work out the details
of just such an [algorithm][RMZ]. His algorithm tells us how to find the
coefficients of a polynomial using only a hundred or so evaluations of the
original function. It always works in theory and in practice it usually works
*very* well. Note the scale of the y-axis on the above plot; it shows an
8th-degree polynomial approximating $\sin(x)$ to an absolute error of less than
$10^{-9}$ over the region $[0, \tfrac{\pi}{2}]$. A 12th-degree polynomial can
approximate it to less than the [machine epsilon][ME] of a 64-bit float.

Its main practical limitation is that it requires the function to be bounded on
the target interval, but for many functions such as $\tan(x)$ that have poles
where it tends to infinity, the [Padé approximant][PADE] can be used instead.
The Padé approximant is the ratio of two polynomials:

\\[
R(x) = \frac{ 
    \displaystyle 
    \sum\_{i=0}^m a\_i x^i
}{ 
    \displaystyle
    1 + \sum\_{i=1}^n b\_i x^i
} = \frac{
    a\_0 + a\_1 x + a\_2 x^2 + \dots + a\_m x^m
}{
    1 + b\_1 x + b\_2 x^2 + \dots + b\_n x^n
}
\\]

This requires performing a single division operation at the end of the
calculation, but the bulk of the work is simply evaluating the two polynomials.

It's also true that the Remez algorithm only works over finite, bounded
intervals, but that is easily remedied through the simple expedient of breaking
the function up into different regions and fitting a separate polynomial to
each.

The practical upshot of all this is that to this day, whenever you use a
[function from a standard math library][PPA] when programming, it almost always
uses piecewise polynomial approximation under the hood. The coefficients
used for those polynomials are often found with the Remez algorithm
since the uniform bound to error it offers is very attractive in numerical
analysis but as they say on the BBC, [other algorithms][KAA] are available.

All of which is just a very long-winded way of saying polynomials are pretty
much all you need for a huge subset of practical computing. So wouldn't it be
nice if we had a machine that was really, really good at evaluating
polynomials?


The Difference Engine
---------------------

Babbage's first idea, the Difference Engine, was a machine for evaluating
series and polynomials. If it had been built, it could have rapidly generated
tables for 7th-degree polynomials to a high degree of precision and reliability.

"Just polynomials," you might ask, "not trigonometric functions, logarithms, or
special functions? Seems less useful than the older stuff we've already talked
about." Well, technically he proposed using the [finite difference
method][FDM], which is an early form of polynomial interpolation. This would
have worked well, as we saw above.

OK, so how did Babbage propose to automate polynomial evaluation? The key idea
is that differences turn polynomial evaluation into simple addition. If you
have a polynomial $p(x)$ and you want its values at equally spaced points $x,
x+1, x+2, \dots$, you can avoid recomputing the full polynomial each time.
Instead, you build a difference table:

- The *first differences* are the differences between consecutive values of the polynomial.  
- The *second differences* are the differences of those differences, and so on.  
- For a polynomial of degree $n$, the $n$-th differences are constant.  

Once you know the starting value $p(x)$ and all the differences at that point, 
you can get every subsequent value just by repeated additions. Let's take
the following polynomial as an example:

\\[
p(x) = x^3 - 2x^2 + 3x - 1
\\]

If we first evaluate this polynomial at a number of evenly spaced points and
then (working left to right) take the difference of consecutive rows, and 
take the differences of those differences and so on, we can construct a table
like so:

<style>
html .article table {
  width: 80%;
  margin: 0 auto;
}

html .article table td,
html .article table th
{
  font-size: 100% !important;
  text-align: center;
}
</style>

| $x$ | $p(x)$ | $\Delta p$ | $\Delta^2 p$ | $\Delta^3 p$ |
|-----:|---------:|--------:|-------------:|-------------:|
| 0    | -1       | 2       | 2            | 6            |
| 1    | 1        | 4       | 8            | 6            |
| 2    | 5        | 12      | 14           | 6            |
| 3    | 17       | 26      | 20           | 6            |
| 4    | 43       | 46      | 26           | 6            |

Crucially, after three differences (the same as the order of our polynomial)
the difference becomes constant. Why does that matter? Because we can reverse
the process. Working right to left, we can compute the differences and
ultimately $p(x)$ from the preceding row using nothing more complex than
addition! Here we've taken an integer step for the sake of clarity, but this
$\Delta x$ can be arbitrarily small, and the whole process can be used to
create large tables with high precision. The Difference Engine would have
automated this process, allowing it to generate large tables very efficiently.

The Difference Engine may not have had that magical Turing-completeness, but it
was still a very clever and important idea.


Conclusion
----------

You know the rest of the story. [Babbage][CB] moved on from the [Difference
Engine][CBDE] to the much more ambitious [Analytical Engine][AE]. Neither was
successfully completed: as Leibniz had found centuries earlier, designing
mechanical computers is a lot easier than actually getting them to work.
Despite this, [Ada Lovelace][AL] wrote the first [computer program][ALNG] for
it, targeting its envisioned [instruction set architecture][ISA].

After Babbage, there was a brief era of electro-mechanical computers: [Herman
Hollerith][HH] and the [punch card][HHPC], the [IBM 602 Calculating
Punch][IBM], the delightfully named [Bessy the Bessel engine][HMI], the
[Z3][Z3], and similar machines. Slide rules were still in common use until
WWII, and mechanical calculators such as the [Curta][CMC] were still being
manufactured as late as the 1970s. Meanwhile, [Turing][TM], [Shannon][SIF],
[Church][LC], [Gödel][GRF], [von Neumann][VNA], and [many others][HCS] were
putting computer science on a [firm theoretical foundation][CTT].

With the advent of the [transistor][TRN], [CMOS][CMOS] and
[photolithography][PLTH], it was clear that digital was the way to go. Today,
electronic computers are a billion (and, in some special cases like GPUs, a
trillion) times faster than their mechanical counterparts, while also being
cheaper and more reliable.

Despite this, not much has changed: we still use lookup tables, polynomial
approximation, and logarithms as needed to speed up calculations; the only
difference is we've pushed these down into libraries where we hardly ever
have to think about them. This is undoubtedly a good thing:

> "Civilization advances by extending the number of important operations which
> we can perform without thinking of them."
> <br>&mdash;Alfred North Whitehead

But if we stand on the shoulders of giants today, it is only because
generations of humans sat by smoky campfires scratching lessons onto bones to
teach their children how to count beyond their number of fingers, or stayed up
late into the night to measure the exact positions of stars, or tried to teach
a box of rods and wheels how to multiply. 

Archimedes once said, "Give me a place to stand and a lever long enough, and I
will move the Earth." It occurs to me that the computer is an awfully long
lever, except what it multiplies is not mechanical force, but thought itself. I
wonder what we will move with it.


<hr>

Appendix A: Related Books
-------------------------

Here are a few of the books I consulted while working on this article and which
you may find interesting if you'd like to learn more about these topics:

<style>
.bookshelf {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(333px, 1fr));
    gap: 20px;
    justify-content: center;
}
.book {
    width: 333px;
    height: 500px;
    object-fit: cover;
    display: block;
    margin: 0 auto;
}
</style>
<div class="bookshelf">
    <a href="https://www.amazon.com/Reckoning-Matter-Calculating-Innovation-2016-11-29/dp/B01NGZURDX" target="_blank">
        <img class="book" src="/post/history-of-computing_files/reckoning_with_matter.jpg" alt="Reckoning With Matter">
    </a>
    <a href="https://www.amazon.com/Daring-Invention-Logarithm-Tables-simplified/dp/0999140205" target="_blank">
        <img class="book" src="/post/history-of-computing_files/daring_invention_logarithm_tables.jpg" alt="The Daring Invention of Logarithm Tables">
    </a>
    <a href="https://www.amazon.com/Notebook-History-Thinking-Paper-ebook/dp/B0D3R76WBZ" target="_blank">
        <img class="book" src="/post/history-of-computing_files/notebook_history_thinking_matter.jpg" alt="The Notebook: A History of Thinking on Paper">
    </a>
    <a href="https://www.amazon.com/Little-History-Mathematics-Histories/dp/0300273738" target="_blank">
        <img class="book" src="/post/history-of-computing_files/little_history_mathematics.jpg" alt="A Little History of Mathematics">
    </a>
</div>

Note: I am not an Amazon affiliate, and I do not earn any commission from the links above.

Appendix B: IA and the Extended Mind Hypothesis
------------------------------------------------

Implicit in the above is the idea that external devices, even those as simple
as a clay tablet or a hinge, can be used to overcome our inherent limitations
and augment our intelligence. This is sometimes called [Intelligence
Amplification][IA] (IA) in deliberate contrast to AI.

Here are a few of the seminal works in the genre:

- [*As We May Think*][AWMT] (Vannevar Bush, 1945)
- [*Introduction to Cybernetics*][AITC] (W. Ross Ashby, 1956)
- [*Man-Computer Symbiosis*][MCS] (J. C. R. Licklider, 1960)
- [*Augmenting Human Intellect*][AHI] (Douglas Engelbart, 1962)
- [*The Extended Mind*][EMH] (Clark & Chalmers, 1998)

Note that none of these require anything as invasive as a [brain-computer
interface][BCI] but instead explore the implications of systems comprised of
both a human and a computer.

While all these works are basically futurist in character, the concept also
provides a very useful lens when looking back on the early history of
computing.


[AAF]: /post/angle-addition/
[AB]: https://www.cuemath.com/learn/abacus-history/
[AE]: https://en.wikipedia.org/wiki/Analytical_engine
[AHI]: https://www.dougengelbart.org/pubs/augment-3906.html
[AITC]: https://archive.org/details/introductiontocy00ashb
[ALNG]: https://en.wikipedia.org/wiki/Note_G
[AL]: https://en.wikipedia.org/wiki/Ada_Lovelace
[APT]: https://en.wikipedia.org/wiki/Approximation_theory
[ARTH]: https://en.wikipedia.org/wiki/Arithmometer
[ASM]: https://en.wikipedia.org/wiki/American_system_of_manufacturing#History "American System of Manufacturing – History"
[AV]: https://en.wikipedia.org/wiki/Adriaan_Vlacq
[AWMT]: https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/
[BCI]: https://en.wikipedia.org/wiki/Brain%E2%80%93computer_interface
[BP]: https://en.wikipedia.org/wiki/Blaise_Pascal
[CA]: https://en.wikipedia.org/wiki/Carry_(arithmetic)
[CBDE]: https://en.wikipedia.org/wiki/Difference_engine
[CB]: https://en.wikipedia.org/wiki/Charles_Babbage
[CDT]: https://en.wikipedia.org/wiki/Compass_(drawing_tool)
[CLA]: https://en.wikipedia.org/wiki/Carry-lookahead_adder
[CMC]: https://en.wikipedia.org/wiki/Curta
[CMOS]: https://en.wikipedia.org/wiki/CMOS
[CM]: https://en.wikipedia.org/wiki/Pascaline#Carry_mechanism
[CNS]: https://en.wikipedia.org/wiki/Cuneiform
[CQ]: https://en.wikipedia.org/wiki/Cyclic_quadrilateral
[CSALG]: https://en.wikipedia.org/wiki/Algorithm
[CSEM]: https://en.wikipedia.org/wiki/Effective_method
[CSRM]: https://en.wikipedia.org/wiki/Register_machine
[CTS]: https://cuneiform.neocities.org/CWT/howtowritecuneiform
[CTT]: https://en.wikipedia.org/wiki/Church%E2%80%93Turing_thesis
[DENG]: https://en.wikipedia.org/wiki/Dividing_engine "Dividing Engine"
[EE]: https://en.wikipedia.org/wiki/Euclid%27s_Elements
[EGC]: https://en.wikipedia.org/wiki/Gunter%27s_chain
[EGL]: https://www.nzeldes.com/HOC/Gunter.htm
[EGR]: https://nzeldes.com/article/gunter/
[EGS]: https://mathshistory.st-andrews.ac.uk/Biographies/Gunter/
[EGW]: https://archive.org/details/worksofedmundgun00gunt_0/page/n5/mode/2up
[EMH]: https://www.alice.id.tue.nl/references/clark-chalmers-1998.pdf
[EQT]: https://en.wikipedia.org/wiki/Equioscillation_theorem
[FDM]: https://en.wikipedia.org/wiki/Finite_difference_method
[FKA]: https://jonvoisey.net/blog/2018/05/almagest-index/#more-368
[FK]: https://jonvoisey.net/blog/
[FVA]: https://www.ecb.torontomu.ca/~elf/abacus/feynman.html
[GB]: https://en.wikipedia.org/wiki/Gauge_block#History "Gauge Block History"
[GCL]: https://journals.sagepub.com/doi/10.1177/00218286221140848
[GG]: https://en.wikipedia.org/wiki/Galileo_Galilei
[GLCB]: https://history-computer.com/people/gottfried-leibniz-complete-biography/
[GLSR]: https://en.wikipedia.org/wiki/Stepped_reckoner
[GRF]: https://en.wikipedia.org/wiki/General_recursive_function
[HBAL]: https://archive.org/details/arithmeticalogar00brig/page/n5/mode/2up
[HB]: https://en.wikipedia.org/wiki/Henry_Briggs_(mathematician)
[HCS]: https://en.wikipedia.org/wiki/History_of_computer_science
[HHPC]: https://www.columbia.edu/cu/computinghistory/hh/
[HH]: https://en.wikipedia.org/wiki/Herman_Hollerith
[HMI]: https://en.wikipedia.org/wiki/Harvard_Mark_I
[HP]: https://en.wikipedia.org/wiki/Hipparchus
[HSR]: https://en.wikipedia.org/wiki/Slide_rule#History
[IAT]: https://en.wikipedia.org/wiki/Inscribed_angle
[IA]: https://en.wikipedia.org/wiki/Intelligence_amplification
[IBM]: https://en.wikipedia.org/wiki/IBM_602
[IB]: https://en.wikipedia.org/wiki/Ishango_bone
[IPO]: https://en.wikipedia.org/wiki/Interchangeable_parts#Origins_of_the_modern_concept "Origins of Interchangeable Parts"
[ISA]: https://en.wikipedia.org/wiki/Instruction_set_architecture
[JB]: https://en.wikipedia.org/wiki/Jost_B%C3%BCrgi
[JKRT]: https://en.wikipedia.org/wiki/Rudolphine_Tables
[JK]: https://en.wikipedia.org/wiki/Johannes_Kepler
[KAA]: https://fiveable.me/lists/key-approximation-algorithms
[LCM]: https://alenasolcova.cz/wp-content/uploads/2017/10/G_W_-L_Compt3-20.pdf#page=17
[LC]: https://en.wikipedia.org/wiki/Lambda_calculus
[LKG]: https://en.wikipedia.org/wiki/Linkage_(mechanical)
[LOC]: https://www.loc.gov/resource/rbc0001.2010rosen1335/?st=gallery&c=80
[LOS]: https://en.wikipedia.org/wiki/Law_of_sines
[LW]: https://en.wikipedia.org/wiki/Leibniz_wheel
[MC18]: https://en.wikipedia.org/wiki/Mechanical_calculator#The_18th_century
[MCS]: https://groups.csail.mit.edu/medg/people/psz/Licklider.html
[ME]: https://en.wikipedia.org/wiki/Machine_epsilon
[MLCD]: https://en.wikipedia.org/wiki/Mirifici_Logarithmorum_Canonis_Descriptio
[MLPP]: https://raw.githubusercontent.com/kerasking/book-1/master/ML%20Machine%20Learning-A%20Probabilistic%20Perspective.pdf#%5B%7B%22num%22%3A3356%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C-88%2C560%2C0.75%5D
[MN7PM2]: https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two
[MSAI]: https://archive.org/details/bub_gb_ywkW9hDd7IIC/page/n539/mode/2up
[MTH]: https://en.wikipedia.org/wiki/Machine_tool#History "History of Machine Tools"
[NA]: https://en.wikipedia.org/wiki/Numerical_analysis
[NB]: https://en.wikipedia.org/wiki/Napier%27s_bones
[NTOP]: https://archive.org/details/mirificilogarit00napi/page/n161/mode/2up
[OST]: https://en.wikipedia.org/wiki/Ostracon
[P322]: https://en.wikipedia.org/wiki/Plimpton_322
[PADE]: https://en.wikipedia.org/wiki/Pad%C3%A9_approximant
[PFLA]: https://bhavana.org.in/math-and-motion-a-look-at-chebyshevs-works-on-linkages/
[PF]: https://en.wikipedia.org/wiki/Pafnuty_Chebyshev
[PJ]: https://en.wikipedia.org/wiki/Pumpjack
[PLTH]: https://en.wikipedia.org/wiki/Photolithography
[PN]: https://en.wikipedia.org/wiki/Pascaline
[PPA]: https://github.com/lattera/glibc/blob/master/sysdeps/ieee754/dbl-64/e_asin.c
[PPT]: https://en.wikipedia.org/wiki/Perturbation_theory
[PRD]: https://en.wikipedia.org/wiki/Pareidolia
[PTA]: https://en.wikipedia.org/wiki/Almagest
[PTTC]: https://en.wikipedia.org/wiki/Ptolemy%27s_table_of_chords
[PTT]: https://en.wikipedia.org/wiki/Ptolemy%27s_theorem
[PT]: https://en.wikipedia.org/wiki/Ptolemy
[PWC]: https://en.wikipedia.org/wiki/Pinwheel_calculator
[PYT]: /post/complex-r/
[RCA]: https://en.wikipedia.org/wiki/Adder_(electronics)#Ripple-carry_adder
[RC]: https://en.wikipedia.org/wiki/Reduction_compass
[RMP]: https://old.maa.org/press/periodicals/convergence/mathematical-treasure-the-rhind-and-moscow-mathematical-papyri
[RMZ]: https://en.wikipedia.org/wiki/Remez_algorithm
[RWM]: https://www.amazon.com/Reckoning-Matter-Calculating-Innovation-2016-11-29/dp/B01NGZURDX
[SCS]: https://www.si.edu/spotlight/sectors
[SIF]: https://en.wikipedia.org/wiki/Information_theory
[SI]: https://en.wikipedia.org/wiki/Sector_(instrument)
[SMA]: https://en.wikipedia.org/wiki/Multiplication_algorithm
[STT]: https://en.wikipedia.org/wiki/Space%E2%80%93time_tradeoff
[TDE]: https://en.wikipedia.org/wiki/The_Difference_Engine
[TI85]: https://en.wikipedia.org/wiki/TI-85
[TM]: https://en.wikipedia.org/wiki/Turing_machine
[TRN]: https://en.wikipedia.org/wiki/Transistor
[TS]: https://en.wikipedia.org/wiki/Tally_stick
[UTM]: https://en.wikipedia.org/wiki/Universal_Turing_machine
[VNA]: https://en.wikipedia.org/wiki/Von_Neumann_architecture
[WLC]: https://en.wikipedia.org/wiki/Gottfried_Wilhelm_Leibniz#Computation
[WL]: https://en.wikipedia.org/wiki/Watt%27s_linkage
[WM]: https://en.wikipedia.org/wiki/Working_memory
[WO]: https://en.wikipedia.org/wiki/William_Oughtred 
[Z3]: https://en.wikipedia.org/wiki/Z3_(computer)

