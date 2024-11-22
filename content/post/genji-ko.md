---
title: "The Art and Mathematics of Genji-Kō"
author: "Oran Looney"
date: 2024-10-30
publishdate: 2024-10-30
tags:
    - Python
    - Visualization
    - History
image: /post/genji-ko_files/lead.jpg
---

You might think there's unlikely to be any interesting mathematics arising from
incense appreciation, but that's only because you're unfamiliar with the
peculiar character of Muromachi (室町) era (circa 1300-1500) Japanese nobles.

There has never been a group of people in any time or place who were so keen to
display their sophistication and refinement. It wouldn't do to merely put out a
few sticks of incense - no, you would have to prove that your taste was more
exquisite, your judgement more refined, your etiquette more oblique. You could
of course merely invite some other nobles over for an incense appreciation
party, make a few cutting but plausibly deniable remarks about a rival, maybe
drop a few lines of poetry linking the incense to the current season. But if
you were really on the ball you'd be looking for a way to simultaneously
humiliate your rivals, flirt with your love interest, and impress people in a
position of power. They didn't just perfect cultured refinement - they
weaponized it.

Only under such conditions could something like genji-kō (源氏香) arise. It is
a parlor game played with incense - just one of many similar games inside the
broader umbrella of kōdō (香道), the traditional art of incense appreciation. 

What sets genji-kō apart is its extreme difficulty - where another game might
have contestants write down their guesses for three separate incenses and score
a point for each correct guess, genji-kō asks contestants to smell five
separate samples, then determine which of the five are the same. All five might
be the same, or all five might be different, or (and this is where it gets
interesting) they might be in groups of two or three or four. For example, the
correct solution might be that the first and fourth are the same, the second
and fifth are the same, and the third in a group by itself. Or any other
possible combination of groupings.

Contestants score a single point if they correctly group all five incenses;
otherwise they score nothing. A typical game has five rounds over the course of
an evening, with an overall winner declared at the end. 

Obviously contestants would need some kind of notation to record their answers
in a concise, unambiguous, and easy to read way, and it is really about this
notation - and the art, mathematics, and culture connected to it - that this
article is about.

Notation
--------

Every pattern has exactly five vertical lines, representing the five possible
incenses. To show that two or more incenses are part of the same group, you
draw a horizontal line connecting the top of every vertical line in that group.
To avoid confusion when there are two or more groups, you draw these horizontal
lines at different heights, shortening the vertical lines as needed:

<img src="/post/genji-ko_files/examples.png">

There are a few nuances to the notation worth mentioning. If two groups don't
overlap, there is no need draw them at different heights (top center.) If one
group is "contained" inside another, the inner group is drawn at the lower
height (top right, bottom left) so that it appears nested inside the other. And
in some cases, say when the groups are $\\{1, 3\\}, \\{2, 5\\}, \\{4\\}$
(bottom center), it is impossible to avoid an intersection but we understand
that the groups are still distinct because the horizontal connecting lines are
at different heights.


Genji-Kō features as a plot point in [episode 8 of the experimental horror
anime Mononoke][MNNK8], where it is suggested that players used blocks to
record their solutions. While this might be true - the episodes description of
genji-Kō is otherwise grounded and well-researched - I haven't seen any other
references to this; everything else I've seen suggests the game was played with
ink and paper.

<img src="/post/genji-ko_files/blocks.png">


Etymology
---------

Genji-kō, by the way, is named after the titular Genji of the Heian (平安) era
literary classic [*The Tale of Genji*][TG]. There are two connections. First, in
one chapter of the book Genji hosts an incense appreciation party. Second,
since there are 52 possible patterns and 54 chapters of the book, each pattern
is traditionally associated with - and named after - each chapter (except for
the first and last chapters, which are omitted.) Every educated person of the
Muromachi era would be intimately familiar with [*The Tale of Genji*][TG] and would
know the themes, season, and characters associated with each chapter. by heart,
giving each pattern a literary resonance.

Genji-kō refers to the game, but the game is so closely tied to the patterns
that it can refer to them as well. I used Google to count the number of search
results for different ways of referring to the patterns themselves. 


Based on these results, I'll refer to the patterns themselves as genji-mon
when I want to explicitly refer to the visual pattern.

TODO

Culture
-------

Compared to other traditional arts from the same era such as tea ceremony or
flower arranging, kōdō is not particular popular or well-known even in Japan;
nevertheless it is [still played][KV] even to this day.

However, its cultural influence extends beyond the few who actually play the
game - the patterns show up fairly often as a motif in contemporary Japanese
graphic design:

<img src="/post/genji-ko_files/genjiko_colorful.jpg">

It's especially popular on traditional handcrafted goods, such as kimino:

<img src="/post/genji-ko_files/kimono.jpg">

Cheaper fabrics simply print the same genji-mon repeatedly, but the mark of
high-quality genji-Kō fabric is to use a variety of genji-mon so that the
pattern never quite repeats:

<img src="/post/genji-ko_files/fabric.jpg">

They are often found on good related to incense or kōdō in some way, such
as this incense box:

<img src="/post/genji-ko_files/incense_box.jpg">

<!-- <img src="/post/genji-ko_files/incense_set.jpg"> -->

or this incense holder:
<img src="/post/genji-ko_files/incense_holder.jpg">

[Utagawa Kunisada][UK], circa 1843, painted a  wall scoll for each chapter
of [*The Tale of Genji*][TG] and included the associated genji-mon on every single one.

<img src="/post/genji-ko_files/yugiri_wall_scroll.jpg">


Patterns
--------

Knuth mentions them in the introduction to a [book on the history of combinatorics][CAM]:
<img class="drop-shadow" style="height: 50%; width: 50%;" src="/post/genji-ko_files/combanatorics_ancient_and_modern_page.png">


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

Optimal genji-kō layouts for each partition:

```python
def optimal_genjiko_for_partition(
    partition: List[Set[int]]
) -> List[Tuple[float, Set[int]]]:
    """
    Given a partition, find the optimal genji-kō layout by minimizing a cost
    function.

    I was originally hoping to get to 100% algorithmic generation, but this
    simple rule captures all but 4 of layouts, and the remaining 4 cannot be
    expressed in any rule which is shorter and simpler than just simply listing
    the 4 special cases.
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

Here's what we get if always use the algorithmically calculated "optimal"
layout and simply put them in the order returned by `partitions()`:

<img src="/post/genji-ko_files/algorithmic_genjiko.png">

Good, but not perfect. The order is largely wrong, and the four genji-mon
rendered in red are the ones where our "optimal" layout has failed to reproduce
the traditional design.

<h3 id="maintext">Order</h3>

Knuth [mentions][CAM] that the genji-mon "were not arranged in any particularly
logical order" and I'm inclined to agree. I tried several variations of the
above `partition()` function hoping to find one where the traditional order
would just fall out naturally, but it never did. A close inspection of the
table makes it clear that this was never going to happen: While there is an
overall trend from many to fewer groups, there are just too many cases
where the order is clearly arbitrary.

I found a several references that put the genji-mon in a different order, and
even some that tried to stretch it to 54 using some kind of 
<a target="_blank" href="/post/genji-ko_files/dupes.gif">duplication</a> or introducing 
<a target="_blank" href="/post/genji-ko_files/irregular.jpg">irregular</a> 
patterns.<sup><a href="#footnote">*</a></sup>
 If we
recall the original purpose they served in the game, though, this is clearly
nonsense, not to mention being both mathematically impossible and at odds with tradition.


However, the association between the 52 
patterns and chapter titles for chapters 2-53 of the *Tale of Genji* seem
watertight and consistent. Also, the order of those chapters is mostly
consistent across sources (there is some disagreement about the order of the
later chapters, and one chapter which survives only as a title or perhaps was
intentionally elided as a delicate way to elude to a character's death) so
I've put my genji-kō in chapter order.


Final Result
------------

I spent some time trying to find some elegant heuristic that would nudge
the layout algorithm to produce those four without breaking any of the others,
but the rules were more complex than simply listing the special cases (and
none of them correctly handled Yūgiri (夕霧) which I'll discuss below.)

The four special cases are:

```python
    # Suma: {1, 3, 4} should be lower than {2, 5}
    df.at[10, 'Genjiko'] = [(0.8, {1, 3, 4}), (1.0, {2, 5})]
    
    # Hatsune: {1, 3} should be lower than {2, 4}
    df.at[21, 'Genjiko'] = [(0.8, {1, 3}), (1.0, {2, 4}), (1.0, {5})]
    
    # Yuguri: {1, 4} should be lower than {3, 5}, and {2} even lower.
    df.at[37, 'Genjiko'] = [(0.8, {1, 4}), (0.6, {2}), (1.0, {3, 5})]
    
    # Nioumiya: {1, 2, 4} should be lower than {3, 5}
    df.at[40, 'Genjiko'] = [(0.8, {1, 2, 4}), (1.0, {3, 5})]
```

With these corrections, and using the *Tale of Genji* chapter order.

<img src="/post/genji-ko_files/genjiko.png">


Of the four exceptions, three are obvious improvements but the fourth, Yugiri,
seems to actively violate the basic rules around nesting and creates a
three-level structure when two would have sufficed. 

<img src="/post/genji-ko_files/yuguri_diff.png">

TODO I'm not about to stand in the way of 900 years of tradition, nor am I about to
argue with the aesthetic sensibilities of [Utagawa Kunisada][UK], so we'll use the
traditional version.



Mathematics
-----------

The connection between genji-kō and mathematics becomes apparent if we ask
ourselves, "Why are there exactly 52 genji-mon patterns? How can we be sure
there aren't more?" 


Two:
<img src="/post/genji-ko_files/counting_partitions2.png">

Since each group of the partition must contain at least one element, it's
obvious that there can be at most two groups by the [pigeonhole principle][PHP].
Thus, there are either zero, one or two groups. Zero doesn't work because
it doesn't cover the set. One does work, and there's obviously only one way to
do it. Suppose there's two groups. At least one of the groups must contain 1.
The other must contain at least one element, but it can't contain 1, therefore
it must contain 1. Since these two groups already cover the set, this is the
full partition. Since we were able to prove the structure of the partition
starting from only the definition of a partition and the fact the set had two
elements, all partitions of a set of two elements must have this structure;
therefore this partition is unique.


[PHP]: https://en.wikipedia.org/wiki/Pigeonhole_principle


For three, things start to get interesting. We need a principle by which we
can divide possible partitions into groups and be assured,

a) that we never count a partition twice
b) that we count every partition.

The trick is to "pin" one of the elements. Since it's arbitrary, we'll
select element 1, represented by the left vertical bar in a genji-kō pattern.
Exactly one of groups *must* contain element 1; we'll call this the "first"
group. This group can any size from 1 to N. Suppose it has size n. Then there
are "N-1 choose n" possible ways to select the first group. However, whichever
way we pick, there will be N-n elements "left over" that we must partition.

There's only one way to for the first group to contain only a single element:
if it consists of the first group and no other. However, there are two elements
left over. We already know there are exactly two ways to partition of a set
of two elements, so there must be two partitions of a group of three elements 
where the first group is of size one.

What if the first group is of size two? Well, then we have to pick the position
of the other element, and our choices are 2 or 3. Regardless of what we pick,
there will always be one element left over, which can only be partitioned one way.

Finally, if the first group is of size three, there are no elements left over.

Thus we have $1 \\times 2 + 2 \\times 1 + 1 = 5$ ways to partition a set of three elements.

Three:
<img src="/post/genji-ko_files/counting_partitions3.png">

Let's do that for a set of four elements. The first group is of size 1, 2, 3, or 4.

There's only one way to choose a first group of size one, and there are three elements left over,
which we showed above can be partitioned five different ways.

For a first group of size two, we have a choice of three possible elements for other
element of the first group. Regardless of which we pick, we'll have two left
over, and we know there are two ways to partition a set of two elements. Thus
there are $3 \\times 2 = 6$ partitions where the first group is size two.

There are three ways to pick a first group of size three, because we are essentially
picking which of {2, 3, 4} to leave out. Regardless of how we pick, there is one
element left over, which can only be partitioned one way.

Finally, there is only one way to pick a first group of size four, and with no
elements left over, this gives us only one way to partition the set.

So the total number of ways to partition a set of size 4 is 
$1 \\times 5 + 3 \\times 2 + 3 \\times 1 + 1 = 15$.


Four:
<img src="/post/genji-ko_files/counting_partitions4.png">

Let's ask ourselves exactly what we're counting, anyway. Each pattern divides
the five incenses into a number of distinct groups. Each of incense belongs
to one and only one group, and every incense belongs to at least one group.
Within each group, there's no particular *order* to the incenses that belong
to that group - an incense either belongs to a group or it doesn't, it isn't
the first or last of a group. Equally, there's no particular order to the
groups themselves - putting incense 1, 2, 3 into the first group and 4 and 5
into the other is the same as putting 4 and 5 in the first group and 1, 2, 3
and into the second.

In mathematical language, an object which is a collection of other objects
in no particular order so that only membership matters is called a *set*. Let's
model our problem by starting with a set of five distinct elements that we'll
call $I$ after "incense:"

\\[
    I = \\{ 1, 2, 3, 4, 5 \\}
\\]

Each group of a genji-kō solution is a *subset* of $I$. Furthermore, since the
genji-kō pattern consists of subsets of $I$ in no particular order, we can
model it as a set too - a set containing other sets.

For example, we could write the 9th genji-kō Sakaki (賢木) as 

\\[
    G\_9 = \\{ \\{1, 2, 3\\}, \\{4, 5\\} \\}
\\]

More generally, each genji-kō is given as 

\\[
    G = \\{ S\_1, S\_2, \dots, S\_k \\}
\\]
where each $S\_i$ is a subset of $I$:

\\[
    \forall i, S\_ \neq \emptyset \\land S\_i  \subseteq I
\\]

Furthermore, we require that no two groups overlap:

\\[
    \forall x, y \in G, \, x \neq y \implies x \cap y = \emptyset
\\]

and all the groups unioned together covers $I$:

\\[
    \bigcup\_{S \in G} S = I
\\]

This particular structure as a name: it's called a *partition* of $I$. The
combinatorics of partitions is well-known, so we could just look the formulas
up. But let's see if we can continue our analysis.

We know that partitions of $I$ exist, by construction. For example, we could
put each incense in its own group: 
$\\{ \\{1\\},\\{2\\}, \\{3\\}, \\{4\\}, \\{5\\} \\}$
or lump them into one big group: 
$\\{ 1, 2, 3, 4, 5\\}$. 
The task is to count
them in a more systematic way. 

Here, as is often the case in mathematics, the problem is made easier by
abstracting it. Instead of focusing on sets of five elements, let's ask how we
can count to partitions of any set consisting of a finite number of distinct
elements. Let's give it a name: for reasons that will become clear in a moment,
we'll call the number of partitions of a set of $k$ distinct elements $B\_k$. 

The first couple are easy: it's easy to see that the only way to partition an
empty set is $\\{\\}$, and the only way to partition a set with one element
$\\{a\\}$ is $\\{ \\{a\\} \\}$. If you're not sure why, refer to the above
definition of a partition, particularly the part where we require that the
subsets be non-empty, and try to convince yourself this is true.

\\[
    B\_0 = 1
\\]

and

\\[
    B\_1 = 1
\\]

Returning to the general case of $B\_k$ for $k>1$, we know that our partition
is going to have at least one group in it, so let's focus on that first group
for a second, and ignore any other groups for now. How many ways are there
of selecting just that first group?

Well, it depends on how big that first group is. It's non-empty, so it must be greater than
one, and of course it must be less than k. So we have $1 \ge |S\_1| \ge k$. 

Again, 




\\[
    B\_{n+1} = \sum\_{k=0}^n \binom{n}{k} B\_k
\\]


Appendix A: Alternative Genji-Kō Chart<a name="chart"></a>
--------------------------------------

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


Appendix B: Full Table<a name="table"></a>
----------------------

The full table in HTML format, so you can copy-and-paste the kanji and other
fields. The Genji-mon column uses the [Genji-Kō TrueType font available from
illllli.com](https://www.illllli.com/font/symbol/genjiko/).

You can download this same table as a [UTF-8 encoded CSV file](/post/genji-ko_files/genjiko.csv)
or [Excel spreadsheet](/post/genji-ko_files/genjiko.xlsx).

Note: whenever the English column has apparently been left untranslated, that
is because the chapter title is the proper name of one of the characters from
[*The Tale of Genji*][TG]. Translating these would be as nonsensical as translating
"Jack Smith" to "Lifting Device Metal Worker."

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
                <td class="genjiko-english">The Broom-Tree</td>
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
                <td class="genjiko-english">Murasaki</td>
                <td class="genjiko-partition">{1}, {2, 3}, {4, 5}</td>
                <td class="genjiko-icon">E</td>
            </tr>
            
            <tr>
                <td class="genjiko-chapter">6</td>
                <td class="genjiko-kanji">末摘花</td>
                <td class="genjiko-romaji">Suetsumuhana</td>
                <td class="genjiko-english">The Saffron-Flower</td>
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
                <td class="genjiko-english">The Wind in the Pine-Trees</td>
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
                <td class="genjiko-english">The Spray of Plum-Blossom</td>
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
                <td class="genjiko-english">At the Foot of the Oak-Tree</td>
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
                <td class="genjiko-english">Fern-Shoots</td>
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
                <td class="genjiko-english">The Gossamer-Fly</td>
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


Appendix C: Popularity of Names for Genji-Kō Patterns<a name="names"></a>
-----------------------------------------------------

This table is included merely to illustrate the variety of legitimate ways
to refer to the patterns used in genji-kō, and to justify my choice to
standardize on genji-mon. Click on any of the kanji to link directly to
the Google Image Search for that name.

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

Footnotes
---------

<p id="footnote">
  <sup><a href="#maintext">*</a></sup>
  I know I should cite the creators of these images, but I have not done so to spare any potential embarrassment.
  You can find the originals through Google, if you're curious.
  <a href="#maintext">Back to the main text</a>
</p>

[TG]: https://en.wikipedia.org/wiki/The_Tale_of_Genji
[CAM]: https://www.amazon.com/Combinatorics-Ancient-Modern-Robin-Wilson/dp/0198739052
[KV]: https://www.youtube.com/watch?v=wpDb5LhvvSM
[MNNK8]: https://www.imdb.com/title/tt2076558/
[UK]: https://en.wikipedia.org/wiki/Kunisada

