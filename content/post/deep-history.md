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

TODO

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

The point is that just one sheet of paper is enough to make an impossible task
possible, even easy. A typical human has about 7 +/- 2 digits of working
memory, while a single 8.5x11 inch sheet of paper can easily hold 7,000 digits.
It may not seem like very advanced technology, but it increases your working
memory space by about a factor of a thousand, and computer science [teaches
us][STT] that memory is just as fundamental to computation as speed.

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


The relevant section is the so-called [table of chords][PTTC]. [Hipparchus][HP]
had earlier developed a similar table of chords; these are now lost but are
thought to be incorporated into Ptolemy's improved table. A "chord" is a line
segment which connects two points on a circle. The table of chords related the
opposite angle (in degrees) to the length of chord; essentially the same
relationship as $sin(\theta)$ in modern trigonomety.

Here is a small sample of Ptolemy's table, from a [later Latin edition][GCL]:

![Almagest Chord Table](/post/deep-history_files/amlagest.png)

The table has a row for every angle ("Arcus") to the half a degree and
the corresponding chord length ("Chordarum") is given in both minutes
and seconds for a precision of about 1/3600, or about four decimal places. It
would have been an impressive accomplishment in the 12th century, much less the
2nd.

How did Ptolemy create this table? He used the theorem that bears his name to
this day. [Ptolemy's theorem][PTT] related the edge lengths and diagonals of a
[cyclic quadrilateral][CQ]:

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

This is a [sector][SI]:


<a href="https://www.si.edu/object/italian-style-sector-jacobus-lusuerg:nmah_1127307" target="_blank">
    <img src="/post/deep-history_files/sector.png">
</a>

It seems kind of silly&mdash;it's just a hinge&mdash;but its much more useful
than it first appears.

what it does is
translate angles (for which there are few useful tools for working with) 
to distances (for which there are many.) With distances, you can use a compass
to move and copy and compare them with considerable precision, and you can
use a scale to map distances through arbitary ranges.

Galileo Galilei sector
Le operazioni del compasso geometrico et militare (1606).


The Smithsonian has an extensive [collection of historical sectors][SCS], from
which the above image is borrowed.




https://en.wikipedia.org/wiki/File:Galileo%27s_geometrical_and_military_compass_in_Putnam_Gallery,_2009-11-24.jpg



Chris Staecker has a good video demonstrating its use:

<div style="width: 560px; padding: 0; margin: 0 auto;">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/qmmRuh_xEiM?si=iBnrDEfJ8_hJTfQX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

TODO: are these the right scale names

The L scale can be used for proportions and multiplication.

The C scale is called the line of chords, and is just a physical 
representation of the Ptolemy's table of chords. Open the sector
to a particular angle and measure the distance across the sector the open
ends of the sector at the designated points; that's the chord length. Use
a [compass][RC] to pick up that length and move it to the C scale on the sector;
the value you read off is the angle in degrees. This process can be reversed
as well, allowing you to open the sector to a particular angle that you only
know as a number of degrees.

Galileo also included scales for calculating various trignometric functions.

Devices that use a physical distance scale, like the sector and the slide
rule we'll discuss below, are quick and easy to use but are limited in precision.
While the compass is actually very good at moving precise distances from one
place to another, reading the values off the scale will normally only get
you about 2 sig-figs, perhaps 3 sig-figs if you take great care with the 
physical movement and squint to do linear interpolation between neighboring marks.

TODO

That's sufficient for some applications such as navigation, but more precise
work would still require tables.

This natural tension between the two approaches has an interesting consequence:
there's little point in publishing a table to merely three decimal places,
because anyone who was satisified with a quick-and-dirty result could use a
mechanical device instead. But a table to higher precision requires a
significant amount of work. We'll come back to this idea after we've discussed
Napier.




Edmund Gunter
-------------

[Gunter's Line][EGL] - 1620 - log scale

Gunter's Canon Triangulorum - 1620 - table of log trig functions

![Gunter's Canon Triangulorum](/post/deep-history_files/gunter_table.png)

[Gunter's Chain][EGC] used to measure distances while surveying.

Gunter's Quadrant - simplified astrolabe
Gunter's Scale

Gunter's Cannon


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

Babbage, etc.


Leibniz
-------

Liebniz is something of an unacknowledged grandfather of computer science.

 Leibniz built the first 4-operation calculator:

https://en.wikipedia.org/wiki/Stepped_reckoner

https://en.wikipedia.org/wiki/Leibniz_wheel

http://history-computer.com/MechanicalCalculators/Pioneers/Lebniz.html

Characteristica universalis, Leibniz (c. 1679) - https://en.wikipedia.org/wiki/Characteristica_universalis


https://pron.github.io/posts/computation-logic-algebra-pt1#leibnizs-instrument

He also wrote extensively on the concept of artificial languages and what we today recognize as Boolean algebra:

https://en.wikipedia.org/wiki/Characteristica_universalis

https://www.iep.utm.edu/leib-log/

His work on these subjects was explicitly cited by Frege as the inspiration for his own seminal work on formal logic.

And he did demonstrate it in England and Paris - but framing it as "faltering through live demonstrations" ignores the fact that this was in the 17th century and the only similar thing they would have seen was Pascal's calculator which was limited to addition and subtraction. A device which could also multiply and divide was seen as a huge advance. While it does seem likely that early versions did not work very well (seeing as Leibniz would go on to commission a brass version from a master clockmaker after lamenting, "If only a craftsman could execute the instrument as I had thought the model!") these early demonstrations were still successful enough to illustrate the principle and in fact brought Leibniz considerable fame: to quote Wikipedia, "This 'stepped reckoner' attracted fair attention and was the basis of his election to the Royal Society in 1673."

https://en.wikipedia.org/wiki/Gottfried_Wilhelm_Leibniz#Computation

http://history-computer.com/MechanicalCalculators/Pioneers/Lebniz.html

While the story of an early version of the machine being lost and recovered is true, this is pretty much just a piece of trivia. The important ideas were never forgotten because Leibniz wrote several books about his machine. His design was well known and many successors worked on their own versions of it. In fact, for the next two centuries, the Leibniz wheel and the pinwheel calculator (another Leibniz design) would dominate the field and most machines produced in this time derived from one of Leibniz’s designs.

https://en.wikipedia.org/wiki/Mechanical_calculator#The_18th_century

Two centuries later, the Leibniz wheel would form the basis of the first commercially successful mechanical calculator:

https://en.wikipedia.org/wiki/Arithmometer

Chebyshev, Linkages, and Approximation Theory
---------------------------------------------

![Chebyshev's Magnificent Beard](/post/deep-history_files/chebyshev.png)


https://bhavana.org.in/math-and-motion-a-look-at-chebyshevs-works-on-linkages/

<img style="height: 50%; width: 50%;" alt="Chebyshev Linkage" src="/post/deep-history_files/chebyshev_linkage.gif">

https://math.ou.edu/~jalbert/chebyshev.pdf

https://en.wikipedia.org/wiki/Equioscillation_theorem

https://en.wikipedia.org/wiki/Remez_algorithm


![Equioscillation Example](/post/deep-history_files/remez.png)

Example of real-world trig function implementation:

https://github.com/lattera/glibc/blob/master/sysdeps/ieee754/dbl-64/e_asin.c

Later
-----

Herman Hollerith and the Punch Card.

https://en.wikipedia.org/wiki/Herman_Hollerith
ttps://www.columbia.edu/cu/computinghistory/hh/

Calculating Punch - 4 operation calculator operating on punch cards.

https://en.wikipedia.org/wiki/IBM_602


https://en.wikipedia.org/wiki/Harvard_Mark_I

Z3: https://en.wikipedia.org/wiki/Z3_(computer)
ENIAC: https://en.wikipedia.org/wiki/ENIAC



Thinking with Matter
--------------------


The extended mind hypothesis: https://www.alice.id.tue.nl/references/clark-chalmers-1998.pdf

Man-Computer Symbiosis, J. C. R. Licklider, (1960) - https://groups.csail.mit.edu/medg/people/psz/Licklider.html

As We May Think, Vannevar Bush (1945) - https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/

Augmenting Human Intellect: A Conceptual Framework, by Douglas Engelbart (1962) - https://www.dougengelbart.org/pubs/augment-3906.html


I can't multiply two 10 digit (32 bit) numbers together. Not in my head,
anyway. But give me a piece a paper and its as easy as pie, if a little
tedious. 

Slide rules, logarithms, and trig tables provide a 10x to 100x speed-up,
depending on the number of digits of precision required. 

Other
-----

[Wolfram on Gottfied Liebniz][SWGL]. His obsession with discrete simulations and plugging his own book aside, interesting.

[Mathematical Instruments][CPUMI] a 1758 describing many of the above devices in detail.


[AE]: https://en.wikipedia.org/wiki/Analytical_engine
[CB]: https://en.wikipedia.org/wiki/Charles_Babbage
[CPUMI]: https://www.c82.net/math-instruments/
[CQ]: https://en.wikipedia.org/wiki/Cyclic_quadrilateral
[EE]: https://en.wikipedia.org/wiki/Euclid%27s_Elements
[EGC]: https://en.wikipedia.org/wiki/Gunter%27s_chain
[EGL]: https://www.nzeldes.com/HOC/Gunter.htm
[FKA]: https://jonvoisey.net/blog/2018/05/almagest-index/#more-368
[FK]: https://jonvoisey.net/blog/
[GCL]: https://journals.sagepub.com/doi/10.1177/00218286221140848
[HP]: https://en.wikipedia.org/wiki/Hipparchus
[IAT]: https://en.wikipedia.org/wiki/Inscribed_angle
[LOS]: https://en.wikipedia.org/wiki/Law_of_sines
[PTA]: https://en.wikipedia.org/wiki/Almagest
[PTTC]: https://en.wikipedia.org/wiki/Ptolemy%27s_table_of_chords
[PTT]: https://en.wikipedia.org/wiki/Ptolemy%27s_theorem
[PT]: https://en.wikipedia.org/wiki/Ptolemy
[RC]: https://en.wikipedia.org/wiki/Reduction_compass
[RMP]: https://en.wikipedia.org/wiki/Rhind_Mathematical_Papyrus
[SCS]: https://www.si.edu/spotlight/sectors
[SI]: https://en.wikipedia.org/wiki/Sector_(instrument)
[SMA]: https://en.wikipedia.org/wiki/Multiplication_algorithm
[STT]: https://en.wikipedia.org/wiki/Space%E2%80%93time_tradeoff
[SWGL]: https://writings.stephenwolfram.com/2013/05/dropping-in-on-gottfried-leibniz/
[UTM]: https://en.wikipedia.org/wiki/Universal_Turing_machine
