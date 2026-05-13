---
title: "Why the Monty Hall Problem Drives People Crazy"
author: "Oran Looney"
date: 2026-03-24
publishdate: 2026-03-24
tags:
  - Math
  - Philosophy
  - Game Theory
image: /post/monty-hall_files/lead.jpg
---

This essay isn't about explaining the Monty Hall Problem&mdash;you can look
that up anywhere these days&mdash;but a closely related question: why does
this puzzle seem to drive some people crazy? Why do they get so attached to
their wrong answers, and so upset by the correct answer? That's weird, right?
People don't usually care enough about math problems to get worked up over
them, but there's something about the way this particular problem is framed
that really pushes people's buttons.

There is a good answer to this question, and it's not just, "it's a tricky
problem and people don't like being wrong." It's roughly analogous to what
Kahneman called [attribution substitution][AS], but instead of substituting an
*easier* version of a question, I'm going to argue that people are substituting
an *adversarial* version of a game.

This is going to take a little work to unpack, but I think it's worth digging
into because it explains a lot about how people understand (and misunderstand)
the world around them.


The Monty Hall Problem
----------------------

The Monty Hall Problem was best described on this episode of Brooklyn 99:

<div style="width: 560px; margin: auto">
<iframe width="560" height="315"
src="https://www.youtube.com/embed/AD6eJlbFa2I?si=XETowN3gxlp9QS0M"
title="YouTube video player" frameborder="0" allow="accelerometer; autoplay;
clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

Prior to that, it was discussed by Marilyn vos Savant, to a [famously negative
public reaction][MVS]. After giving the correct answer in a newspaper column,
she was bombarded with hate mail vehemently insisting she was wrong. But why?

The glib answer is sexism, but this is inadequate; she wrote on many other
topics which did not elicit the same reaction despite having the same author.
No, there must be something about the problem itself that triggers an unusually
strong reaction.


The Adversarial Variant
-----------------------

The true Monty Hall Problem (MHP) assumes that Monty *always* shows you a goat
and *always* gives you the option to switch. The sequence of play looks
something like this:

![Canonical Monty Hall Flowchart](/post/monty-hall_files/canonical_flowchart.png)

We're now going to introduce an adversarial variation of the game. In this
version, Monty has a choice: he can either open a door and give you the option
switch, just like in the original game, or he can *immediately* give you what's
behind the door you picked. He still has full information about what's behind
the door, but something's changed. What's more, it's a zero-sum game: Monty
doesn't *want* you to win, and will make his choice based on whatever is worse
for you.

From Monty's point of view, the optimal policy is obvious. He knows if the door
you chose has a goat or a car. If its a goat, he has zero incentive to offer
you a chance to switch as that *might* result in you switching to the car. If
its a car, then he has every reason to offer you the choice in the hope that
you'll switch. 

That means from the player's point of view, the game now looks like this:

![Canonical Monty Hall Flowchart](/post/monty-hall_files/adversarial_flowchart.png)


It's worth comparing the outcomes in these two different variants:

<style>
  :root {
    --win-bg: #d9ead3;
    --lose-bg: #f4cccc;
    --win-text: #0b4f0b;
    --lose-text: #7f0000;
  }

  table.monty-grid {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
  }

  .monty-grid th,
  .monty-grid td {
    padding: 0.5em;
    text-align: center;
    vertical-align: middle;
    line-height: 1.15;
    font-size: 0.95rem;
  }

  .monty-grid th {
    background: transparent;
    font-weight: 700;
  }

  .monty-grid .choice {
    width: 10rem;
  }

  .monty-grid .win {
    background: var(--win-bg);
    color: var(--win-text);
  }

  .monty-grid .lose {
    background: var(--lose-bg);
    color: var(--lose-text);
  }

  .monty-grid .group-separator {
    border-left: 1px solid #800000;
  }

  .monty-grid .row-label {
    color: #800000;
    font-weight: bold;
  }
</style>

<table class="monty-grid" aria-label="Monty Hall outcomes by initial car location and player decision">
  <thead>
    <tr>
      <th rowspan="2" class="row-label">Car Location</th>
      <th colspan="2" class="group-separator">Canonical</th>
      <th colspan="2" class="group-separator">Adversarial</th>
    </tr>
    <tr>
      <th class="choice group-separator">Stay</th>
      <th class="choice">Switch</th>
      <th class="choice group-separator">Stay</th>
      <th class="choice">Switch</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="row-label">Initial Door</td>
      <td class="win group-separator">Win</td>
      <td class="lose">Lose</td>
      <td class="win group-separator">Win</td>
      <td class="lose">Lose</td>
    </tr>
    <tr>
      <td class="row-label">Other Door #1</td>
      <td class="lose group-separator">Lose</td>
      <td class="win">Win</td>
      <td class="lose group-separator">Lose</td>
      <td class="lose">Lose</td>
    </tr>
    <tr>
      <td class="row-label">Other Door #2</td>
      <td class="lose group-separator">Lose</td>
      <td class="win">Win</td>
      <td class="lose group-separator">Lose</td>
      <td class="lose">Lose</td>
    </tr>
  </tbody>
</table>

The proportion of green in each column tells you the probability of winning
under each strategy in each variant. In the canonical game, switching nets
you a 2/3 chance of winning, vs. only 1/3 if you stay, so your best move is
to switch. So much we already knew.

But look at the adversarial game. If you switch, you're doomed: there's no
chance of winning at all. That's because Monty *only* gives you the opportunity
to switch if he *knows* you've already chosen the car. It's a trap: he's giving
you a second opportunity to lose. Your only real option is to choose to stay if
given a choice. Of course, you often won't be given a choice: you'll pick a
goat door, he'll immediately reveal it, and you'll think, "ah, bad luck." You
never even know that you were denied an opportunity to switch unless you'd seen
the game played before.


Card Forcing
------------

This structure is reminiscent of the classic magician's "force." Suppose a
magician wants to force you to end up with a particular card. He of course
knows where it is, but he wants to make it seem as if you picked it. He asks
you to cut the deck into two piles and point to one. If the force card is in
the pile you indicate, he says, "great, we'll use this one." But if the force
card is in the other pile, he reframes your gesture as eliminating the pile you
pointed to: "fine, we'll get rid of this one." Either way, the pile containing
the force card survives. From your perspective, it feels as though you made a
free choice, but the magician was really using hidden information to
reinterpret the meaning of your gesture to achieve his own ends.

Of course, if the magician kept doing that over and over, sometimes retaining
the pile you select and sometimes eliminating it, you'd catch on pretty
quickly. That's why magicians actually use a variety of techniques to force
cards and would never use this particular way more than once a show.

What makes the force possible is that the process wasn't explained clearly up
front. You're just going along with the act, getting fed instructions one at a
time. There's no way for you to see how the larger picture constrains you.


Adversarial Substitution as a Robust Strategy
---------------------------------------------

People are constantly on guard against being scammed. Even though Monty Hall
himself is playing fair, they pick up on the fact that the whole setup is "scam
shaped." Their intuition analyzes the adversarial variant instead of the true
game and comes to the mistaken conclusion that they shouldn't switch. They are
instinctively suspicious of the fact that they're getting an opportunity to
second-guess themselves; why would Monty bother to do that if it didn't benefit
him in some way?

It's worth reiterating that none of that adversarial stuff is in the actual
rules of the game, which are explicit that Monty *always* reveals a goat and
*always* gives you an opportunity to switch. So instead of being street smart,
it's just paranoid. Instead of protecting you, your lack of trust leads you
astray, leading to a suboptimal decision and costing you (on average) 1/3 of
car.

I suspect that's where the anger comes from: subconsciously people feel like
switching is a trap that they should stay away from, but they can't actually
identify anything in the rules to justify that feeling. Of course not: the
"catch" isn't in the rules as stated, but in the space around those rules that
an unscrupulous operator *could* take advantage of. All they're left with is
cognitive dissonance and the vague feeling they're being taken advantage of
somehow.


History of Badly Framed Questions
---------------------------------

There's a long history of researchers giving people highly abstract logic
puzzles and clicking their tongues when subjects made the *faux pas* of
interpreting sentences that had been reversed translated from symbolic logic
expressions  as if they were normal English sentences. More often then not,
its the translation into natural language which is faulty, not the subjects
ability to reason. When the same logic puzzles are rewritten to actually make
sense, the deficit in logical thinking disappears.

A classic example is the [Wason selection task][WST]. Subjects are shown four
cards and told a rule like, "If a card has an even number on one side, then it
has a red color on the other." Most people perform badly on this abstract
version of the task. But when the exact same logical structure is reframed as a
social rule -- for example, "If a person is drinking beer, then they must be
over 21" -- performance improves dramatically. People immediately understand
that you need to check the beer drinker and the underage person.

![Wason Task](/post/monty-hall_files/wason.png)

You can see the same thing with the ordinary English word "or." In formal
logic, OR is inclusive: "A or B" means A, or B, or both. But in natural
language, people often interpret OR exclusively. If someone says, "Either we
eat pizza or I'm going home," nobody thinks the speaker means both could happen
simultaneously.

Why not? [Grice's conversational maxims][GCM] provide an answer. Grice argued
that in ordinary conversation, speakers are assumed to be cooperative and
informative. One of maxims is the maxim of quantity: say as much as is needed,
but no more. If a speaker knew both options were true, then the more
informative thing to say would simply be "A and B." By instead choosing the
weaker statement "A or B," the speaker conversationally implies that the
stronger statement is not true. The exclusivity is therefore not contained in
the literal meaning of OR itself, but inferred pragmatically from the
assumption that the speaker is communicating efficiently and honestly.

> "Communicating badly and then acting smug when you're misunderstood is not
> cleverness."
> <br>&mdash;Randall Munroe

The point is that translation of a puzzle from natural language to formal
mathematics is fraught with peril. It's the *framing* of the probability
problem as a "game show" that naturally causes people to start thinking of
it in adversarial terms. 


Conclusion
----------

Is adversarial substitution actually a fallacy? Or is it a street smart, robust
strategy to avoid being conned? One thing we can say for sure is that doing it
*subconsciously* is always a mistake. 

> "The cardinal sin is to make a choice without knowing you are making one."
> <br>&mdash;Jonathan Shewchuk

However, merely being aware of the phenomenon lets us make a more intentional,
conscious decision. When you start to get that gut feeling that you might be
about to scammed, ask yourself if you really have sufficient guarantees about
the rules of the game to analyze it correctly. In the case of the Monty Hall
problem, we can double-check the rules to confirm that Monty will *always* open
a door and reveal a goat. Once we are sure of that, we can follow the optimal
strategy of switching doors. The net benefit is an additional 1/3 of the value
of a  car, doubling our expected reward, so surely worth doing!

On the other hand, in situation with different social dynamics, say playing a
version of the same game against a street hustler, you might be wise to adopt a
more defensive strategy of not switching.

It also pays to be aware that other people might be automatically making the
same adversarial substitution. Maybe the reason they aren't accepting your
perfectly legitimate offer is because the structure of the deal feels like it
could be exploited in this way, setting off alarm bells. 


[AS]: https://en.wikipedia.org/wiki/Attribute_substitution
[WST]: https://en.wikipedia.org/wiki/Wason_selection_task
[GCM]:https://en.wikipedia.org/wiki/Cooperative_principle 
[MVS]: https://en.wikipedia.org/wiki/Monty_Hall_problem
