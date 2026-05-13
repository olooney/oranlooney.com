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
that up anywhere these days&mdash;but about a less explored question: why does
this puzzle seem to drive people crazy? Why do they get so attached to their
wrong answers, and so upset by the correct answer? That's weird, right? People
don't usually care enough about math problems to get worked up over them, but
there's something about the way this particular problem is framed that really
pushes people's buttons.

Suprisingly, there is a good answer to this question, and it's not just, "it's
a tricky problem and people don't like being wrong." It's related to what
Kahneman called [attribution substitution][AS], but instead of substituting an
*easier* question, I'm going to argue that people are substituting an
*adversarial* game. Arguably, this is the more streetwise approach; which in
turn is why people get upset when you insist on the canonical example: they
don't just think they've gotten an abstract math problem wrong, they just feel
like they've been conned.

Obviously this is going to take a little work to unpack, but I think it's worth
sticking around for the details because I strongly suspect this specific trick
explains a lot about how people approach the world around them: the lesson is
far broader than just puzzles.


The Monty Hall Problem
----------------------

The Monty Hall Problem was described on this episode of Brooklyn 99:

TODO: Youtube video

Prior to that, it was discussed by Marilyn vos Savant, to negative public reaction.
The glib answer is sexism, but this is inadequate; she wrote on many topics,
which surely attracted hate mail, but not to the same extent. No, there must
be something about the problem itself that triggers this reaction.

![Canonical Monty Hall Flowchart](/post/monty-hall_files/canonical_flowchart.png)


The Adversarial Variant
-----------------------

The true Monty Hall Problem (MHP) assumes that Monty *always* shows you a
goat and *always* gives you the option to switch. In the adversarial variant
of the game, Monty has a choice: he can either open and door and give you
the option switch, or he can *immediately* give you what's behind the door
you picked. He still has full information about what's behind the door, but
something's changed. Now it's a zero sum game: he doesn't want you to win, and
is willing to bend the rules to ensure that you don't.


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
you a 2/3 chance of winning, vs. only 1/3 if you stay, so your best move it
to switch. So much we already knew.

But look at the adversarial game. Now if you switch, you're totally doomed:
no chance of winning at all. That's because Monty *only* gives you the opportunity
to switch if he *knows* you've already chosen the car. It's a trap: he's giving
you a second opportunity to lose. Your only real option is to choose to
stay if given a choice. Of course, you often won't be given a choice: you'll
pick a goat door, he'll immediately reveal it, and you'll think, "ah, bad luck."
You never even know you that you were denied an opportunity to switch unless
you'd seen the game played before.


Card Forcing
------------

You can see the same structure in a classic magician's "force." Suppose a
magician wants to force you to end up with a particular card. He of course
knows where it is, but he wants to make it seem as if you picked it. He asks
you to cut the deck into two piles and point to one. If the force card is in
the pile you indicate, he says, "great, we'll use this one." But if the force
card is in the other pile, he reframes your gesture as eliminating the pile you
pointed to: "fine, we'll get rid of this one." Either way, the pile containing
the force card survives. From the your perspective, it feels as though you made
a free choice, but the magician was really using hidden information to
reinterpret the meaning of your gesture to achieve own ends.

Of course, if the magician kept doing that over and over, sometimes retaining
the pile you select and sometimes eliminating it, you'd catch on pretty quickly.
That's why magician's actually use a variety of techniques to force cards and
would never use this particular way more than once a show.

What makes the force possible is that the process wasn't explained clearly up
front. You're just going along with the act, getting fed instructions one at a
time. There's no way for you to see how the larger picture constrains you.



Adversarial Substitution as a Robust Strategy
---------------------------------------------

Now, I put it to you that people are constantly on guard against being scammed.
Even though Monty Hall himself is playing fair, they pick on the
fact that the whole setup is "scam shaped." I think people subconsciously
substitute the adversarial variant for the true problem. Their intuition analyzes
the adversarial variant and correctly comes to the conclusion that they should
stay. They are instinctively suspicious of the fact that their getting an 
opportunity to second guess themselves; why would Monty bother to do that if
it didn't benefit him in some way?

I would go further; rather than being a mistake or fallacy, isn't this a kind
of wisdom? A street smart intuition that protects you from scams? 

It's worth reiterating, none of that adversarial stuff is in the actual rules
of the game, which are explicit that Monty *always* reveals a goat and *always*
gives you an opportunity to switch. So instead of being street smart, it's just
paranoid. Instead of protecting you, your lack of trust leads you astray.

I suspect that's where the cognitive dissonance comes from: subconsciously
people feel like switching it a trap that they should stay away from, but they
can't actually identify anything in the rules to justify that feeling. Of
course not: the "trap" isn't in the rules as stated, but in the space around
the those rules that a clever operator could take advantage of.


History of Badly Framing Questions
----------------------------------

Asking undergraduates questions logic questions in natural language and
then acting superior and bemoaning the intelligence of the youth these days
has a long history.

1. Non-exclusive OR
2. Material Implication

These specific interpretations are not found in natural language but are
arbitrary decisions mathematicians and logicians made when mapping natural
language onto formal language. Student's find it counterintuitive because
it *is*: there's nothing in natural language that says every OR
must be interpretted as non-exclusive.

In fact, this violates the Gricean maxims. If someone says, "either we eat
pizza or I'm going home," they are using an exclusive OR. Asking questions
badly and then laughing at students for using their native languages in the
manner it was intended is a little silly.

Framing is hugely important. Framing a problem as checking the "you must be
over 21 if you are drinking alcohol" allows people to trivially understand
modus tollens; framing the exact same problem more abstractly confuses a 
certain subset of students.


Conclusion
----------

TODO

[AS]: https://en.wikipedia.org/wiki/Attribute_substitution
