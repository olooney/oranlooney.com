---
title: "Craps Variants"
author: "Oran Looney"
date: 2018-07-11
tags: ["Python", "Math", "Statistics"]
image: /post/craps-game-variants_files/lead.jpg
---

[Craps][C] is a suprisingly fair game. I remember calculating the probability
of winning craps for the first time in an undergraduate discrete math class: I
went back through my calculations several times, certain there was a mistake
somewhere.  How could it be closer than $\frac{1}{36}$?

(**Spoiler Warning** If you *haven't* calculated these odds for yourself then
you may want to do so before reading further. I'm about to spoil it for you
rather thoroughly in the name of exploring a more general case. A full solution
may also be found, for example, in the book [Fifty Challenging Problems in
Probability with Solutions][50PP].)

It's so close to fair, in fact, that I actually had to check to see if the
inventor had been a mathematician or statistician; and while he seemed like a
[very colorful character][BM] there's little in his biography to suggest he had
any deep knowledge of mathematics.

Concretely, the exact odds are $\frac{244}{495} \approx 49.29\%$: That's less
than 0.71% away from perfectly fair -- and of course no casino would ever host
a game that was *perfectly* fair.  (Note that this means that the house edge is
1.4%, similar to Blackjack but without requiring the memorization of large
tables of optimal moves. Any player who isn't able to play Blackjack perfectly
will probably do better at the craps table.)

To appreciate how remarkable that is, note that fairest ("fairest" meaning the
closest to 50% while still strictly less) outcome you can achieve with a single
roll of a [1d20][IH] is 45%, or even using two 10-sided die to roll 1d100 you
can only get to 49%. And it seems like it should be utterly hopeless with just
two six-sided die, because the probabilities of all outcomes are all multiples
of $\frac{1}{36} \approx 2.78\%$. There just doesn't seem like there's enough
*granularity* to get to $49.29\%$. But with the clever design of the "on point"
rule, it seems we can get there with just two ordinary six-sided die.

Its so close to 50% it's actually a bit of a pain to test empirically:
according to [G*Power3][GP3] you would need to play 54,000 games of craps to be
reasonably sure that you are safe to reject the null hypothesis that the true
odds were in fact 50/50.

We also note that the game appears to have been constructed by a very
deliberate choice of numbers: 2, 3, 7, 11, and 12. We can imagine de Marigny
sitting in front of a 19th century fireplace, drinking brandy and rolling dice,
taking notes, occasionally scratching out a 4 and replacing it with a 3, little
by little adjusting his rules to try and find the perfect game. 

So the question of the day is this: is there anything unique or special about
this particular assignment of numbers? In particular, does de Marigny's
particular assignment of numbers to outcomes result in the *fairest possible*
craps-like game? 

And above all -- is it possible to do better? To put it another way: could we
choose different numbers such that the probability of winning our variant is
greater than $\frac{244}{ 495}$ while still being strictly less than
$\frac{1}{2}$? 

To answer this question we'll need a little bit of math and little bit of
Python.

## Definitions

Let's start by laying out the original rules of craps. 

In the game of craps a "roll" is always the sum of two random six-sided die.
The individual dice results never matter: for example, 2,3 always leads to
the same as outcome as 1,4 because they both sum to 5.

A game of craps has two phases: A "come out" phase for the first dice roll, and
an "on point" phase for all subsequent rolls. In the "come out" phase, if the
player rolls a 7 or an 11, he or she immediately wins; this called a "natural."
If the player rolls a 2, a 3, or 12, he or she immediately loses; this is
called a "craps." For any other roll, the first dice roll becomes the "point".
The point number is fixed by that first "come out" roll and remains the same
until the end of the game. The player then repeatedly rolls until one of two
things happen: either they roll the "point" and win, or they roll a 7 and lose;
this is called "seven-out".

Let's do a complete example. A player starts a new game. On his first roll -
the "come out" roll - he rolls a 5. This is not 7 or 11 so he doesn't
immediately win, and it's not 2, 3, or 12 so he doesn't immediately lose.
Instead he is now "on point" and enters the second phase of the game. His next
roll is an 11. Because we are no longer in the come out phase, 11 has no
special meaning. The only two numbers that matter are his "point" (5) and to
the "seven-out" (7). Since 11 is neither of these, he rolls again. This
next roll is a 5, so he wins the game.

## Parameterization

Now that we have a good understanding of the rules, let's try to generalize
the game. A full generalization would not have any specific magic numbers
hard-coded in, but would instead treat all numbers used in the rules as parameters.

It's clear that parameters have different roles. In the "come out"
phase, 7 and 11 are the "naturals" while 2, 3, and 12 are the "craps".; In "on
point" phase 7 is the "out" that causes a loss in the "on point" phase. There
is no particular parameter for the "point" because this is decided by the "come
out" roll.

It's also clear there are some natural constraints. We cannot assign a number
to be both a natural and a craps. There should be at least one natural and at
least one craps -- part of the excitement of the game is that it is possible to
win or lose on every roll. With some careful thought it can also be seen that the
"out" must be the same as one of the naturals or the craps -- if this were not
the case it would be possible to enter the "come out" phase with your "point" the
same as the "out" which would be fatally ambiguous. And finally, if *every*
possible roll resulted in either a "natural" or a "craps" then it wouldn't be
possible to enter the "on point" phase -- and really wouldn't be very craps
like.

Therefore a game is "craps-like" and may be called a "craps-variant" if it is
defined by a partition of the integers from 2 to 12 into three non-empty sets:
$N$, $C$, and $P$, plus a single parameter $o \in N \cup C$. With this
parameterization, every craps-variant has the same rules. 

Let  $\mathcal{D}(s)$ be the uniform distribution over the set of integers from
1 to $s$. Let $(r_i)$ be an infinite sequence of i.i.d. random variables where
$r_i \sim \mathcal{D}(6) + \mathcal{D}(6)$.  Then we define the game of craps
and all its variants as the parameterized family of functions:

<p><span class="math display">\[
\text{craps}(r; C,N,o)= 
\begin{cases}
  \text{win} & \text{ if } r_1 \in N \\
  \text{lose} & \text{ if } r_1 \in C \\
  \text{onpoint}(r, 2; o) & \text{ otherwise }
\end{cases}
\]</span></p>

The function $\text{onpoint}()$ is defined recursively as:

<p><span class="math display">\[
\text{onpoint}(r,i; o) = \begin{cases}
  \text{win} & \text{ if } r_i = r_1 \\
  \text{lose} & \text{ if } r_i = o \\
  \text{onpoint}(r,i+1; o) & \text{ otherwise }
\end{cases}
\]</span></p>

These formalisms make it clear that partitioning the numbers 2-12 into three
non-empty sets is at the heart of the combinatorics of craps variants.  We'll
need a way to count and generate such partitions if we want to search the space
of all possible craps-variants. The functional definition of the craps game
will simply serve as a guide to the Python implementation, which will perhaps
be much easier to read.

## Computation

To compute probabilities exactly we will use the [fractions][F] package to
precisely represent rational numbers. 

```python
import fractions
from fractions import Fraction
```

We can also precompute p.m.f. of $\mathcal{D}(6) + \mathcal{D}(6)$ and 
represent the map of outcomes to probabilities as a Python dict:

```python
p_roll = { total: Fraction(6-abs(total-7), 36) for total in range(2,12+1)}
```

    {2: Fraction(1, 36),
     3: Fraction(1, 18),
     4: Fraction(1, 12),
     5: Fraction(1, 9),
     6: Fraction(5, 36),
     7: Fraction(1, 6),
     8: Fraction(5, 36),
     9: Fraction(1, 9),
     10: Fraction(1, 12),
     11: Fraction(1, 18),
     12: Fraction(1, 36)}

The support of a random variable is the set for which it has non-zero
probability; in other words, all possible outcomes. It is convenient to have
this as separate variable since we we will need to refer to it several times.

```python
roll_support = list(p_roll.keys())
```

Next we will define a class which represents a single craps variant. The
parameters will be instance members and the function `p_win()` will calculate
the exact probability $P(\text{craps}(;N,S,o) = \text{win})$. (In general the
prefix `p_` will denote "probability of".) Note this is not a Monte Carlo
simulation or an approximation: using `Fraction()` and summing over the finite
support gives us exact probabilities.

```python
class Craps:
    def __init__(self, craps=[2, 3, 12], naturals=[7, 11], out=7):
        self.craps = craps
        self.naturals = naturals
        self.out = out
    
    def p_win(self):
        return sum(
            p_roll[total] * self.p_come_out(total) 
            for total in roll_support)
        
    def p_come_out(self, total):
        if total in self.craps:
            return 0
        elif total in self.naturals:
            return 1
        else:
            return self.p_when_on_point(total)

    def p_when_on_point(self, point):
        p_out = p_roll[self.out]
        p_point = p_roll[point]
        return p_point / (p_out + p_point)

```

(I've omitted a few double underscore methods to keep things high level;
check the original [notebook][CNB] for the full code listing.)

What's important here are the methods `p_win()`, `p_come_out()`, and
`p_when_on_point()` which closely correspond our mathematically definitions and
in fact correspond to calculating the various conditional probabilities of each
phase. Note that even though the game itself can go on forever and the we
defined our game mathematically using infinite recursion, the expectation value
calculated in `p_come_out()` does not require infinite recursion, or any
recursion at all. We need only take the ratio of the probability of the point
and the probability of rolling the out.

## Original Game

With our class defined, we can test it by feeding it the original parameters
and verifying that it returns $\frac{244}{495}$.

```python
p = Craps(craps=[2, 3, 12], naturals=[7, 11], out=7).p_win()
p_original = p
p, float(p)
```

    (Fraction(244, 495), 0.49292929292929294)

Which is what we expect.

## Generating Variants

We next turn our attention to generating all possible variants. This is a two step
process: generate all 3-partitions of $[2,12]$ to obtain $C$, $N$, and $P$, and
then pick our "out" from the set $C \cup N$. Note that the members of a
partition are non-empty by definition so there will always be at least one
craps, one natural, and one number which will advance us into the "on point
phase."

We are going to be generating a *lot* of partitions so it behooves us to have a
reasonable performant implementation. Knuth's [algorithm u][AU] is very fast
and memory efficient but very far outside the scope of this article; so for now
just note that its a generator expression yielding lists of lists to represent
partitions and that it yields every valid partition exactly once before
stopping.

```python
# Knuth's algorithm to partition ns into m sets.
def algorithm_u(ns, m):
  # 83 lines of code omitted 
  # yields partitions as lists of lists of integers
```

We wrap the partition generator in one extra layer to pick the "out":

```python
def generate_craps_variants():
    for craps, naturals, _ in algorithm_u(roll_support, 3):
        for out in craps + naturals:
            yield Craps(craps, naturals, out)
```

## Investigation

The first question that comes to mind is "How many craps variations are there?"

```python
sum( 1 for _ in generate_craps_variants() )
```

    229858

Just shy of a quarter million. Note that while all of these games are unique
under our definition, they exhibit several kinds of symmetry. For
example, if two games are the same except one has an out of 5 and the other an
out of 9, they will always have the exact same probability winning the whole
game because 5 and 9 have the same probability.  And there are many cases where
we could exchange say a 3 in the naturals with an 11 in the craps set and once
again get a game with the exact same probability of winning. So in some sense
our quarter million is overcounting. However these symmetries are quite
complex so we will leave that for some future article.

In any case, a quarter million is no obstacle to explicit enumeration. If you
would like to see the full list, here it is in [compressed format][ACV]. And of
course you could always generate them for yourself in a few minutes from the
[notebook code][CNB].

To answer the original question posed, we need to rank these games according to
the rule "closest to 50% while still strictly less." In Python we use
the [decorate-sort-undecorate][DSU] idiom.

```python
def decorate_with_scores(craps_variants):
    one_half = Fraction(1, 2)
    for craps_variant in craps_variants:
        p = craps_variant.p_win() 
        score = (one_half - p) if p < one_half else 1 - p
        yield (score, p, craps_variant)
    
scored_variants = list(decorate_with_scores(generate_craps_variants()))
sorted_variants = sorted(scored_variants)
```

Let's just take a peek at the top 20:

```python
for score, p, craps_variant in sorted_variants[:20]:
    print("{} : {}  {:.4f}%".format(craps_variant, p, 100*float(p)))
```

    craps: 2,8,10,12  naturals: 3,7  out: 10 : 5039/10080  49.9901%
    craps: 2,6,10,12  naturals: 3,7  out: 10 : 5039/10080  49.9901%
    craps: 2,4,8,12  naturals: 3,7  out: 4 : 5039/10080  49.9901%
    craps: 2-3,7,12  naturals: 4,8  out: 4 : 5039/10080  49.9901%
    craps: 2-3,7,12  naturals: 4,6  out: 4 : 5039/10080  49.9901%
    craps: 2,4,6,12  naturals: 3,7  out: 4 : 5039/10080  49.9901%
    craps: 2-3,6  naturals: 4,12  out: 4 : 5039/10080  49.9901%
    craps: 2,4,7  naturals: 3,6,12  out: 4 : 5039/10080  49.9901%
    craps: 2,4,7  naturals: 3,8,12  out: 4 : 5039/10080  49.9901%
    craps: 2-3,8  naturals: 4,12  out: 4 : 5039/10080  49.9901%
    craps: 2,7,10  naturals: 3,6,12  out: 10 : 5039/10080  49.9901%
    craps: 2,7,10  naturals: 3,8,12  out: 10 : 5039/10080  49.9901%
    craps: 2-3,6,11  naturals: 4,8,10  out: 8 : 3563/7128  49.9860%
    craps: 2-3,6,11  naturals: 4,8,10  out: 6 : 3563/7128  49.9860%
    craps: 2-3,8,11  naturals: 4,6,10  out: 6 : 3563/7128  49.9860%
    craps: 2-3,8,11  naturals: 4,6,10  out: 8 : 3563/7128  49.9860%
    craps: 2,6-7  naturals: 3,5,8-9  out: 8 : 1511/3024  49.9669%
    craps: 2,6-7  naturals: 3,5,8-9  out: 6 : 1511/3024  49.9669%
    craps: 2,7-8  naturals: 3,5-6,9  out: 6 : 1511/3024  49.9669%
    craps: 2,7-8  naturals: 3,5-6,9  out: 8 : 1511/3024  49.9669%
    
OK, wow, I wasn't expecting that. We're seeing lots of variations that are
beating the original game by a wide margin. So the existence question is
settled - there absolutely do exist craps variants which are much closer to
fair than the original.

In fact we note that the top 12 games all achieved the same remarkable score of
49.99%.  This relates back to the symmetries I mentioned earlier: in general,
craps-variants will belong to an equivalence class of similar games reachable
through swaps and reflections about 7 and all games in an equivalence class
will have the same probability of winning. But more on that in a future
article.

The next obvious question is how many craps variants are more fair than the
original game?

```python
sum(p > p_original and p < Fraction(1,2) 
	for _, p, _ in scored_variants)/len(scored_variants)
```

    0.01621000791793194

So of all possible craps variants, only 1.6% are better than the original. So
in this sense the original game is exceptionally fair - if I picked a variant
at random, then 98.4% is would be as fair or less fair then the original. 

However the best possible variants are really quite extraordinarily fair:
$\frac{5039}{10080} \approx 49.99\%$  Less than 1 part in 10,000.  It's pretty
amazing, really, what we can do with a pair of dice and a few simple rules.

## Empirical Confirmation

> Beware of bugs in the above code; I have only proved it correct, not tried
> it.
>
> - Donald Knuth

The above code was careful to calculate exact probabilities. This was much
faster and more accurate than a Monte Carlo simulation; indeed it would
have been exorbitant to run a simulation for a quarter million variants
and multiple hypothesis testing would have made it very difficult to search
for extreme variants such as the "fairest" variant. However, it's always
nice to see empirical results that confirm our theoretical calculations
and in this case the simulation code itself is obvious and straight-forward:

```python
import random

class CrapsSimulation:
    def __init__(self, craps=[2, 3, 12], naturals=[7, 11], out=7):
        self.craps = craps
        self.naturals = naturals
        self.out = out
    
    def reset(self):
        self.point = None
        self.roll_log = []
    
    def roll(self):
        roll = random.randint(1, 6) + random.randint(1, 6)
        self.roll_log.append(roll)
        return roll
    
    def play(self):
        self.reset()
        
        come_out_roll = self.roll()
        if come_out_roll in self.craps:
            return 0
        elif come_out_roll in self.naturals:
            return 1
        else:
            self.point = come_out_roll
            return self.play_on_point()
    
    def play_on_point(self):
        while True:
            roll = self.roll()
            if roll == self.out:
                return 0
            if roll == self.point:
                return 1
```

Now we can simply play the game 100 million times to confirm our results. (To
get 4 significant figures, we need an error term on the order of $10^{-4}$ but
the error terms deceases with the *square root* of the number of trials so
we need about $10^8$ trials to get 4 sig figs.)

```python
n = int(1e8)

original_game = CrapsSimulation(craps=[2, 3, 12], naturals=[7, 11], out=7)
fairest_variant = CrapsSimulation(craps=[2, 8, 10, 12],  naturals=[3, 7],  out=10)

outcomes = []
for sim in [original_game, fairest_variant]:
    win_loss_record = [ sim.play() for _ in range(n) ]
    p_win = sum(win_loss_record) / len(win_loss_record)
    outcomes.append(p_win)
```

    [0.49290737, 0.49991584]
    
Yep - that's the 49.29% and 49.99% we expect for the original and fairest
variant respectively.

## Conclusion

Craps is quite a fair game compared to other common casino games and even
compared to 98% of possible craps variants. Nevertheless, my conjecture that craps
had been explicitly designed as a maximally fair game was thoroughly disproved
when we were able to construct thousands of variants that were all fairer than the
original. Some of these were *much* fairer than the original, deviating from
perfectly fair by less than one game in 10,000. While this does take some of the
shine off the original game, I am even more impressed with the power of the
craps *rule set* to generate hyper-granular probabilities with only two die.

One aspect of craps variants that we didn't explore in detail but which seems
promising is the [symmetry group][SG] of craps variants. Variants can be
divided into equivalence classes based which variants can reach each other
using only outcome preserving operations.  We observe that equivalence classes
vary in size quite a bit; for example the original game is part of an
equivalence class class with two members while the fairest variant is part of
an equivalence class with 12 members, and many other sizes are possible. It
seems a moderate and amusing challenge to characterize this group and count the
number of equivalence classes of games, but I will have to leave that to a
future article.

[SG]: https://en.wikipedia.org/wiki/Symmetry_group
[DSU]: https://en.wikipedia.org/wiki/Schwartzian_transform
[GP3]: http://www.gpower.hhu.de/
[IH]: https://en.wikipedia.org/wiki/Icosahedron
[C]: https://en.wikipedia.org/wiki/Craps
[BM]: https://en.wikipedia.org/wiki/Bernard_de_Marigny
[CNB]: /post/craps-game-variants_files/CrapsVariants.ipynb
[ACV]: /post/craps-game-variants_files/all_craps_variants.zip
[50PP]: https://www.amazon.com/Challenging-Problems-Probability-Solutions-Mathematics/dp/0486653552
[AU]: https://gist.github.com/olooney/8607faf1ee609b7c4da26f41f766a977
[F]: https://docs.python.org/2/library/fractions.html
