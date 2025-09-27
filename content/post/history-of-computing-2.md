---
title: "The Prehistory of Computing, Part II"
author: "Oran Looney"
date: 2025-09-27
publishdate: 2025-09-27
tags:
  - Computer Science
  - History
  - Math
image: /post/history-of-computing-2_files/lead.jpg
---

In [part I][HC1] of this two-part series we covered lookup tables and simple
devices with at most a handful of moving parts. This time we'll pick up in the
17th centuries, when computing devices started to became far more complex and
the groundwork for later theoretical work began to be laid.


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
[HC1]: /post/history-of-computing/


