---
title: "The Deep History of Computation"
author: "Oran Looney"
date: 2024-12-08
publishdate: 2024-12-08
tags:
  - Computer Science
  - History
image: /post/deep-history_files/lead.png
---

A typical account of the history of computers and computer science starts with
[Babbage][CB] and his [Analytical Engine][AE]. There's some logic to that: our
modern conception of a "computer" is more or less synonymous with a [universal
Turing machine][UTM], which is to say a machine which can take a program as
input and carry out an arbitrary computation - anything less we tend to dismiss
as a mere "calculator."



Nor were considerations of time complexity ignored - when every operation is
carried out by hand, and the entire program might take years or even a lifetime
to complete, they naturally.

Babbage's machine did not spring Athena-like from his forehead.

Timeline
--------

Ancient
-------


I have a confession to make; despite having a degree in Mathematics, I cannot
multiply large numbers myself. For example, what $6847027875 \\times 2463797377$? I
couldn't work that out to save my life.

You're probably thinking, oh it's a little tedious, but surely with pen and
paper anyone could do it in a few minutes. Of course; so could I. The system
consisting of "me + pencil + paper" wouldn't have any problem. But we're not
talking about *that* composite system; we're just talking about *me*. And the
truth is, if I closed my eyes and climbed into an sensory deprivation chamber
and tried to do that multiplication problem in my head, I couldn't, not for
love or money.

Look, here's the calculation shown in full using [grade-school multiplication][SMA]:

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

To do that in your head, you'd have to be able to juggle about fifty digits: ten
each for the original factors, eleven more for the row you're currently working on,
and up to twenty for the running sum of rows. Maybe some trained mnemonist could, but I
can't; and I'll bet a dollar it'd give you some trouble as well.

[SMA]: https://en.wikipedia.org/wiki/Multiplication_algorithm

The point is that just one sheet of paper&mdash;less than 1,000 bytes of 
storage&mdash;is enough to make an impossible task possible, even easy.

TODO: Cuneiform tablet. Press into clay with stylus. You can bake it for permanent
storage, or smooth it over and re-use it for scratch calculations.

<a href="https://www.nytimes.com/2010/11/23/science/23babylon.html" target="_blank">
    <img src="/post/deep-history_files/cuneiform_clay_tablet.png">
</a>

One more point about that multiplication problem. I chose ten digits because
the product is guaranteed to fit into a single unsigned 64-bit integer. If it
takes you about a minute to do the calculation on paper, then a cheap commodity
graphics card is about a quadrillion ($10^{15}$) times faster than you. I won't
insult you by talking about "million billions" or asking you to imagine
football stadiums full of people, each carrying a bag of rice, or any of the
usual ways of trying to convey really big numbers to a general audience. But I
think you'll agree, a quadrillion is kind of a big factor. We could have the
whole human race John Henry a single gaming PC at multiplication and we'd still
lose. Quantity, as a truly awful human being once said, has a quality all it's
own. We'll come back to that at the end; for now, let's return to the distant
past.


Rhind Papyrus 1550 BC
Moscow Papyrus 1850 BC
Plimpton Tablets 1800 BC



Clay Tablet and Stylus
Straight-edge and Compass
Abacus

Ptolemy's Almagest
------------------

[Claudius Ptolemy][PT] was an astronomer active in 2nd-century CE Alexandria.
His [*Almagest*][PTA] is the second most successful textbook of all time,
surpassed only by the [Euclid's *Elements.*][EE] It includes everything that
was known at the time about the theory and practice of astronomy and continued
to be widely used until overthrown by Copernicus in the 16th century.

There's a tremendous amount that could be said about such an influential work,
both good and bad, but we'll focus on only the small (but important) section
that has direct relevance to our topic. If you want a more well-rounded
overview, the blog [Following Kepler][FK] has done a multi-year [deep
dive][FKA] into the *Almagest*.

[FK]: https://jonvoisey.net/blog/
[FKA]: https://jonvoisey.net/blog/2018/05/almagest-index/#more-368
[EE]: https://en.wikipedia.org/wiki/Euclid%27s_Elements
[PT]: https://en.wikipedia.org/wiki/Ptolemy
[PTA]: https://en.wikipedia.org/wiki/Almagest
[PTTC]: https://en.wikipedia.org/wiki/Ptolemy%27s_table_of_chords
[HP]: https://en.wikipedia.org/wiki/Hipparchus
[GCL]: https://journals.sagepub.com/doi/10.1177/00218286221140848
[PTT]: https://en.wikipedia.org/wiki/Ptolemy%27s_theorem
[CQ]: https://en.wikipedia.org/wiki/Cyclic_quadrilateral
[IAT]: https://en.wikipedia.org/wiki/Inscribed_angle
[LOS]: https://en.wikipedia.org/wiki/Law_of_sines

The section I do want to talk about is the so-called [table of chords][PTTC].
[Hipparchus][HP] had earlier developed a similar table of chords; these are
now lost but are thought to be incorporated into Ptolemy's improved table.
A "chord" is a line segment which connects two points on a circle. The table
of chords related the opposite angle (in degrees) to the length of chord;
essentially the same relationship as $sin(\theta)$ in modern trigonomety.

Here is a small sample of Ptolemy's table, from a [later Latin edition][GCL]:

![Almagest Chord Table](/post/deep-history_files/amlagest.png)

The table has a row for every angle ("Arcũ") to the half a degree and
the corresponding chord length ("Chordarum") is given in both minutes
and seconds for a precision of about 1/3600, or about four decimal places. It
would have been an impressive accomplishment in the 12th century, much less the
2nd.

How did Ptolemy create this table? He used the theorem that bears his name to this
day. [Ptolemy's theorem][PTT] related the edge lengths and diagonals of a [cyclic quadrilateral][CQ]:

![Ptolemy Theorem](/post/deep-history_files/ptolemy_theorem.png)

Via the formula:

\\[
    \overline{AD} \times \overline{BC} + 
    \overline{AB} \times \overline{CD} = 
    \overline{AC} \times \overline{BD} 
    \tag{1}
\\]

While elegant, it's probably not at all obvious how this theorem could have any
practical use. However, it turns out its a powerful Swiss army knife for
working with angles and chord lengths. To see how, lets translate it into
trigonometry so that it's more recognizable to modern readers.

We do this by setting up the quadrilateral in a special way. We'll choose $B$
and $D$ to be exactly opposite on the circle, and further chose the diameter
$\overline{BD}$ to be exactly one. Then we consider two angles, $\alpha$ and
$\beta$, on opposite sides of this line:

![Angle Addition Theorem](/post/deep-history_files/angle_addition.png)

By the [inscribed angle theorem][IAT], $\angle DAB$ and $\angle DCB$ are both
right triangles. That gives us two right triangles with hypotenuse $1$, so we
can easily label the edge lengths as $\overline{BC} = \sin(\alpha)$, 
$\overline{AD} = \cos(\beta)$ and so on.

Since we chose $\overline{DB} = 1$, the right-hand side of $(1)$ is just $\overline{AC}$.
By the [law of sines][LOS], $\overline{AC} = \sin(\alpha+\beta)$.


Thus we can see that Ptolemy's theorem is gives us the angle addition formula:

\\[
    \sin(\alpha+\beta) = \sin(\alpha) \cos(\beta) +  \cos(\alpha) \sin(\beta) 
    \tag{2}
\\]

It's this theorem that allows him to build out his table. He first calculates
$\sin(1^{\circ})$ and $\sin(½^{\circ})$ and repeatedly adds them to
the nearest known value (such as $\sin(30^{\circ}) = ½$) to flesh out his table.

TODO: This is the first cache. Trading space for time complexity. Modern set
theoretic notion of a function as an associative map between two sets. Without
Ptolemy's table. Nuanced concept of "precision." Why four decimal places? So
that after the handful of calculations involved in calculating the position of
a planet, you're still left with three sig-figs - a degree of precision which
is still widely regarded as good enough for most practical purposes even to
this day.


The Sector
----------


Galileo Galilei sector
Le operazioni del compasso geometrico et militare (1606).

A sector seems kind of silly - its just a hinge - but what it does is
translate angles (for which there are few useful tools for working with) 
to distances (for which there are many.) With distances, you can use a compass
to move and copy and compare them with considerable precision, and you can
use a scale to map distances through arbitary ranges.



https://en.wikipedia.org/wiki/File:Galileo%27s_geometrical_and_military_compass_in_Putnam_Gallery,_2009-11-24.jpg

https://en.wikipedia.org/wiki/Sector_(instrument)


Chris Staecker 
https://www.youtube.com/watch?v=qmmRuh_xEiM&list=WL&index=27


Edmund Gunter
-------------

Gunter's Line - 1620 - log scale
Gunter's Chain
Gunter's Quadrant - simplified astrolabe
Gunter's Scale
Gunter, story about "that's not what I call reading geometry!"


Logarithm
---------

Michael Stifel's Exponents and Arithemtic/Geometric series connection.
Napier Bones
John Napier's Logarithm (Geometric construct generalizing Stifel's insight.)
Henry Brigg's Base 10 Logarithms 

Napier article and image:
https://maa.org/press/periodicals/convergence/logarithms-the-early-history-of-a-familiar-function-john-napier-introduces-logarithms


Slide Rule
----------

Jost Burgi - circular slide rule design?
William Oughtred's Slide Rule


Mechanical Calculators
-----------------------

Pascal's Calculator
Leibniz's Four Operation Calculator

Characteristica universalis, Leibniz (c. 1679) - https://en.wikipedia.org/wiki/Characteristica_universalis

Babbage, etc.


Later
-----

https://en.wikipedia.org/wiki/Herman_Hollerith
https://www.columbia.edu/cu/computinghistory/hh/


https://en.wikipedia.org/wiki/IBM_602

https://en.wikipedia.org/wiki/Harvard_Mark_I

Z3: https://en.wikipedia.org/wiki/Z3_(computer)
ENIAC: https://en.wikipedia.org/wiki/ENIAC
Plugboard


Thinking with Matter
--------------------


The extended mind hypothesis: https://www.alice.id.tue.nl/references/clark-chalmers-1998.pdf

Man-Computer Symbiosis, J. C. R. Licklider, (1960) - https://groups.csail.mit.edu/medg/people/psz/Licklider.html

As We May Think, Vannevar Bush (1945) - https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/

Augmenting Human Intellect: A Conceptual Framework, by Douglas Engelbart (1962) - https://www.dougengelbart.org/pubs/augment-3906.html


I can't multiply two 10 digit (32 bit) numbers together. Not in my head,
anyway. But give me a piece a paper and its as easy as pie, if a little
tedious. 

A pencil and paper may not seem like very advanced technology, but it increases
your working memory space by about a factor of a thousand. (A typical human has
about 7 +/- 2 digits of working memory, while a single 8.5x11 inch sheet of
paper can easily hold 7,000 digits.)

Slide rules, logarithms, and trig tables provide a 10x to 100x speed-up,
depending on the number of digits of precision required. 



[CB]: https://en.wikipedia.org/wiki/Charles_Babbage
[AE]: https://en.wikipedia.org/wiki/Analytical_engine
[UTM]: https://en.wikipedia.org/wiki/Universal_Turing_machine


Wolfram on Gottfied Liebniz. Discrete and ANKOS bullshit aside, interesting.
[SWGL]: https://writings.stephenwolfram.com/2013/05/dropping-in-on-gottfried-leibniz/

[RMP]: https://en.wikipedia.org/wiki/Rhind_Mathematical_Papyrus
