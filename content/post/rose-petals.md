---
title: "What Rose Petals Teach Us about Induction"
author: "Oran Looney"
date: 2026-06-20
publishdate: 2026-06-20
tags:
  - Databases
image: /post/rose-petals_files/lead.jpg
---

Petals Around the Rose is a deep, profound lesson about the philosophical 
problem of induction disguised as a simple dice game.

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

Conclusion
----------

Why is induction a wicked problem? Because there is no one right approach,
only approaches which fit a given data set. You might think you can cleverly
avoid this problem by simply trying every possible approach, but in many
ways that's the worst of all possible solutions: guaranteed to be slower
and struggles with multiple hypothesis testing. No, what's needed is *insight*
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
