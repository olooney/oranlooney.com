---
title: 'ML From Scratch, Part 0: Introduction'
author: "Oran Looney"
date: '2018-11-12'
slug: ml-from-scratch-part-0-introduction
tags:
  - Python
  - Statistics
  - From Scratch
  - Machine Learning
image: /post/ml-from-scratch-part-0-introduction_files/lead.jpg
draft: true
---

Motivation
----------

How do you know if you really understand something? You could just rely on the
subjective experience of *feeling* like you understand. This sounds plausible -
surely you yourself of all people should know, right? But it runs head-first
into in the (Dunning-Kruger effect)[DK]. A different criterion is found in this
pithy quote:

[DK]: https://en.wikipedia.org/wiki/Dunning%E2%80%93Kruger_effect
> "What I cannot create, I do not understand." - Richard Feynman

This is a very famous and popular quote, but there are various ways of
interpreting it, perhaps the most common interpretation could be paraphrased
as, "what I cannot explain to a layperson and a curious child, I do not
understand." Feynman unambiguously valued the ability to explain complex
physics in plain English, but I think the "cannot create" quote is talking
about something related but distinct. Feynman expands on this with this story
from his autobiography:

> "During the conference I was staying with my sister in Syracuse. I brought the
> paper home and said to her, "I can't understand these things that Lee and Yang
> are saying. It's all so complicated."
> 
> "No," she said, "what you mean is not that you can't understand it, but that
> you didn't invent it. You didn't figure it out your own way, from hearing the
> clue. What you should do is imagine you're a student again, and take this paper
> upstairs, read every line of it, and check the equations. Then you'll
> understand it very easily."
> 
> I took her advice, and checked through the whole thing, and found it to be very
> obvious and simple. I had been afraid to read it, thinking it was too
> difficult." - Richard Feynman, Surely You're Joking, Mr. Feynman!

So in the context of mathematics, "create" means something like "derive from first
principles by hand." This is a very strong criteria. If a person could go into
an empty office with a stack of scratch paper and supply of sharp pencils ,
write down all first principles of calculus from memory and
proceed to derive every important theorem
and result in calculus, then there is little doubt that that person thoroughly
understands calculus. 

In the context of computer science and programming, "create" might mean something
similar to be able to write a program from scratch that implements the given
algorithm. Since machine learning straddles the two, "create" means
both: pose a machine learning problem mathematically, reduce the problem
to some tracable form on paper, then write and implement an algorithm to
produce a numerical approximation of the answer. 

Now, if someone attempts this exercise, one of two things will happen. First,
they may succeed completely on their first try. If so, great! They've proved
what they set out to prove. But much more likely, they'll partially succeed and
get stuck on some point. Well, now they have the opportunity to correct a
deficiency in their own understanding that they weren't previously aware of,
which is also a great outcome. After all, Feynman didn't go in empty-handed -
he took the challenging paper with him, and surely referenced it often. But at
the end, his own notes would record his own complete derivation from start to
finish and therefore serve as a testimonial to his own understanding.

Ground Rules for the Project
----------------------------

It was in this spirit that I set myself a similar project in late 2018 on
the subject of machine learning. While I had strong mathematical fundamentals
from studying physics and math in college and graduate school, all of my
training in statistical modeling and machine learning has be on-the-job. I
certainly *felt* like I understood quite a bit - but did I really? 

Well, that's what we'll find out over the next series of blog posts. Before
we get started, though, I should define a scope and set some ground rules.

First, mathematical derivations are in scope. This usually means posing
and solving an optimization problem of some form, such as [MLE.][MLE] This
is straight-forward for most of the algorithms on my list, but could get a
little hairy for things like backpropagation (which requires some fairly
non-trivial matrix calculus) or SVMs (which basically requires the entire
theory of [Quadradic Programming][QP].) 

[MLE]: https://en.wikipedia.org/wiki/Maximum_likelihood_estimation
[QP]: https://en.wikipedia.org/wiki/Quadratic_programming

Second, the algorithm used with be state-of-the-art, or at least reasonably
so. For example, I will not use gradient descent to solve linear regression,
even though of course it would work. Instead, we'll do something closer
to what modern statistical software would do. This also means implementing
vectorized versions of the algorithms whenever possible. While looping
over every example in the training set is often easier to understand, it really 
isn't representative of of current best practice.

Third, I will implement and test all algorithms some data set. As the agile
crowd would say, working software is the primary measure of progress. For
convenience, I will use Python 3 and allow myself `numpy` arrays... but *not*
`numpy.linalg` or other canned libraries like `scipy.optimize`; matrix
multiplication is about the most complex operation we'll let the libraries do
for us. (I considered not using `numpy` at all, but it allows us to express
algorithms in vectorized notation.) This restriction only applies to the
implementation of the algorithm itself and excepts tests - I will routinely use
higher-level libraries (like `pandas`, `scipy`, or `sklearn.datasets`) when
*testing* the algorithm.


Project Scope
-------------

While I want to touch on every aspect of machine learning, there's
little point in implementing minor variations of basically the same
algorithms over and over. Instead, we'll pick one or two representative 
algorithms from each category and leave it at that. We want to make
sure that we get reasonable coverage over the types of ML *problems* (
supervised/unsupervised, regression/classification, etc.) as well as
good coverage over the most important *algorithms* that crop up repeatedly
in ML. 

Here's the short list of candidates:

|Problem|Model|Algorithm|
|:----------------------:|:---------------------:|:-----------------------------:|
|Regression|Linear Regression| [QR Decomposition][QRD] |
|Classification|Logistic Regression| [Gradient Descent][GD] |
|Classification|Neural Network| [Backpropagation][BPA] |
|Classification|Decision Tree| [Recursive Partition][RPA] |
|Clustering| [Gaussian Mixture Model][GMM] | [EM Algorithm][EMA] |
|Clustering|Hierarchical Clustering| [Agglomerative Clustering][ACA] |
|Dimension Reduction| [Principal Component Analysis][PCA] | [QR Algorithm][QRA] |
|Recommendation| [Low-Rank Matrix Approximation][LRA] | [Alternating Projections][APA] |
|Regression|General Additive Models| [Backfitting][BFA] |
|Classification|Support Vector Machines| [SMO Algorithm][SMO] |

[PCA]: https://en.wikipedia.org/wiki/Principal_component_analysis
[GMM]: https://en.wikipedia.org/wiki/Mixture_model#Multivariate_Gaussian_mixture_model

[GD]: https://en.wikipedia.org/wiki/Gradient_descent
[SMO]: https://en.wikipedia.org/wiki/Sequential_minimal_optimization
[QRA]: https://en.wikipedia.org/wiki/QR_algorithm
[ACA]: https://en.wikipedia.org/wiki/Hierarchical_clustering
[BFA]: https://en.wikipedia.org/wiki/Backfitting_algorithm
[EMA]: https://en.wikipedia.org/wiki/Expectation%E2%80%93maximization_algorithm
[RPA]: https://en.wikipedia.org/wiki/Recursive_partitioning
[BPA]: https://en.wikipedia.org/wiki/Backpropagation
[QRD]: https://en.wikipedia.org/wiki/QR_decomposition
[LRA]: https://en.wikipedia.org/wiki/Low-rank_approximation
[APA]: https://en.wikipedia.org/wiki/Low-rank_approximation#Alternating_projections_algorithm

Other candidates I considered but ultimately decided were out-of-scope for the
"ML From Scratch"series include:

* [Factor Analysis][FA] - We already have PCA for dimensional reduction and GMM as an example of using the EM algorithm to solve for latent random variables.
* Time Series Analysis with ARIMA - ARIMA is just linear regression under the hood so not a good fit for the "from scratch" project.
* K-Means - We'll do GMM instead.
* [K-Nearest Neighbors][KNN] - A naive algorithm is trivial while a serious algorithm would mostly be implementing a spatial index (such as [R-Trees][RT]) which takes us pretty far afield from learning algorithms.
* Ensemble models - e.g. Random Forest or Boosted Trees. Not a good fit for the "from scratch" approach and can best be understood as "composing" two or more other mature models.
* [CNN, RNN, etc.][NNZ] - We'll do the vanilla deep neural network from scratch but more advanced topologies are best explored with a framework with automated differentiation. 
* [Learning-to-Rank][LTR] - e.g. [Bradley-Terry-Luce][BTL], [Rasch model][RM], etc. These can generally be reduced to logistic regression or viewed as latent variable models and solved with the EM algorithm.
* Felligi-Sunter Record Linkage - another take on the EM algorithm.

The Basics
----------

In the spirit of the Feynman Technique, let's spend a few minutes talking
through the problem in plain English before we dive into the math.

The problem, in the broadest possible terms, is to get a computer to learn how
to do something.  This is unusual. Computers do not usually "learn" anything,
but follow a program written by a computer programmer. Computers also aren't
very good at "doing" most things, although they are good at the few things they
*can* do. 

So, what *are* computers good at? In decreasing order (increasing by the amount
of time it takes) computers can do the following:

1. Addition and subtraction      
2. Multiplication 
3. Division
4. Comparing two numbers to decide what to do next
5. Other math functions like `exp()`, `log()`, `sin()`, `cos()`, etc.
5. Remembering a billion numbers
6. Looking something up in a file or database
7. Talking to another computer over a network

Just looking at this table, we already reach a few conclusions:

1. Any "learning" that a computer does will have to be in the form of remembering a set of numbers.
2. The "doing" will work best if it is mostly additions and multiplications, with an occasional division or comparison.

Setting aside learning for a second, let's talk about representation. Let's say
we've "remembered" some numbers $a$, $b$, $c$, and $d$.  These numbers are
called our "parameters." How would we use this to do something? Let's say we
want to drive a car. We can "do" this by returning a number $y$ which
represents which direction we want to turn the wheel and how far. To make this
decision, we can use a LIDAR system to check for obstacles in three directions:
straight ahead, 30&#176; to the left, and 30&#176; to the right. Let's call
those $x_l$, $x_s$, and $x_r$. These numbers are zero or very low if it's clear
in that direction, and 1 or close to 1 if there's a close obstacle in that
direction. A 0.5 would represent an obstacle that's still some distance away.
How can we use the operations that computers are best at to get this computer
to make a decision about how to turn the wheel? One way would be to use a
linear equation:

$$ y = a x_l + b x_s + c x_s + d $$

Now, a human could come up with rules that would work passably. Say, if an
obstacle is to the left, steer right. If an obstacle is to the right, steer
left. If an obstacle is straight ahead, hard right. That would represent
parameters

$$ a=10 \; b=100 \; c=-10 \; d = 0 $$

This rule isn't terrible, but it would be better if we took a hard *left*
instead of a hard *right* when straight ahead was blocked but there was also
something to the right. How would we express that rule with just addition
and multiplication? One way would be to add a new term to our equation
(along with another parameter $e$) which was the *product* of $x_r$ and
$x_s$. This term will be large only when both $x_r$ AND $x_s$ are large.

$$ y = a x_l + b x_s + c x_s + d + e x_s x_r $$

Something fairly magical is starting to happen: our equation is starting
to model *logic*. Not every complicated logic yet, but it points the
way to much more complicated things.

But the idea is not to have a human come up with rules and "code" them as
parameters - the idea is to get the computer to figure out new parameters
for itself. But it can't do this in a vacuum. It's going to need some
kind of feedback which tells it if its getting closer. 

Essentially we play a game of Hot or Cold with the computer. At each step it
changes its parameters; We tell it it's now "warmer" or "colder" and how hot it
is in absolute terms. If it usually explores in the "warmer" direction and
keeps going until its found a "very hot" spot, it's very likely to be able to
win the game. If we define "hot" as getting a high reward of a large set
examples, then the parameters found at the final step substituted into
the equation for the kind of model we're using give us will give us a function
which gets pretty good performance at the task we trained it for.

Two basic approaches in machine learning are [supervised learning][SL]
and [reinforcement learning][RL]. The supervised learning approach is
equivalent to hiring a driving instructor to give advice in the form "in
situation X, do Y" and feedback in the form "you did $\hat{y}$ when you should
have done $y$!  That's great/OK/acceptable/terrible/catastrophic." The
reinforcement learning approach is letting the computer drive the car randomly,
crash a lot, and after each crash revisit the decisions in the seconds leading
up to the crash and ask, "what could have I have done differently?" 


Linear regression (the subject of today's article) is a very simple approach to
supervised learning. [OLS][OLS] is a particular algorithm that allows us to
quickly and precisely solve linear regression problems. There are other
algorithms that also solve the supervised learning algorithm but can learn more
complicated functions, and we'll be talking about several of these later in the
series.  We won't be talking about the reinforcement in this series, but that's
also a strong technique for many real-world problems.


[FA]: https://en.wikipedia.org/wiki/Factor_analysis
[LTR]: https://en.wikipedia.org/wiki/Learning_to_rank
[NNZ]: https://towardsdatascience.com/the-mostly-complete-chart-of-neural-networks-explained-3fb6f2367464
[BTL]: https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model
[IRT]: https://en.wikipedia.org/wiki/Item_response_theory
[RM]: https://en.wikipedia.org/wiki/Rasch_model
[KNN]: https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm
[RT]: https://en.wikipedia.org/wiki/R-tree


