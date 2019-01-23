---
title: 'ML From Scratch, Part 2: Logistic Regression'
author: Oran Looney
date: 2018-12-05
tags:
  - Python
  - Statistics
  - From Scratch
  - Machine Learning
image: /post/ml-from-scratch-part-2-logistic-regression_files/lead.jpg
draft: true
---

In this second second installment of the [machine learning from scratch[MLFS]
we switch the point of view from *regression* to *classification*: instead of
estimating a number, we will be trying to guess which of 2 possible classes a
given input belongs to. A classic example is looking at a photo and deciding if
its a [cat or a dog][COD]. 

In practice, its extremely common to need to decide between $k$ classes where
$k > 2$ but in this series we'll limit ourselves to just two classes - the
so-called binary classification problem - because generalizations to many
classes are usually both tedious and straight-forward.  In fact, even if the
algorithm doesn't naturally generalize beyond binary classification (looking at
you, [SVM][SVM]) there's a general strategy for turing any binary
classification algorithm into a multiclass classification algorithm called
[one-vs-all][OVA]. So we can safely set aside the complexities of the multiclass
problem and focus on binary classification for this series.

The binary classification is extremely central in machine learning and in this
series we'll be looking at no fewer than four different algorithms. In an
undergraduate machine learning class, you'd probably work through a few
algorithms that today only have historical or pedagogical value to dip your
toes in the water and get a feel for the binary classification problem: the
one-unit perceptron, linear discriminant analysis, and the winnow algorithm.
We will omit those and jump straight to the simplest classification that is
in widespread use: logistic regression. 

I say, "simplest," but most people don't think of LR as "simple." That's
because they're thinking of it use within the context of statistical analysis
and the analysis of experiments. In those contexts, there's a ton of associated
mathematical machinery that goes along with *validating* and *interpretting*
logistic regression models, and that stuff *is* complicated. A good book on
*that* side of logistic regression is [Applied Logistic Regression by Hosmer et
al.][ALR]. But within the context of machine learning, logistic regression is
an extremely simple predictive model: as we'll see, the heart of the algorithm
is only a few lines of code.

Nevertheless, it's important for two reasons. First, it can be suprisingly
effective. It's not uncommon for some state-of-the-art algorithm to
significantly contribute to global warming by running a hyperparameter grid
search over a cluster of GPU instances in the cloud, only to end up with a
final model with only marginally higher test set performance than the original.
This isn't always true: for example, LR tends to get only ~90% accuracy on the
MNIST handwritten digit classification problem, which is much lower than either
humans or deep learning. But in the many cases for which it *is* true, it's
worth asking if the problem is amenable to more advanced machine learning
techniques at all.

The second reason logistic regression is important is that it provides a
important conceptual foundation for neural networks and deep learning, which
we'll visit later in this series.





[ALR]: https://www.amazon.com/Applied-Logistic-Regression-David-Hosmer/dp/0470582472/
[SVM]: https://en.wikipedia.org/wiki/Support-vector_machine
[OVA]: http://mlwiki.org/index.php/One-vs-All_Classification
[COD]: https://www.kaggle.com/c/dogs-vs-cats
[MLFS]: /tags/from-scratch/
