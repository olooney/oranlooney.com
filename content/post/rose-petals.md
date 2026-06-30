---
title: "What Rose Petals Teach Us about Induction"
author: "Oran Looney"
date: 2026-06-20
publishdate: 2026-06-20
tags:
  - Philosophy
  - Machine Learning
  - LLM
  - Visualization
image: /post/rose-petals_files/lead.jpg
---

Richard Hamming famously asked his colleagues at Bell Labs the following
question: "What is the most important problem in your field, and why aren't you
working on it?" To which they probably replied, "Look, Dick, it's eight-thirty
in the morning. I haven't even had my coffee yet. Who starts a conversation
like that?"

For me, the answer to Hamming's challenge is obvious: "is there a general
method for induction?" Now, you might think that the human race has a pretty
good handle on induction, what with the scientific method and statistics and
all that. But no: there's a gap in the very foundation of our understanding
which we can only cross haphazardly and occasionally.

Hume called in the [problem of induction][POI]; a catchier name is the [No Free
Lunch theorem][NFL], although its about as far from being a "theorem" as its
possible to get. And it is simply this: there is no general, systematic way to
go from observation to understanding.

If you haven't encountered it, it's likely you don't see what the big deal is.
Don't we all do this all the time, without even thinking about it? We do, but
we don't know *how* we do it, which means we don't know how to teach it, how to
automate it, or if we're ever doing it right.

What's needed is a simple, concrete example which illustrates the idea without
any particular need for mathematical sophistication. I'm going to give just
such an example, show how various algorithmic approaches fair, and try to
explain the unavoidable tradeoff at the heart of the problem.

If all goes well, you'll not only understand something fundamental about one of
the most important unsolved problems out there, you'll have developed a
practical intuition that will help you understand, for example, why [François
Chollet][FC] introduced the [ARC-AGI benchmark][ARC], why AI researches keep
talking about [world models][WM], and what it means to say the [transformer
achitecture][TA] hits a sweet spot for language models.


The Game
--------

It starts with a game. This is a bit of nerd folklore, traditionally passed
down by a friend who knows the trick and judges you to be the right kind of
person to enjoy it, but I've replicated the experience as nearly as possible
here. You don't have to solve it, necessarily, but you do have to make an
honest effort if you are to fully grasp the underlying lesson.

<div class="require-js">
  <link rel="stylesheet" href="/demos/rose-petals/rose.css">
  <script>
    document.write('<div id="rose-petals-widget"></div>');

    import('/demos/rose-petals/widget.js')
      .then(module => module.loadRosePetalsWidget('#rose-petals-widget'))
      .catch(error => {
        console.error('Unable to load Rose Petals widget.', error);
        document.getElementById('rose-petals-widget').hidden = true;
      });
  </script>
</div>


Algorithmic Approaches
----------------------

The next step is to try to solve it, not with human intuition and
out-of-the-box thinking, but systematically and rigorously. To that end, I've
thrown the problem at a variety of machine learning algorithms. Some of them
solve it almost immediately, some struggle for a long time before noticing the
pattern, and some never solve it all. We'll go case-by-case to try to
understand why each approach faired well or badly, but first let's just take a
look at the high level results:

![Summary chart of different approaches](/post/rose-petals_files/summary_chart.png)


Here's how to read this chart. Various learning algorithms were gradually an
increasing number of examples of the game. Each example consists of the five
numbers for the five dice rolls as well as the correct number of petals around
the rose for those dice. Each algorithm does its best to learn a function which
maps the dice rolls to the number of petals. Then, its performance is evaluated
on a *different* set of examples, ones it hasn't seen before and wasn't trained
on. Whatever number the function outputs for a given dice roll is rounded to
the nearest integer and marked correct if it exactly matches the true number of
petals; if its off by even one it's marked incorrect. The test accuracy is the
proportion dice rolls that it gets correct.

(By the way, the full [source code][RPSC] and [summary report][RPSR] are
available on GitHub if you're interested in those details.)

Something very interesting is apparent in the shape of the curves. Each appears
to require a certain minimum number of examples before they start to learn
anything at all, but after that progress is extremely rapid and quickly
saturates at 100%. This is true across a wide variety of algorithms having very
different designs; the specific number of examples they need varies, but this
pattern holds true across them all. Perhaps this mirrors your own experience?

The key concept is [inductive bias][IB]. Models with an inductive bias that
matches the specific structure of the problem can learn quickly, sometimes from
just a handful of examples. Meanwhile, less specific, more general models with
a larger hypothesis space to explore need far more examples to convince
themselves that the patterns they're seeing are true.

The pattern is emerges is very clear: the more assumptions a model makes about
the shape of the problem, the less evidence it needs before it can settle on
the rule.


EDA
---

Before fitting anything, let's just *look* at the data. The right visualization
can make patterns obvious.

TODO: heatmap

![eda_heatmap.png](/post/rose-petals_files/eda_heatmap.png)

TODO: bubble chart

![eda_bubble_chart.png](/post/rose-petals_files/eda_bubble_chart.png)


Linear
------

An intentionally naive linear model serves as a baseline:

![naive_linear.png](/post/rose-petals_files/naive_linear.png)

This algorithm *cannot* solve the problem. It never will; its hypothesis space is
literally incapable of representing the true solution. 

We can make the 

One-hot features give the model a better vocabulary. Now it can treat each face
as a separate case, which is already much closer to the structure of the game.


![categorical_linear.png](/post/rose-petals_files/categorical_linear.png)



Neural Nets
-----------

Neural networks are often sold as a way to avoid feature engineering. Sometimes
that is true. Sometimes it just means asking a very flexible model to rediscover
the feature engineering for you.

![naive_nn.png](/post/rose-petals_files/naive_nn.png)

This is *after* we've gone through hyperparameter optimization.

The sigmoid activation works best for this problem, which is notable because
its not often the best choice for larger, deeper networks. However, it makes
it easy to construct step functions, so it wins here:

![nn_optuna_activation.png](/post/rose-petals_files/nn_optuna_activation.png)

There's a strong global minimum near 150 hidden neurons on the hidden layer:

![nn_optuna_hidden2.png](/post/rose-petals_files/nn_optuna_hidden2.png)

More capacity gives the model more room to maneuver, but also more room to get
lost.

Watch it struggle to understand the "unordered set" structure of the problem:

![fcnn_animation.gif](/post/rose-petals_files/fcnn_animation.gif)

We can see the model is learning, but its not learning it the way a human
would. Its not looking for rules, just building up and refining an intuition
for where it's "high" or "low."


Let's try DeepSet, which has a different inductive bias. The DeepSet
architecture bakes in the assumption that the order of the dice does not
matter.


![deepset_petals_architecture.png](/post/rose-petals_files/deepset_petals_architecture.png)

The code is almost embarassingly simple with pytorch:

```python
class DeepSetNN(nn.Module):
    def __init__(
        self, input_dim: int, phi_hidden_dim: int, phi_dim: int, rho_dim: int
    ) -> None:
        super().__init__()
        self.phi = nn.Sequential(
            nn.Linear(input_dim, phi_hidden_dim),
            nn.ReLU(),
            nn.Linear(phi_hidden_dim, phi_dim),
            nn.ReLU(),
        )
        self.rho = nn.Sequential(
            nn.Linear(phi_dim, rho_dim),
            nn.ReLU(),
            nn.Linear(rho_dim, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        phi_x = self.phi(x)
        sum_phi = phi_x.sum(dim=1)
        return self.rho(sum_phi)

```


Since this the case for the true rule, this inductive bias should help it learn
the pattern more quickly, and in fact the difference is night and day:

![deepset.png](/post/rose-petals_files/deepset.png)

The DeepSet model doesn't have to "relearn" the rule separately for each die
position; in fact, it's basically getting five independent "lessons" from each
example, allowing it to learn the rule perfectly from just six examples (a
total of 30 dice.)

However, the risk is high: suppose the true rule *hadn't* been position
independent? Then the DeepSet would have been completely unable to learn the
rule at all (just like the naive linear example we first looked at) no matter
how many examples it was shown.


Trees
-----

Compare the sharp, axis-aligned decision boundaries of decision trees to the
softer ones found by stacking sigmoids together:

![nn_vs_tree.png](/post/rose-petals_files/nn_vs_tree.png "Side-by-side 3D response surfaces of a neural network and a decision tree.")

Trees bring a different bias: they like discrete splits. That happens to be a
pretty good fit for dice, though not as direct as telling the model that dice
are an unordered set.

Observational Data
------------------

How much easier the problem would be if we could *choose* which dice to get an
answer for! We could set them to all 1, then all 2, and so forth and in 6
trials have a clear hypothesis for the true rule. A few dozen more experiments
to confirm the independence of position, and we'd know beyond a reasonable
doubt.

Instead, it's quite difficult to even remember all the random results we've
been shown so far.


Did They Really Solve It?
-------------------------

Imagine if you had figured out the rule, and then were shown this
generalization to twelve-sided dice. Such dice are dodecahedrons so have
pentagonal faces. 

![d12 showing five and six with pips](/post/rose-petals_files/pentagonal.png "Two pentagonal faces of a twelve-sided die, one displaying five pips and the other six.")

If you had learned the rule "n-1 but only for odd n" then you would get it
exactly wrong; but if you had listened to all the clues, and *really*
understood the rule, you'd answer immediately and confidently, even though you
are generalizing well outside anything in the original training set.

Hinton on World Models, François Chollet's ARC-AGI on visual learning, etc.



History of Language Models
--------------------------

* Markov
* RNN
* Transformer

TODO: "Next token predictor" is a shallow understanding; these are all "next
token predictors" but some of them work better than others.

A better question is to ask what it is that makes the transformer a good
model for language.

Markov chain was too broad - it could learn any pattern, so needed a needed
an infinite amount of data to learn anything. 

RNNs were too broad - by squeezing down all history and memory into a single
state vector, they simply did too much violence to the underlying meaning.

Transformers hit a sweet spot - by using recent history as a working memory,
and focusing in on different parts of that history at different times, they
are able to.


The Tragedy of Auto ML
----------------------

You might think you can cleverly avoid this problem by simply trying every
possible approach, but in many ways that's the worst of all possible solutions:
guaranteed to be slower and struggles with multiple hypothesis testing.

What auto ML tools actually do is make very easy learning problems
even easier. This is quite frankly not worth paying for.


Greek Philosophy
----------------

If we can't brute force it, what's left? The Greek's called it *Nous*
the minds capability to apprehend axioms. How do we do it? Nobody knows.

Aristotle called this faculty *nous*: our capacity to discover first principles.
Nous is not deduction, because deduction has to start from something.
It is not mere observation, a piling up of facts; it is the mechanism
that finds the pattern, that moves from the particular to the universal.

It's hard to define, but if you solved Petals Around the Rose then I 
don't *need* to define it for you: you experienced it yourself, first-hand.


Scientific Method
-----------------

TODO

Einstein had an inductive bias towards pure geometry. It's largely
the same bias which lead us towards string theory. It worked beautifully
for some problems, and then didn't work on others.

We have an algorithm, more or less: throw a thousand of the most
brilliant, most creative brains at the problem and hope one of them has
an idea. The process is spectacularly inefficient, and honestly a bit
cruel towards the grad students.

You can't linear your way out of an exponential problem. You're
standing at the bottom of a cliff and hoping to scale it by sending
in wave after wave of naive, optimistic grad students until you've
built a ramp out of their wasted lives? Good luck with that.


Arguments Against
-----------------

Emergent phenomenon such a entropy, turbulence, evolution, arise out of complex
systems and must be studied empirically. While there might be reason to believe
the fundamental laws of nature must in some sense be very simple, there's no
reason at all to believe that a complex emergent phenomenon would even need to
have any solution or explanation simpler than itself. 

Wolfram once posed the "Rule 30 Challenge:" find a way to predict the long term
behavior of a simple cellular automata without actually running the simulation.
He offered a $30,000 prize which has so far gone unclaimed; if such a simple
system can resist reduction, what are the implications for real-world
phenomena? How can there be any general method of finding the right rule if
there is no rule to find?

![Rule 30, illustrated](/post/rose-petals_files/rule_30.png "Visualization of the Rule 30 cellular automata. Each row is computed from the row above by a simple rule, yet it displays aperiodic patterns.")


Paul Feyerabend wrote a book called *Against Method*. He took a long, hard look
at the history of science as it was actually practiced and pointed out that
science didn't advance by any fixed, repeatable method; in fact, it is
precisely when we abandon all methodology and best practice that great leaps
forward occur. To be clear, he wasn't against rigor or careful thinking, but
against ossified, rigid methods, the kind that puts your brain on
autopilot&mdash;in other words, precisely the kind of cargo cult adherence to
prior art that tends to develop over time in any mature field. This suggests
that any attempt to pin down some kind of general method of induction isn't
just doomed: it's actively harmful.

Luckily for me, this is more of a theoretical possibility, because as of right
now we don't have the faintest clue how to do it. 

![Summary of current progress](/post/rose-petals_files/combing_the_desert.jpg "Two soldiers explain to their superior officer that they haven't found anything yet.")



Promising Avenues
-----------------

Actually, that's not quite true: we've learned quite a bit about induction in
the 400 years since Francis Bacon first took a stab at systematizing it.

Here are some subjects that seem to offer some insight into the problem:


**Machine Learning** - teaching machines to learn is teaching us a *lot* about
how learning itself works.

**Modern Statistics** - also chock full of insights, in particular about
endogeneity and causality. 

**Computer Science** - the difficulty of induction is intimately tied up with
computability - it all comes down to bounded rationality.

**Cognitive Psychology** - 

has developed instruments to isolate this kind of thinking, such as [Raven's
progressive matrices][RPM]:

![Raven's Progressive Matrices](/post/rose-petals_files/ravens_matrices.png "A 3x3 grid showing a typical example of Raven's progressive matrices.")

[Guilford's Alternate Uses Task][AUT] ("how many uses for a brick can you think of?")

[Remote Associates Test][RAT] (find connections between sets of words)

**Neuroscience** - For example, the "rostrolateral prefrontal cortex", a.k.a. [Brodmann area 10][BAT]:


![Brodmann area 10](/post/rose-petals_files/brodmann_area_10.png "A cytoarchitecture diagram of the brain with Brodmann area 10 highlighted.")

is an area of the brain is associated with high-level cognitive integration and
has been shown in fMRI studies to be active when solving problems like Raven's
progressive matrices. It is unusually large in humans compared to other
mammals.

It's not the "Nous-center" of the brain; that's not how brains work. But it
might play an important role, and its interesting that it's distinct from
spatial reasoning, memory, and language, suggesting that this kind of reasoning
is somehow distinct from those functions.

**Philosophy of Science** - has something to say about rejecting certain
classes of bad theories, and the [hypothetico-deductive method][HDM] in
particular gets at something important. But while it provides some good advice
on testing hypotheses and a few pitfalls to avoid, it doesn't have a lot to say
on finding good hypotheses in the first place.

For that, we're still stuck with Feyerbend's "anything goes" and Aristotle's
*nous*.


Conclusion
----------

*Why* is induction a wicked problem? *Why* is there no free lunch? I believe
its ultimately computational&mdash;the space of all possible hypotheses is
simply too large to brute force.  No, what's needed is *insight* to guide us
towards *reasonable* hypotheses. This is the part that's currently unsolved. 

You might think LLMs can do it, and they can, sort of, but no better than we
can, and *we* don't know how to do it efficiently yet.

Our best approach is the collection of heuristics and methods called "science,"
which you must have noticed is an almost unbelievable inefficient process.
Scientific progress is measured in *lifetimes* spent for the smallest insight.
It took us *thousands of years* to fit an ellipse through some points, or to
realize that washing our hands was important. There's got to be a better way. 

We already have so many pieces of the puzzle, so many good ideas. It's just
that no one has been able to put them together yet. Ironically, what's needed
is *nous*, that inductive leap to a single brilliant insight. I really think
someone will make a breakthrough in my lifetime. Maybe it will be you.


[IB]: https://en.wikipedia.org/wiki/Inductive_bias
[DRP]: /demos/rose-petals/
[RPSC]: https://github.com/olooney/rose-petals
[RPSR]: https://htmlpreview.github.io/?https://github.com/olooney/rose-petals/blob/main/docs/approaches/summary.html
[HDM]: https://en.wikipedia.org/wiki/Hypothetico-deductive_model
[BAT]: https://en.wikipedia.org/wiki/Brodmann_area_10
[POI]: https://en.wikipedia.org/wiki/Problem_of_induction
[NFL]: https://en.wikipedia.org/wiki/No_free_lunch_theorem
[FC]: https://en.wikipedia.org/wiki/Fran%C3%A7ois_Chollet
[ARC]: https://arcprize.org/arc-agi
[WM]: https://en.wikipedia.org/wiki/World_model_(artificial_intelligence)
[TA]: https://en.wikipedia.org/wiki/Transformer_(deep_learning)
[RPM]: https://en.wikipedia.org/wiki/Raven%27s_Progressive_Matrices
[AUT]: https://en.wikipedia.org/wiki/Guilford%27s_Alternate_Uses
[RAT]: https://en.wikipedia.org/wiki/Remote_Associates_Test
