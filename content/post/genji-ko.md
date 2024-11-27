---
title: "The Art and Mathematics of Genji-Kō"
author: "Oran Looney"
date: 2024-11-26
publishdate: 2024-11-26
tags:
    - Python
    - Visualization
    - History
image: /post/genji-ko_files/lead.jpg
---

You might think it's unlikely for any interesting mathematics to arise from
incense appreciation, but that's only because you're unfamiliar with the
peculiar character of [Muromachi (室町) era][MP] Japanese nobles.

There has never been a group of people, in any time or place, who were so driven
to display their sophistication and refinement. It wouldn't do to merely put
out a few sticks of incense; no, you would have to prove that your taste was
more exquisite, your judgment more refined, your etiquette more oblique. You
could of course merely invite some other nobles over for an incense
appreciation party, make a few cutting but plausibly deniable remarks about a
rival, maybe drop a few lines of poetry linking the incense to the current
season. But if you were really on the ball you'd be looking for a way to
simultaneously humiliate your rivals, flirt with your love interest, and
impress people in a position of power. They didn't just perfect cultured
refinement: they weaponized it.

Only under such conditions could something like Genji-kō (源氏香) arise. It is
a parlor game played with incense&mdash;just one of many similar games inside the
broader umbrella of kōdō (香道), the traditional Japanese art of incense
appreciation. 

What sets Genji-kō apart is its extreme difficulty - where another kōdō game
might have contestants write down their guesses for three separate incenses and
score a point for each correct guess, Genji-kō asks contestants to smell five
separate samples, then determine which of the five were the same scent. All
five might be the same, all five might be different, or (and this is where it
gets interesting) they might be in groups of two or three or four.

Contestants score a single point by correctly guessing all five incenses;
otherwise they score nothing. A typical game has five rounds over the course of
an evening, with an overall winner declared at the end. 

Obviously contestants would need some kind of notation to submit their answers
in a concise and unambiguous way, and it is really about this notation (and
the art, mathematics, and culture connected to it) that this article is about.

Notation
--------

The solutions that Genji-kō players submit are called Genji-mon (源氏紋) and
are drawn with exactly five vertical lines, representing the five possible
incenses. To show that two or more incenses are part of the same group, you
draw a horizontal line connecting the top of every vertical line in that group.
To avoid confusion when there are two or more groups, you draw these horizontal
lines at different heights, shortening the vertical lines as needed:

<img src="/post/genji-ko_files/examples.png">

There are a few nuances worth mentioning. If two groups don't overlap, there is
no need to draw them at different heights (top center.) Sometimes it is
impossible to avoid an intersection (bottom center) but it is clear that groups
are distinct because the horizontal connecting lines are at different heights;
nevertheless, we try to minimize such intersections.

Genji-Kō features as a plot point in [episode 8 of the experimental horror
anime Mononoke][MNNK8], where it is suggested that players used blocks to
record their solutions:

<img src="/post/genji-ko_files/blocks.png">

While this might be true - the episode's description of Genji-Kō is otherwise
grounded and well-researched - I haven't seen any other references to this;
everything else I've seen indicates the game was played with ink and paper. I
think it's probably just a case of artistic license.


Etymology
---------

Genji-kō, by the way, is named after the titular Genji of the Heian (平安) era
literary classic [*The Tale of Genji*][TG]. (The fact that "Genji" is a proper
name is also why I capitalize Genji-kō and Genji-mon.)

There are two connections. First, in one chapter of the book Genji hosts an
incense appreciation party. Second, since there are 52 possible patterns and 54
chapters of the book, each Genji-mon is traditionally associated with&mdash;and
named after&mdash;a chapter, except for the first and last chapters, which are
omitted. 

Every educated person of the Muromachi era would have been be intimately
familiar with [*The Tale of Genji*][TG] and would know the themes, season, and
characters associated with each chapter by heart, giving each pattern a
literary resonance. A skillful kōdō practitioner hosting a game of Genji-kō
would choose a solution that referenced the current season or recent event,
adding both a additional layer of meaning to the game and a hint to skilled
players.

There are <a href="#names#">several different words</a> we could use to refer
to the patterns themselves, but I've chosen Genji-mon as it seems to be the
most common.


Cultural Influence
------------------

Compared to other traditional arts from the same era such as tea ceremony or
flower arranging, kōdō is not particularly popular or well-known, even in
Japan; nevertheless it is [still played][KV] even to this day.

However, its cultural influence extends beyond the few who actually play the
game - the patterns show up fairly often as motifs in contemporary Japanese
graphic design, and it's especially popular on traditional goods such as
kimono:

<div style="text-align: center">
<img style="display:inline; height: 600px; padding: 0px;" src="/post/genji-ko_files/genjiko_colorful.jpg">
<img style="display:inline; padding: 0px;" src="/post/genji-ko_files/kimono.jpg">
</div>

While 
<a href="/post/genji-ko_files/cheap_genjiko_kimono.jpg" target="_blank">cheaper fabrics</a> 
simply print the same Genji-mon repeatedly, high-quality Genji-Kō textiles will
use a variety of Genji-mon so that the pattern seems to never quite repeat:

<img src="/post/genji-ko_files/fabric.jpg">

Naturally, Genji-mon are often found on goods related to incense in some way,
such as this kōdō set, incense box, or incense holder:

<div style="text-align: center">
<img "display:inline; padding: 0px;" src="/post/genji-ko_files/incense_set.jpg">
<img style="display:inline; padding: 0px; height: 400px;" src="/post/genji-ko_files/incense_box.jpg">
<img style="display:inline; padding: 0px; height: 400px;" src="/post/genji-ko_files/incense_holder.jpg">
</div>

In the 1840s [Kunisada][UK] painted a series of wall scrolls, one for each
chapter of [*The Tale of Genji*][TG], and included the associated Genji-mon on
each:

<a href="/post/genji-ko_files/minori_wall_scroll.png" target="_blank">
<img style="height: 50%; width: 50%;" src="/post/genji-ko_files/minori_wall_scroll.png">
</a>


Drawing Genji-Mon
-----------------

To draw Genji-Mon programmatically, we'll use the standard recursive algorithm
to generate all possible partitions for a set of five elements:

<!--
Knuth mentions them in the introduction to a [book on the history of combinatorics][CAM]:
<img class="drop-shadow" style="height: 50%; width: 50%;" src="/post/genji-ko_files/combanatorics_ancient_and_modern_page.png">
-->


```python
def partitions(s: Set[int]) -> Iterator[List[Set[int]]]:
    """Yield all partitions of a set as they are generated."""
    if not s:
        yield []
        return
    first = next(iter(s))
    rest = s - {first}
    for partition in partitions(rest):
        yield [{first}] + partition
        for i in range(len(partition)):
            new_partition = (
                partition[:i] + 
                [partition[i] | {first}] + partition[i+1:]
            )
            yield new_partition
```

<p id="maintext1">
However, the partition alone does not suffice to fully characterize a Genji-mon.
While we must draw overlapping groups at different heights to avoid ambiguity,
there is still a free choice about which groups we make taller. After studying
the chart of traditional Genji-mon, two rules became clear:
</p>

1. Groups should be as tall as possible.
2. Groups entirely inside<a href="#footnote1"><sup>&dagger;</sup></a> other
   groups should be lower and appear to nest inside the outer group.

I implemented this as a simple brute-force cost-based optimizer, because that
made it easy to experiment with different rules. (Even though in the end I
only used those two simple rules, I experimented with many others trying to
get rid of the remaining special cases, which I'll discuss below.)

```python
def optimal_genjiko_for_partition(
    partition: List[Set[int]]
) -> List[Tuple[float, Set[int]]]:
    """
    Given a partition, find the optimal Genji-kō layout by minimizing a cost
    function.
    """
    best_cost = math.inf
    best_genjiko = None
    HEIGHTS = [1.0, 0.8, 0.6]
    
    # Generate all possible combinations of heights
    for height_combo in itertools.product(HEIGHTS, repeat=len(partition)):
        genjiko_candidate = [
            (height, group) 
            for height, group 
            in zip(height_combo, partition)
        ]
        
        # Skip invalid configurations
        if not validate_genjiko(genjiko_candidate):
            continue
        
        # Encourage larger heights
        cost = -sum(height for height, _ in genjiko_candidate)  
        
        for height1, group1 in genjiko_candidate:
            for height2, group2 in genjiko_candidate:
                # Large penalty for higher inner group height
                if is_nested_within(group1, group2) and height1 > height2:
                    cost += 1
        
        # keep track of the best solution so far
        if cost < best_cost:
            best_cost = cost
            best_genjiko = genjiko_candidate

    return best_genjiko
```

[Drawing these using Pillow][SCD] or [organizing them into a grid][SCG] is
straight-forward, so you can check the source code if you're interested in
those details.

Here's what we get if always use the algorithmically calculated "optimal"
layout and simply put them in the order returned by `partitions()`:

<img src="/post/genji-ko_files/algorithmic_genjiko.png">

Good, but not perfect. The order is only vaguely similar, and the four Genji-mon
rendered in red are the ones where our "optimal" layout has failed to reproduce
the traditional design.

<h3 id="maintext2">Genji-mon Order</h3>

In the introduction he wrote for a [book on ancient combinatorics][CAM], Knuth 
<a href="/post/genji-ko_files/combanatorics_ancient_and_modern_page.png" target="_blank">mentions</a>
that the Genji-mon "were not arranged in any particularly logical order" and
I'm inclined to agree. I tried several variations of the above `partition()`
function hoping to find one where the traditional order would just fall out
naturally, but it never did. A close inspection of the traditional order makes
it clear that this was never going to happen: While there is an overall trend
from many to fewer groups, there are just too many cases where the order is
clearly arbitrary.

I found a several references that put them in a different order, and even some
that tried to stretch it to 54 using some kind of 
<a target="_blank" href="/post/genji-ko_files/dupes.gif">duplication</a>
or introducing 
<a target="_blank" href="/post/genji-ko_files/irregular.jpg">irregular</a> 
patterns.<sup><a href="#footnote2">*</a></sup>
However, if we recall what the notation is designed to represent this is
clearly nonsense: simultaneously useless for playing Genji-kō, mathematically
impossible, and at odds with tradition.

However, the association between the 52 patterns and chapter titles for
chapters 2-53 of the *Tale of Genji* seems watertight and consistent for
centuries back. Also, the order of the chapters is mostly consistent across
sources (there is some disagreement about the order of the later chapters, and
one chapter which survives only as a title or perhaps was intentionally elided
as a delicate way to allude to a character's death) so I've put my Genji-mon in
chapter order following Waley. You can find the full table in 
<a href="#table">Appendix C</a>.


Special Cases
-------------

I spent some time trying to find some elegant heuristic that would nudge
the layout algorithm to produce those four without breaking any of the others,
but the rules were more complex than simply listing the special cases (and
none of them correctly handled Yūgiri (夕霧), which I'll discuss below.)

The four special cases are:

```python
    # Suma: {1, 3, 4} should be lower than {2, 5}
    df.at[10, "Layout"] = [ (0.8, {1, 3, 4}), (1.0, {2, 5}) ]
    
    # Hatsune: {1, 3} should be lower than {2, 4}
    df.at[21, "Layout"] = [ (0.8, {1, 3}), (1.0, {2, 4}), (1.0, {5}) ]
    
    # Yugiri: {1, 4} should be lower than {3, 5}, and {2} even lower.
    df.at[37, "Layout"] = [ (0.8, {1, 4}), (0.6, {2}), (1.0, {3, 5}) ]
    
    # Nioumiya: {1, 2, 4} should be lower than {3, 5}
    df.at[40, "Layout"] = [ (0.8, {1, 2, 4}), (1.0, {3, 5}) ]
```

With these corrections, and using the *Tale of Genji* chapter order:

<img src="/post/genji-ko_files/genjiko.png">

Of the four exceptions, two are obvious improvements (fixing the "hole" in Suma
and the "dent" in Hatsune), and one (Nioumiya) is a matter of indifference.
However, the fourth, Yūgiri, seems to actively violate the basic rules around
nesting and creates a three-level structure when two would have sufficed:

<img src="/post/genji-ko_files/yugiri_diff.png">

The cost-based optimizer would never have chosen that layout because its most
basic tenet is to make the groups as tall as possible. A heuristic, let me 
remind you, that holds for the other 51 Genji-mon. However, all the examples
of Yūgiri I found online use the traditional design, such as this 
<a href="/post/genji-ko_files/yugiri_wall_scroll.png" target="_blank">wall scroll</a>
by [Kunisada][UK] or this woodblock print by [Masao Maeda][MM]:

<a href="/post/genji-ko_files/yugiri_woodblock_print.png" target="_blank">
<img style="height: 75%; width: 75%;" src="/post/genji-ko_files/yugiri_woodblock_print.png">
</a>

So I don't think I have a leg to stand on unless I want to fly in the face of
hundreds of years of tradition; we'll just have to hard-code Yūgiri as a
special case.


Counting Genji-Mon
------------------

The connection between Genji-kō and mathematics becomes apparent if we ask
ourselves, "Why are there exactly 52 Genji-mon patterns? How can we be sure
there aren't more?" 

Like a lot of questions in mathematics, it helps to generalize things. Instead
of focusing on five incenses, let's ask ourselves, how many unique ways are
there of grouping $n$ elements? This approach lets us ease into the problem,
starting with a simpler case and building complexity gradually.

For $n = 1$, there's clearly only solution:

<img src="/post/genji-ko_files/counting_partitions1.png">

For $n = 2$, there are only two possible solutions. Either the first element is
in a group by itself, or it is in a group with another.

<img src="/post/genji-ko_files/counting_partitions2.png">

For $n = 3$, things start to get more interesting. Let's repeat the trick we
used for $n = 2$ and focus on the first element. It must either be in a group
by itself, in a pair with another, or in the same group as all others. That
gives us exactly three cases to consider:

1. If the first element in a group by itself, then there are two elements left
   over; We showed above that there are two ways to partition them.
2. If it's in a pair, then we have a choice: we can either pair it with the
   second or third element. In either case there will only be one element left
   over. 
3. And there is only one way to have all the elements be in the same
   group.

Here they all are, in Genji-kō notation:

<img src="/post/genji-ko_files/counting_partitions3.png">

Thus, we have $1 \\times 2 + 2 \\times 1 + 1 = 5$ ways to partition a set of
three elements.

This is starting to look like a repeatable strategy. We always start by
focusing on the first element. We then neatly divide the set of all possible
solutions by the size $k$ of the group containing this first element. For each
$k$ between $1$ and $n$, there are two questions to ask:

1. How many ways are there of choosing the set that contains the first element?
2. How many ways are there of putting the remaining $n-k$ elements into groups?

Let's try that out for $n = 4$. The other cases are obvious, but let's focus on
the case where $k = 2$ as there's a new wrinkle there. We have to choose one
other element from three possible elements, so there are three ways of doing
that. We'll always have two left over, and there are always two ways of
grouping those together. This these are two independent choices - choosing the
first group, then choosing how to partition the remaining elements, there are
$3 \\times 2 = 6$ ways of doing that. This case teaches us that we have to
count both the ways of selecting a set of $k$ elements and the number of ways
to partition the remaining elements, and multiply them together.

<img src="/post/genji-ko_files/counting_partitions4.png">

So, for $n = 4$, there are $1 \\times 5 + 3 \\times 2 + 3 \\times 1 + 1 = 15$
possible solutions.


Mathematical Approach
---------------------

For the case of $n = 5$, I've 
<a href="/post/genji-ko_files/counting_partitions5.png" target="_blank">generated the diagram</a>
showing how to use the same strategy to count all possible Genji-mon,
but I think it's more useful to take the strategy we've learned and abstract it.

First, let's use the right terminology. What we've so far called a "Genji-mon,"
mathematicians would call a [partition][P]. In mathematical terms, the question
we're asking is, "How many distinct partitions are there for a set of $n$
elements?" This number also has a name: the [Bell number][BN] denoted $B\_n$. 

Above, we calculated $B\_1$ through $B\_4$ using a mix of intuition and common
sense. To formalize the strategy we used in mathematical notation we'll need a
concept you may or may not have seen before: "the number of ways to choose $k$
elements from $n$ distinct elements, ignoring order" is called "$n$ choose $k$"
or the [binomial coefficient][BC] and is denoted $nCk$ or with this tall
bracket notation:

\\[
    \\binom{n}{k} = \\frac{n!}{k! (n-k)!}
\\]

There are many ways of deriving the equation in terms of factorials, but here's
one I like: imagine we put all $n$ elements in order; there are $n!$ ways of
doing that. Then we always take the $k$ leftmost elements for our choice. However,
because order doesn't matter, we divided by all the different ways of ordering
the $k$ chosen elements, which is $k!$, and the $n-k$ remaining elements, which
is $(n-k)!$.

With that tool in hand, we can define the Bell numbers recursively. The first
couple can be treated as special cases, since obviously there's only one way to
partition a set of zero or one elements:

\\[
    B\_0 = 1,  B\_1 = 1
\\]

For $n > 1$, we generalize the strategy we discovered above:

1. Pick an arbitrary element to represent the "first element."
2. We'll call whichever set in the partition that contains this first element
   the "first set." Every element is in exactly one set of the partition, so this
   uniquely picks out a particular set in the partition.
3. For each $k$ between $1$ and $n$, consider only partitions where the first
   set is of size $k$. This divides the problem up into non-overlapping buckets:
   if two partitions have different sized first set, they cannot 
   possibly be the same.
4. We have to make a choice about the other $k-1$ elements to include in the
   first set, and there are $\\binom{n-1}{k-1}$ ways of doing that.
5. Regardless of which elements we choose for the first set, there will always
   be $n-k$ elements left over. They won't always be the same elements,
   but there will always be $n-k$ of them. Thankfully, we already know how many
   ways there are to partition a set of $n-k$ elements: it's $B\_{n-k}$.
6. Since our choices for step 4 and step 5 are independent, we can *multiply*
   the two counts together to get the total number of partitions where the
   first set is of size $k$.
7. Finally, we just have to add up everything for $k$ from $1$ to $n$.

In concise mathematical notation, this algorithm is:

\\[
    B\_{n} = \sum\_{k=1}^{n} \binom{n-1}{k-1} B\_{n-k}   \\tag{1}
\\]

We can make this a little neater if we run $k$ from $0$ to $n-1$ instead and
use the fact that $\binom{n}{r} = \binom{n}{n-r}$ to count down instead of up:

\\[
    B\_{n} = \sum\_{k=0}^{n-1} \binom{n-1}{k} B\_{k}     \\tag{2}
\\]

Substituting $n+1$ for $n$ we can put the recurrence relation in an even tidier
form, which is the canonical form you'll find in textbooks:

\\[
    B\_{n+1} = \sum\_{k=0}^n \binom{n}{k} B\_k           \\tag{3}
\\]

Equation $(3)$ looks a little cleaner and easier to work with, and can be
understood intuitively if you reconceptualize $k$ not as the number of elements
in the first group, but as the number of elements *not* in the first group.
Shifting to calculating $B\_{n+1}$ also allows us to get rid of the "minus
ones" in the original that made the expression seem messy. However, it's a
little divorced from the intuition about pinning the size of the first set we
used to motivate $(1)$ although of course they're completely equivalent
mathematically.

Computing Bell Numbers
----------------------

Of these three equivalent equations, $(2)$ is the most natural fit for a Python
implementation because `range(n)` naturally runs from `0` to `n-1` and it makes
far more sense to implement a function for $B\_n$ instead of $B\_{n+1}$:

```python
def bell_number(n: int) -> int:
    """Calculate the Bell number for any integer `n`."""
    if n < 0:
        raise ValueError("The Bell number is not defined for n < 0.")
    elif n < 2:
        return 1
    else:
        return sum(
            comb(n-1, k) * bell_number(k)
            for k in range(n)
        )
```


(Optimizing this function is left as an exercise to the reader, who may find the
techniques described in my earlier article on writing [a fairly fast Fibonacci
function][FFFF] helpful.)

We can use it to calculate the first 20 Bell numbers:

<style>
    html .article #bell-table table td,
    html .article #bell-table table th
    {
        text-align: center;
        font-size: 100%;
    }
</style>
<div id="bell-table" style="width: 40%; margin: auto">
    <table>
        <thead>
            <tr>
                <th>$n$</th>
                <th>$B\_n$</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>0</td>
                <td>1</td>
            </tr>
            <tr>
                <td>1</td>
                <td>1</td>
            </tr>
            <tr>
                <td>2</td>
                <td>2</td>
            </tr>
            <tr>
                <td>3</td>
                <td>5</td>
            </tr>
            <tr>
                <td>4</td>
                <td>15</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">5</td>
                <td style="font-weight: bold;">52</td>
            </tr>
            <tr>
                <td>6</td>
                <td>203</td>
            </tr>
            <tr>
                <td>7</td>
                <td>877</td>
            </tr>
            <tr>
                <td>8</td>
                <td>4,140</td>
            </tr>
            <tr>
                <td>9</td>
                <td>21,147</td>
            </tr>
            <tr>
                <td>10</td>
                <td>115,975</td>
            </tr>
            <tr>
                <td>11</td>
                <td>678,570</td>
            </tr>
            <tr>
                <td>12</td>
                <td>4,213,597</td>
            </tr>
            <tr>
                <td>13</td>
                <td>27,644,437</td>
            </tr>
            <tr>
                <td>14</td>
                <td>190,899,322</td>
            </tr>
            <tr>
                <td>15</td>
                <td>1,382,958,545</td>
            </tr>
            <tr>
                <td>16</td>
                <td>10,480,142,147</td>
            </tr>
            <tr>
                <td>17</td>
                <td>82,864,869,804</td>
            </tr>
            <tr>
                <td>18</td>
                <td>682,076,806,159</td>
            </tr>
            <tr>
                <td>19</td>
                <td>5,832,742,205,057</td>
            </tr>
            <tr>
                <td>20</td>
                <td>51,724,158,235,372</td>
            </tr>
        </tbody>
    </table>
</div>

And there it is: $B\_5 = 52$, confirming that there are exactly 52 Genji-mon,
no more and no fewer.


Conclusion
----------

It's not too surprising that some of these ideas were worked out over seven
hundred years ago; combinatorics is an easy branch to stumble into when it
arises in connection to some practical problem. It does, however, feel slightly
surreal that it was a bunch of bored nobles playing an esoteric parlor game who
first noticed these patterns and used it to attach literary significance to
their activities. But I'm happy they did so, because they did something we mere
number crunchers would not have thought to do: they made them beautiful.

<hr>

## Appendices

### Appendix A: Source Code

The full [source code][SC] use for this article is available on GitHub. The
main Python code is in [src/genjiko.py][GPY] and the [notebooks][SCN]
directory contains many examples of usage.

### Appendix B: Alternative Genji-Kō Chart<a name="chart"></a>

Genji-mon are often rendered with thick lines which achieves an interesting
effect with the negative space. By playing around with the parameters a little:

```python
genjiko_df = load_genjiko()
genjiko_df['Color'] = "black"
draw_annotated_genjiko_grid(
    genjiko_df,
    cell_size=82,
    grid_width=8,
    grid_height=7,
    line_width=14,
    padding=20,
    include_index_label=False,
    include_romaji_label=False,
    grid_indent=1,
)
```

We can achieve a very attractive result:

<img src="/post/genji-ko_files/genjiko_dense.png">


<h3 id="table">Appendix C: Full Table</h3>

Here is the full table in HTML format, so you can copy-and-paste the kanji and other
fields. The Genji-mon column uses the [Genji-Kō TrueType font available from
illllli.com](https://www.illllli.com/font/symbol/genjiko/).

You can also download this same table as a [UTF-8 encoded CSV file](/post/genji-ko_files/genjiko.csv)
or [Excel spreadsheet](/post/genji-ko_files/genjiko.xlsx).

<div class="genjiko-wrapper">
    <style>
        html .article table.genjiko-table td {
            font-size: 100%;
            line-height: 1;
        }
        html .article table.genjiko-table th {
            font-size: 100%;
        }
       html .article table.genjiko-table td.genjiko-chapter {
        text-align: center;
       }
       html .article table.genjiko-table td.genjiko-kanji {
            font-size: 125%;
            text-align: center;
        }
        html .article table.genjiko-table td.genjiko-icon {
            font-size: 200%;
            font-family: 'GenjiKo', sans-serif;
            text-align: center;
            padding: 0px;
            margin: 0px;
        }
        html .article table.genjiko-table td..genjiko-partition {
            text-align: center;
        }
        @font-face {
            font-family: 'GenjiKo';
            src: url('/post/genji-ko_files/genjiko.ttf') format('truetype');
        }
    </style>
    <table class="genjiko-table">
        <thead>
            <tr>
                <th>Chapter</th>
                <th>Kanji</th>
                <th style="text-align: left;">Romaji</th>
                <th style="text-align: left;">English</th>
                <th style="text-align: left;">Partition</th>
                <th>Genji-mon</th>
            </tr>
        </thead>
        <tbody>
            
            <tr>
                <td class="genjiko-chapter">2</td>
                <td class="genjiko-kanji">帚木</td>
                <td class="genjiko-romaji">Hōkigi</td>
                <td class="genjiko-english">The Broom Tree</td>
                <td class="genjiko-partition">{1}, {2}, {3}, {4}, {5}</td>
                <td class="genjiko-icon">B</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">3</td>
                <td class="genjiko-kanji">空蝉</td>
                <td class="genjiko-romaji">Utsusemi</td>
                <td class="genjiko-english">Utsusemi</td>
                <td class="genjiko-partition">{1}, {2}, {3}, {4, 5}</td>
                <td class="genjiko-icon">C</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">4</td>
                <td class="genjiko-kanji">夕顔</td>
                <td class="genjiko-romaji">Yūgao</td>
                <td class="genjiko-english">Yūgao</td>
                <td class="genjiko-partition">{1}, {2}, {3, 4}, {5}</td>
                <td class="genjiko-icon">D</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">5</td>
                <td class="genjiko-kanji">若紫</td>
                <td class="genjiko-romaji">Wakamurasaki</td>
                <td class="genjiko-english">Young Murasaki</td>
                <td class="genjiko-partition">{1}, {2, 3}, {4, 5}</td>
                <td class="genjiko-icon">E</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">6</td>
                <td class="genjiko-kanji">末摘花</td>
                <td class="genjiko-romaji">Suetsumuhana</td>
                <td class="genjiko-english">The Saffron Flower</td>
                <td class="genjiko-partition">{1, 2, 3, 4}, {5}</td>
                <td class="genjiko-icon">F</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">7</td>
                <td class="genjiko-kanji">紅葉賀</td>
                <td class="genjiko-romaji">Momijinoga</td>
                <td class="genjiko-english">The Festival of Red Leaves</td>
                <td class="genjiko-partition">{1}, {2, 3, 5}, {4}</td>
                <td class="genjiko-icon">G</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">8</td>
                <td class="genjiko-kanji">花宴</td>
                <td class="genjiko-romaji">Hana no En</td>
                <td class="genjiko-english">The Flower Feast</td>
                <td class="genjiko-partition">{1}, {2}, {3, 5}, {4}</td>
                <td class="genjiko-icon">H</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">9</td>
                <td class="genjiko-kanji">葵</td>
                <td class="genjiko-romaji">Aoi</td>
                <td class="genjiko-english">Aoi</td>
                <td class="genjiko-partition">{1, 2}, {3}, {4}, {5}</td>
                <td class="genjiko-icon">I</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">10</td>
                <td class="genjiko-kanji">賢木</td>
                <td class="genjiko-romaji">Sakaki</td>
                <td class="genjiko-english">The Sacred Tree</td>
                <td class="genjiko-partition">{1, 2, 3}, {4, 5}</td>
                <td class="genjiko-icon">J</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">11</td>
                <td class="genjiko-kanji">花散里</td>
                <td class="genjiko-romaji">Hana Chiru Sato</td>
                <td class="genjiko-english">The Village of Falling Flowers</td>
                <td class="genjiko-partition">{1}, {2, 4}, {3, 5}</td>
                <td class="genjiko-icon">K</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">12</td>
                <td class="genjiko-kanji">須磨</td>
                <td class="genjiko-romaji">Suma</td>
                <td class="genjiko-english">Exile at Suma</td>
                <td class="genjiko-partition">{1, 3, 4}, {2, 5}</td>
                <td class="genjiko-icon">L</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">13</td>
                <td class="genjiko-kanji">明石</td>
                <td class="genjiko-romaji">Akashi</td>
                <td class="genjiko-english">Akashi</td>
                <td class="genjiko-partition">{1}, {2, 3}, {4}, {5}</td>
                <td class="genjiko-icon">M</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">14</td>
                <td class="genjiko-kanji">澪標</td>
                <td class="genjiko-romaji">Miotsukushi</td>
                <td class="genjiko-english">The Flood Gauge</td>
                <td class="genjiko-partition">{1}, {2, 4, 5}, {3}</td>
                <td class="genjiko-icon">N</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">15</td>
                <td class="genjiko-kanji">蓬生</td>
                <td class="genjiko-romaji">Yomogiu</td>
                <td class="genjiko-english">The Palace in the Tangled Woods</td>
                <td class="genjiko-partition">{1, 2, 3}, {4}, {5}</td>
                <td class="genjiko-icon">O</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">16</td>
                <td class="genjiko-kanji">関屋</td>
                <td class="genjiko-romaji">Sekiya</td>
                <td class="genjiko-english">A Meeting at the Frontier</td>
                <td class="genjiko-partition">{1}, {2, 3, 4}, {5}</td>
                <td class="genjiko-icon">P</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">17</td>
                <td class="genjiko-kanji">絵合</td>
                <td class="genjiko-romaji">Eawase</td>
                <td class="genjiko-english">The Picture Competition</td>
                <td class="genjiko-partition">{1, 3}, {2, 5}, {4}</td>
                <td class="genjiko-icon">Q</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">18</td>
                <td class="genjiko-kanji">松風</td>
                <td class="genjiko-romaji">Matsukaze</td>
                <td class="genjiko-english">The Wind in the Pine Trees</td>
                <td class="genjiko-partition">{1, 2}, {3, 4}, {5}</td>
                <td class="genjiko-icon">R</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">19</td>
                <td class="genjiko-kanji">薄雲</td>
                <td class="genjiko-romaji">Usugumo</td>
                <td class="genjiko-english">A Wreath of Cloud</td>
                <td class="genjiko-partition">{1}, {2, 3, 4, 5}</td>
                <td class="genjiko-icon">S</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">20</td>
                <td class="genjiko-kanji">朝顔</td>
                <td class="genjiko-romaji">Asagao</td>
                <td class="genjiko-english">Asagao</td>
                <td class="genjiko-partition">{1, 3, 4}, {2}, {5}</td>
                <td class="genjiko-icon">T</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">21</td>
                <td class="genjiko-kanji">乙女</td>
                <td class="genjiko-romaji">Otome</td>
                <td class="genjiko-english">The Maiden</td>
                <td class="genjiko-partition">{1, 3}, {2}, {4}, {5}</td>
                <td class="genjiko-icon">U</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">22</td>
                <td class="genjiko-kanji">玉鬘</td>
                <td class="genjiko-romaji">Tamakazura</td>
                <td class="genjiko-english">Tamakatsura</td>
                <td class="genjiko-partition">{1, 2}, {3, 4, 5}</td>
                <td class="genjiko-icon">V</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">23</td>
                <td class="genjiko-kanji">初音</td>
                <td class="genjiko-romaji">Hatsune</td>
                <td class="genjiko-english">The First Song of the Year</td>
                <td class="genjiko-partition">{1, 3}, {2, 4}, {5}</td>
                <td class="genjiko-icon">W</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">24</td>
                <td class="genjiko-kanji">胡蝶</td>
                <td class="genjiko-romaji">Kochō</td>
                <td class="genjiko-english">The Butterflies</td>
                <td class="genjiko-partition">{1, 4}, {2, 3, 5}</td>
                <td class="genjiko-icon">X</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">25</td>
                <td class="genjiko-kanji">蛍</td>
                <td class="genjiko-romaji">Hotaru</td>
                <td class="genjiko-english">The Glow-Worm</td>
                <td class="genjiko-partition">{1, 2, 4}, {3}, {5}</td>
                <td class="genjiko-icon">Y</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">26</td>
                <td class="genjiko-kanji">常夏</td>
                <td class="genjiko-romaji">Tokonatsu</td>
                <td class="genjiko-english">A Bed of Carnations</td>
                <td class="genjiko-partition">{1}, {2}, {3, 4, 5}</td>
                <td class="genjiko-icon">Z</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">27</td>
                <td class="genjiko-kanji">篝火</td>
                <td class="genjiko-romaji">Kagaribi</td>
                <td class="genjiko-english">The Flares</td>
                <td class="genjiko-partition">{1}, {2, 4}, {3}, {5}</td>
                <td class="genjiko-icon">a</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">28</td>
                <td class="genjiko-kanji">野分</td>
                <td class="genjiko-romaji">Nowaki</td>
                <td class="genjiko-english">The Typhoon</td>
                <td class="genjiko-partition">{1, 2}, {3}, {4, 5}</td>
                <td class="genjiko-icon">b</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">29</td>
                <td class="genjiko-kanji">御幸</td>
                <td class="genjiko-romaji">Miyuki</td>
                <td class="genjiko-english">The Royal Visit</td>
                <td class="genjiko-partition">{1, 3}, {2, 4, 5}</td>
                <td class="genjiko-icon">c</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">30</td>
                <td class="genjiko-kanji">藤袴</td>
                <td class="genjiko-romaji">Fujibakama</td>
                <td class="genjiko-english">Blue Trousers</td>
                <td class="genjiko-partition">{1, 4}, {2}, {3}, {5}</td>
                <td class="genjiko-icon">d</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">31</td>
                <td class="genjiko-kanji">真木柱</td>
                <td class="genjiko-romaji">Makibashira</td>
                <td class="genjiko-english">Makibashira</td>
                <td class="genjiko-partition">{1, 5}, {2, 4}, {3}</td>
                <td class="genjiko-icon">e</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">32</td>
                <td class="genjiko-kanji">梅枝</td>
                <td class="genjiko-romaji">Umegae</td>
                <td class="genjiko-english">The Spray of Plum Blossom</td>
                <td class="genjiko-partition">{1, 2, 3, 5}, {4}</td>
                <td class="genjiko-icon">f</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">33</td>
                <td class="genjiko-kanji">藤裏葉</td>
                <td class="genjiko-romaji">Fuji no Uraba</td>
                <td class="genjiko-english">Fuji no Uraba</td>
                <td class="genjiko-partition">{1}, {2, 5}, {3, 4}</td>
                <td class="genjiko-icon">g</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">34</td>
                <td class="genjiko-kanji">若菜上</td>
                <td class="genjiko-romaji">Wakana Jō</td>
                <td class="genjiko-english">Wakana, Part I</td>
                <td class="genjiko-partition">{1, 2, 5}, {3, 4}</td>
                <td class="genjiko-icon">h</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">35</td>
                <td class="genjiko-kanji">若菜下</td>
                <td class="genjiko-romaji">Wakana Ge</td>
                <td class="genjiko-english">Wakana, Part II</td>
                <td class="genjiko-partition">{1, 3}, {2}, {4, 5}</td>
                <td class="genjiko-icon">i</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">36</td>
                <td class="genjiko-kanji">柏木</td>
                <td class="genjiko-romaji">Kashiwagi</td>
                <td class="genjiko-english">Kashiwagi</td>
                <td class="genjiko-partition">{1, 3, 5}, {2}, {4}</td>
                <td class="genjiko-icon">j</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">37</td>
                <td class="genjiko-kanji">横笛</td>
                <td class="genjiko-romaji">Yokobue</td>
                <td class="genjiko-english">The Flute</td>
                <td class="genjiko-partition">{1, 4, 5}, {2}, {3}</td>
                <td class="genjiko-icon">k</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">38</td>
                <td class="genjiko-kanji">鈴虫</td>
                <td class="genjiko-romaji">Suzumushi</td>
                <td class="genjiko-english">The Bell Cricket</td>
                <td class="genjiko-partition">{1, 5}, {2}, {3, 4}</td>
                <td class="genjiko-icon">l</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">39</td>
                <td class="genjiko-kanji">夕霧</td>
                <td class="genjiko-romaji">Yūgiri</td>
                <td class="genjiko-english">Yūgiri</td>
                <td class="genjiko-partition">{1, 4}, {2}, {3, 5}</td>
                <td class="genjiko-icon">m</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">40</td>
                <td class="genjiko-kanji">御法</td>
                <td class="genjiko-romaji">Minori</td>
                <td class="genjiko-english">The Law</td>
                <td class="genjiko-partition">{1, 4}, {2, 5}, {3}</td>
                <td class="genjiko-icon">n</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">41</td>
                <td class="genjiko-kanji">幻</td>
                <td class="genjiko-romaji">Maboroshi</td>
                <td class="genjiko-english">Mirage</td>
                <td class="genjiko-partition">{1, 5}, {2}, {3}, {4}</td>
                <td class="genjiko-icon">o</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">42</td>
                <td class="genjiko-kanji">匂宮</td>
                <td class="genjiko-romaji">Nioumiya</td>
                <td class="genjiko-english">Niou</td>
                <td class="genjiko-partition">{1, 2, 4}, {3, 5}</td>
                <td class="genjiko-icon">p</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">43</td>
                <td class="genjiko-kanji">紅梅</td>
                <td class="genjiko-romaji">Kōbai</td>
                <td class="genjiko-english">Kōbai</td>
                <td class="genjiko-partition">{1}, {2, 5}, {3}, {4}</td>
                <td class="genjiko-icon">q</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">44</td>
                <td class="genjiko-kanji">竹河</td>
                <td class="genjiko-romaji">Takekawa</td>
                <td class="genjiko-english">Bamboo River</td>
                <td class="genjiko-partition">{1, 5}, {2, 3, 4}</td>
                <td class="genjiko-icon">r</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">45</td>
                <td class="genjiko-kanji">橋姫</td>
                <td class="genjiko-romaji">Hashihime</td>
                <td class="genjiko-english">The Bridge Maiden</td>
                <td class="genjiko-partition">{1, 3, 4, 5}, {2}</td>
                <td class="genjiko-icon">s</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">46</td>
                <td class="genjiko-kanji">椎本</td>
                <td class="genjiko-romaji">Shiigamoto</td>
                <td class="genjiko-english">At the Foot of the Oak Tree</td>
                <td class="genjiko-partition">{1, 4}, {2, 3}, {5}</td>
                <td class="genjiko-icon">t</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">47</td>
                <td class="genjiko-kanji">総角</td>
                <td class="genjiko-romaji">Agemaki</td>
                <td class="genjiko-english">Agemaki</td>
                <td class="genjiko-partition">{1, 4, 5}, {2, 3}</td>
                <td class="genjiko-icon">u</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">48</td>
                <td class="genjiko-kanji">早蕨</td>
                <td class="genjiko-romaji">Sawarabi</td>
                <td class="genjiko-english">Fern Shoots</td>
                <td class="genjiko-partition">{1, 2}, {3, 5}, {4}</td>
                <td class="genjiko-icon">v</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">49</td>
                <td class="genjiko-kanji">宿木</td>
                <td class="genjiko-romaji">Yadorigi</td>
                <td class="genjiko-english">The Mistletoe</td>
                <td class="genjiko-partition">{1, 2, 4, 5}, {3}</td>
                <td class="genjiko-icon">w</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">50</td>
                <td class="genjiko-kanji">東屋</td>
                <td class="genjiko-romaji">Azumaya</td>
                <td class="genjiko-english">The Eastern House</td>
                <td class="genjiko-partition">{1, 2, 5}, {3}, {4}</td>
                <td class="genjiko-icon">x</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">51</td>
                <td class="genjiko-kanji">浮舟</td>
                <td class="genjiko-romaji">Ukifune</td>
                <td class="genjiko-english">Ukifune</td>
                <td class="genjiko-partition">{1, 5}, {2, 3}, {4}</td>
                <td class="genjiko-icon">y</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">52</td>
                <td class="genjiko-kanji">蜻蛉</td>
                <td class="genjiko-romaji">Kagerō</td>
                <td class="genjiko-english">The Gossamer Fly</td>
                <td class="genjiko-partition">{1, 3, 5}, {2, 4}</td>
                <td class="genjiko-icon">z</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">53</td>
                <td class="genjiko-kanji">手習</td>
                <td class="genjiko-romaji">Tenarai</td>
                <td class="genjiko-english">Writing Practice</td>
                <td class="genjiko-partition">{1, 2, 3, 4, 5}</td>
                <td class="genjiko-icon">1</td>
            </tr>
            
        </tbody>
    </table>
</div>

Note that whenever the English column has apparently been left untranslated,
this is because the chapter title is the proper name of one of the characters
from [*The Tale of Genji*][TG]. Translating these would be as nonsensical as
translating "Jack Smith" to "Lifting Device Metal Worker."



### Appendix D: Names for Genji-Kō Pattern

<p id="names">
This table is included merely to illustrate the variety of legitimate ways
to refer to the patterns used in Genji-kō, and to justify my choice to
standardize on Genji-mon. Click on any of the kanji to link directly to
the Google Image Search for that name.
</p>

<table>
  <thead>
    <tr>
      <th style="text-align: left">Kanji</th>
      <th style="text-align: left">Romaji</th>
      <th style="text-align: left">English Translation</th>
      <th style="text-align: left">Count</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://www.google.com/search?tbm=isch&q=源氏紋" target="_blank">源氏紋</a></td>
      <td>Genji-mon</td>
      <td>Genji Crest</td>
      <td style="font-weight: bold;">844,000</td>
    </tr>
    <tr>
      <td><a href="https://www.google.com/search?tbm=isch&q=源氏香図" target="_blank">源氏香図</a></td>
      <td>Genji-kōzu</td>
      <td>Genji-kō Diagram</td>
      <td>686,000</td>
    </tr>
    <tr>
      <td><a href="https://www.google.com/search?tbm=isch&q=源氏香" target="_blank">源氏香の模様</a></td>
      <td>Genji-kō no Moyō</td>
      <td>Genji-kō Pattern</td>
      <td>400,000</td>
    </tr>
    <tr>
      <td><a href="https://www.google.com/search?tbm=isch&q=源氏香模様" target="_blank">源氏香模様</a></td>
      <td>Genji-kō Moyō</td>
      <td>Genji-kō Design</td>
      <td>479,000</td>
    </tr>
    <tr>
      <td><a href="https://www.google.com/search?tbm=isch&q=源氏香文様" target="_blank">源氏香文様</a></td>
      <td>Genji-kō Monyō</td>
      <td>Genji-kō Motif</td>
      <td>129,000</td>
    </tr>
  </tbody>
</table>


### Appendix E: Asymptotic Behavior

The Bell numbers grow very fast. The asymptotic growth is approximately:

\\[
    B\_n \\sim \\frac{1}{\\sqrt{2 \\pi n}} \\left( \\frac{n}{\\ln n} \\right)^n
\\]

Which is just a tiny bit slower than factorials, as you can see if you compare
it to [Stirling's approximation][SA].


Footnotes
---------

<p id="footnote1">
    <sup><a href="#maintext1">&dagger;</a></sup>
    By "inside", I mean which respect to interval logic, not set containment. Obviously
    no group will be a subset of another, because no incense belongs to more than one
    group. But when the leftmost element of a group is to the left of the leftmost
    element of another, and likewise <i>mutatis mutandis</i> for the rightmost, then
    visually the second group is inside the first.
    <a href="#maintext1">Back</a>
</p>

<p id="footnote2">
  <sup><a href="#maintext2">*</a></sup>
  I know I should cite the creators of these misguided images, but I have not done so to spare any potential embarrassment.
  You can find the originals through a Google reverse image search if you're curious.
  <a href="#maintext2">Back</a>
</p>

[BC]: https://en.wikipedia.org/wiki/Binomial_coefficient
[BN]: https://en.wikipedia.org/wiki/Bell_number
[CAM]: https://www.amazon.com/Combinatorics-Ancient-Modern-Robin-Wilson/dp/0198739052
[CGK]: /post/genji-ko_files/cheap_genjiko_kimono.jpg
[FFFF]: /post/fibonacci/
[GPY]: https://github.com/olooney/genjiko/blob/main/src/genjiko.py
[KV]: https://www.youtube.com/watch?v=wpDb5LhvvSM
[MM]: https://en.wikipedia.org/wiki/Masao_Maeda
[MP]: https://en.wikipedia.org/wiki/Muromachi_period
[MNNK8]: https://www.imdb.com/title/tt2076558/
[P]: https://en.wikipedia.org/wiki/Partition_of_a_set
[SA]: https://en.wikipedia.org/wiki/Stirling%27s_approximation
[SCD]: https://github.com/olooney/genjiko/blob/main/src/genjiko.py#L122
[SCG]: https://github.com/olooney/genjiko/blob/main/src/genjiko.py#L270
[SCN]: https://github.com/olooney/genjiko/tree/main/notebooks
[SC]: https://github.com/olooney/genjiko
[TG]: https://en.wikipedia.org/wiki/The_Tale_of_Genji
[UK]: https://en.wikipedia.org/wiki/Kunisada


