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
peculiar character of Muromachi (室町) era Japanese nobles.

You see, it was a time of great insecurity and political instability, TODO

Never before or after, in any place or period of history, did you have have a
group of people who were so desperate to display their sophistication and
refinement. It was a matter of life or death. It wouldn't do to merely put out
a few sticks of incense. You would have to demonstrate that your taste was more
exquisite, your judgement more refined, your etiquette more oblique. You could
of course merely invite some other nobles over for an incense appreciation
party, make a few cutting but plausibly deniable remarks about a rival, maybe
drop a few lines of poetry linking the incense to the current season. But if
you were really deadly serious (and they were) you'd be looking for a way you
could simultaneously humiliate your rivals, flirt with romantic interests, and
impress people in a position of power. These nobles didn't just perfect
cultured refinement - they weaponized it.

Only under such conditions could something genji-kō (源氏香) arise. It is a
parlor game played with incense - just one of many similar games inside the
broader umbrella of kōdō (香道). What sets genji-kō apart is its extreme
difficulty - where another game might have contestants write down their guesses
for three separate incenses and score a point for each correct guess, Genji-kō
asks contestants to smell five separate samples, then determine which of the
five are the same. All five might be the same, or all five might be different.
The might be in groups of two or three or four - there might be one group of
two and a second group of three. If the contestant correctly grouped all five
incense they would score a single point; otherwise they would score nothing.

Obviously contestants would need some kind of notation to record their answers
in a concise, unambiguous, and easy to read way. 

Rules
-----


<img src="/post/genji-ko_files/examples.png">


TODO intro to genji-ko

<img src="/post/genji-ko_files/blocks.png">


History
-------

Genji-kō, by the way, is named after the titular Genji of the Heian era literary
classic [The Tale of Genji][TG]. There are actually two connections: First, in
one chapter of the book, Genji hosts an incense appreciation party. Second,
since there are 52 possible patterns and 54 chapters of the book, each pattern
is traditionally associated with and named after each chapter (except for the
first and last chapters, which are omitted.) This gives each pattern a kind of
literary resonance - every Muromachi era noble would be intimately familiar
with the book, and would know the themes, season, and characters associated
with each chapter. 


Culture
-------

I wouldn't say genji-kō is exactly well-known in Japan - even kōdō is fairly
obscure compared to more popular traditional arts from the same era such
as tea ceremony or flower arranging - but they do show up fairly often as a motif in
contemporary Japanese graphic design or on traditional handcrafted goods.

<img src="/post/genji-ko_files/kimono.jpg">
<img src="/post/genji-ko_files/fabric.jpg">

Often found on good related to incense or kōdō in some way:

<img src="/post/genji-ko_files/incense_set.jpg">
<img src="/post/genji-ko_files/incense_box.jpg">
<img src="/post/genji-ko_files/incense_holder.jpg">

Utagawa Kunisada, circa 1843, painted a  wall scoll for each chapter
of the Tale of Genji and included the genji-kō on each:

<img src="/post/genji-ko_files/yugiri_wall_scroll.jpg">


Patterns
--------

Knuth writes about it:
<img src="/post/genji-ko_files/combanatorics_ancient_and_modern_page.png">


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

Good, but not perfect. The order is largely wrong, and there are four
genji-kō (the ones rendered in red) where our concept of "optimal" has
failed to reproduce the traditional design.

Order
-----

Knuth [mentions][CAM] that the genji-kō patterns "were not arranged in any
particularly logical order" and I'm inclined to agree. I tried several
variations of the above `partition()` function hoping to find one where the
traditional order would just fall out naturally, but it never did. A close
inspection of the table makes it clear that this was never going to happen:
there's an overall trend from many separate groups to fewer groups, but there
are just too many cases where the order is arbitrary.

I found a ton of references that put the genji-kō in a different order, and
even some that tried to stretch it to 54 using some kind of duplication or 
introducing irregular patterns. However, the association between the 52 
patterns and chapter titles for chapters 2-53 of the *Tale of Genji* seem
water tight and consistent. Also, the order of those chapters is mostly
consistent across sources (there is some disagreement about the order of the
later chapters, and one chapter which survives only as a title or perhaps was
intentionally elided as a delicate way to elude to a character's death) so
I've put my genji-kō in chapter order.

TODO: Table? Link to .txt?


Final Result
------------

I spent some time trying to find some elegant heuristic that would nudge
the layout algorithm to produce those four without breaking any of the others,
but the rules were more complex than simply listing the special cases (and
none of them correctly handled Yuguri, which I'll discuss below.)

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

I'm not about to stand in the way of 900 years of tradition, nor am I about to
argue with the aesthetic sensibilities of Utagawa Kunisada, so we'll use the
traditional version.


Mathematics
-----------

The connection between genji-kō and mathematics becomes apparent if we ask
ourselves, "Why are there exactly 52 genji-kō patterns? How can we be sure
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

Thus we have 1*2 + 2*1 + 1 = 5 ways to partition a set of three elements.

Three:
<img src="/post/genji-ko_files/counting_partitions3.png">

Let's do that for a set of four elements. The first group is of size 1, 2, 3, or 4.

There's only one way to choose a first group of size one, and there are three elements left over,
which we showed above can be partitioned five different ways.

For a first group of size two, we have a choice of three possible elements for other
element of the first group. Regardless of which we pick, we'll have two left
over, and we know there are two ways to partition a set of two elements. Thus
there are 3*2 = 6 partitions where the first group is size two.

There are three ways to pick a first group of size three, because we are essentially
picking which of {2, 3, 4} to leave out. Regardless of how we pick, there is one
element left over, which can only be partitioned one way.

Finally, there is only one way to pick a first group of size four, and with no
elements left over, this gives us only one way to partition the set.

So the total number of ways to partition a set of size 4 is 1*5 + 3*2 + 3*1 + 1


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
put each incense in its own group: $\\{ \\{1\\},\\{2\\}, \\{3\\}, \\{4\\}, \\{5\\} \\}$
or lump them into one big group: $\\{ 1, 2, 3, 4, 5\\}$. The task is to count
them in a more systematic way. 

Here, as is often the case in mathematics, the problem is made easier by abstracting it.
Instead of focusing on sets of five elements, let's ask how we can count to partitions
of any set consisting of a finite number of distinct elements. Let's give it a
name: for reasons that will become clear in a moment,  we'll call the number of
partitions of a set of $k$ distinct elements $B\_k$. 

The first couple are
easy: it's easy to see that the only way to partition an empty set is $\\{\\}$, and
the only way to partition a set with one element $\\{a\\}$ is $\\{ \\{a\\} \\}$.
If you're not sure why, refer to the above definition of a partition, particularly
the part where we require that the subsets be non-empty, and try to convince yourself
this is true.

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


Art
---

Genji-kō are often rendered with very narrow negative space:

<img src="/post/genji-ko_files/genjiko_dense.png">

I think that might be the most beautiful image I've ever generated.



[TG]: https://en.wikipedia.org/wiki/The_Tale_of_Genji
[CAM]: https://www.amazon.com/Combinatorics-Ancient-Modern-Robin-Wilson/dp/0198739052
