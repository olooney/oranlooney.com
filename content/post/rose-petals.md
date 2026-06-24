---
title: "What Rose Petals Teach Us about Induction"
author: "Oran Looney"
date: 2026-06-20
publishdate: 2026-06-20
tags:
  - Databases
image: /post/rose-petals_files/lead.jpg
---

> What is the most important problem in your field, and why aren't you working on it?
> <br>&mdash;Richard Hamming

For me, the answer simple: "is there a general method for induction?" This
problem is really hard, and there are even some good reasons to believe the
answer is simply, "No," but I remain optimistic.

What's needed is a simple, concrete example which illustrates the idea without
any particular need for mathematical sophistication.

Petals Around the Rose is a deep, profound lesson about the philosophical 
problem of induction disguised as a simple dice game.

"No Free Lunch". 

If you have never heard of it before, you can experience it yourself below.
After that, we'll try tackling it with a few different algorithmic approaches,
and see if we can't glean any insight into the fundamental problem of induction
itself.


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

Spoilers ahead!

Overview
--------

[Source code][RPSC] and [summary report][RPSR] are available on GitHub. Summary chart:

![Summary chart of different approaches](/post/rose-petals_files/summary_chart.png)

The key concept is [inductive bias][IB]. Models with an inductive bias that
matches the specific structure of the problem can learn quickly, sometimes from
just a handful of examples. Meanwhile, less specific, more general models with
a larger hypothesis space to explore need far more examples to convince themselves
that the patterns they're seeing are true.

The summary makes the point in one picture: the more a model already "knows"
about the shape of the problem, the less evidence it needs before it can settle
on the rule.


EDA
---

Before fitting anything, it helps to look at the data directly. The rule is not
hidden in noise; it is sitting there in the symmetries of the dice.

![eda_heatmap.png](/post/rose-petals_files/eda_heatmap.png)

The heatmap is a blunt instrument, but even a blunt instrument can find the
handle if the problem is simple enough.

![eda_bubble_chart.png](/post/rose-petals_files/eda_bubble_chart.png)

The bubble plot tells the same story from another angle. Some die faces matter
in a way the others simply do not.


Linear
------

A plain linear model is the obvious first baseline. It is also a useful reminder
that obvious is not the same thing as appropriate.

![naive_linear.png](/post/rose-petals_files/naive_linear.png)

This model sees numbers, not dice faces. It can notice that five tends to matter
more than two, but it has no natural way to express "center pip" or "outer pip."

![categorical_linear.png](/post/rose-petals_files/categorical_linear.png)

One-hot features give the model a better vocabulary. Now it can treat each face
as a separate case, which is already much closer to the structure of the game.


Neural Nets
-----------

Neural networks are often sold as a way to avoid feature engineering. Sometimes
that is true. Sometimes it just means asking a very flexible model to rediscover
the feature engineering for you.

![naive_nn.png](/post/rose-petals_files/naive_nn.png)

This is *after* we've gone through hyperparameter optimization:

![nn_optuna_activation.png](/post/rose-petals_files/nn_optuna_activation.png)

Tuning changes the details of the failure mode, but not the basic fact that the
network is still searching a large space for a small rule.

![nn_optuna_batch_size.png](/post/rose-petals_files/nn_optuna_batch_size.png)

Some settings are less bad than others. That is not quite the same thing as
understanding the problem.

![nn_optuna_hidden2.png](/post/rose-petals_files/nn_optuna_hidden2.png)

More capacity gives the model more room to maneuver, but also more room to get
lost.

![nn_hp_3d.png](/post/rose-petals_files/nn_hp_3d.png)

See it struggle to understand the structure:

![fcnn_animation.gif](/post/rose-petals_files/fcnn_animation.gif)

The animation is a useful gut check. The model is learning something, but it is
not learning the thing in the way a human would describe it.

Let's try Deepset, which has the correct inductive bias:

![deepset_petals_architecture.png](/post/rose-petals_files/deepset_petals_architecture.png)

The DeepSet architecture builds in the assumption that the order of the dice
does not matter. That single assumption removes a great deal of irrelevant
complexity.

The difference is night and day:

![deepset.png](/post/rose-petals_files/deepset.png)

Once the model is allowed to think in sets, the rule becomes small again. It no
longer has to learn five separate copies of the same idea.


Trees
-----

Compare the sharp, axis-aligned decision boundaries of decision
trees to the softer ones found by stacking sigmoids together:

![nn_vs_tree.png](/post/rose-petals_files/nn_vs_tree.png)

Trees bring a different bias: they like discrete splits. That happens to be a
pretty good fit for dice, though not as direct as telling the model that dice
are an unordered set.

Notes on Observational Datasets vs. Controlled Experiments
----------------------------------------------------------

How much easier the problem would be if we could *choose* which dice
to get an answer for! We could set them to all 1, then all 2, and so forth
and in 6 trials have a clear hypothesis for the true rule. A few dozen
more experiments to confirm the independence of position, and we'd know
beyond a reasonable doubt.

Instead, it's quite difficult to even remember all the random results
we've been shown so far.


Did Any of These ML Methods Truly Solve It?
-------------------------------------------

Imagine if you had figured out the rule, and then were
shown this generalization to twelve-sided dice. These dice
are dodecahedron so have pentagonal faces. 

![d12 showing five and six with pips](/post/rose-petals_files/pentagonal.png)

If you had learned the rule "n-1 but only for odd n" then you
would get it exactly wrong; but if you had listened to all the clues,
and *really* understood the rule, you'd answer immediately and 
confidently, even though you are generalizing well outside anything in
the original training set.

Hinton on World Models,
François Chollet's ARC-AGI on visual learning, etc.



History of Language Models
--------------------------

* Markov
* RNN
* Transformer

TODO: "Next token predictor" is a shallow understanding; these 
are all "next token predictors" but some of them work better than others.

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

You might think you can cleverly
avoid this problem by simply trying every possible approach, but in many
ways that's the worst of all possible solutions: guaranteed to be slower
and struggles with multiple hypothesis testing.

What auto ML tools actually do is make very easy learning problems
even easier. This is quite frankly not worth paying for.


Nous
----

If we can't brute force it, what's left? The Greek's called it *Nous*
the minds capability to apprehend axioms. How do we do it? Nobody knows.


Einstein
--------

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


Arguments Against the Existence of Any Such Method
--------------------------------------------------

Emergent phenomenon such a entropy, turbulence, evolution, arise out
of complex systems and must be studied empirically. While there might
be reason to believe the fundamental laws of nature must in some sense
be very simple, there's no reason at all to believe that a complex emergent
phenomenon would even need to have any solution or explanation simpler than
itself. 


Also, Against Method, Paul Feyerabend



Promising Avenues
-----------------

* Machine Learning - it's teaching us a *lot* about induction
* Casual Statistics - also chock full of insights, in particular about endogeneity
* Computer Science - the difficulty of induction is intimately tied up with computability - it all comes down to bounded rationality.
* Philosophy of Science - the [hypothetico-deductive method][HDM]



Conclusion
----------

Why is induction a wicked problem? Because there is no one right approach,
only approaches which fit a given data set.  No, what's needed is *insight*
to guide us towards *reasonable* hypotheses, but this is the part that's
currently unsolved. You might think LLMs can do it, and they can, sort of,
but no better than we can, and *we* don't know how to do it efficiently 
yet. 

Our best approach is the collection of heuristics and methods called
"science," which you must have noticed is an almost unbelievable inefficient
process. Scientific progress is measured in *lifetimes* spent for the smallest
insight. It took us *thousands of years* to fit an ellipse through some
points, or to realize that washing our hands was important. There's got to be
a better way. 





[IB]: https://en.wikipedia.org/wiki/Inductive_bias
[DRP]: /demos/rose-petals/
[RPSC]: https://github.com/olooney/rose-petals
[RPSR]: https://htmlpreview.github.io/?https://github.com/olooney/rose-petals/blob/main/docs/approaches/summary.html
[HDM]: https://en.wikipedia.org/wiki/Hypothetico-deductive_model