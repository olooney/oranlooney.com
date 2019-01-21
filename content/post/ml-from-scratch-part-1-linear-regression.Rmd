---
title: 'ML From Scratch, Part 1: Linear Regression'
author: Oran Looney
date: '2019-11-20'
slug: ml-from-scratch-part-1-lm
categories: []
tags:
  - Python
  - Statistics
  - From Scratch
  - Machine Learning
image: /post/ml-from-scratch-part-1-linear-regression_files/mark-basarab-158876-unsplash.png
draft: true
---

To kick off this series, will start with something simply yet foundational: linear regression via
[ordinary least squares][OLS].

[OLS]: https://en.wikipedia.org/wiki/Ordinary_least_squares

Wait! don't go yet! 

We're going to do it *right*, using [QR decomposition][QRD]. This is the same (or very 
close to the same) method your favorite statistical software uses under the hood, and its
quite a bit more interesting than the way its usually presented to first-time students.
Assuming you find linear algebra interesting, which I do, otherwise why would you be reading this?

Statistics
----------

(This section isn't strictly necessary, but it's always a good idea to motivate our algorithms with
statistical arguments whenever possible. Readers uninterested in the statistical foundations of
linear regression can simply skip to the next section.)

Let's start by posing the problem and deriving the so-called [normal equation.][NEQ] Let's say that $X_p$
is a random vector of length $M$ and $y_p$ is a scalar random variable. $X_p$ and $y_p$ are *not* independent,
but have a joint probability distribution $F(x, y; \Theta, \sigma)$ parameterized by a 
non-random parameter vector $\Theta_p$, a non-negative scalar $\sigma$, and a random error term $\epsilon \sim \mathcal{N}(0, \sigma^2)$.

$$ y_p = X_p \Theta_p + \epsilon $$

Then suppose we sample $N$ observations from this joint distribution. We place the $N$ observations
into a real-valued $N\times k$ matrix $X$ and a real-valued vector $y$. Just to be absolutely clear,
$X$ and $y$ are *not* random variables - they are the given data set we use to fit the model. We
can then ask, what is the likelihood of obtaining the realization $(X, y)$ from a parameter vector $\Theta$?
By rearranging our equation as $y_p - X_p\Theta = \epsilon ~ \mathcal{N}(0, \sigma^2)$ and using
the p.d.f. of the normal distribution, we can see that:

$$ L(\Theta|X,y) = \frac{1}{\sqrt{2\pi}\sigma} \prod_{i=1}^{N}\text{exp}\Big(\frac{-(y_i - X_i\Theta)^2}{2\sigma^2} \Big) $$
So, that looks pretty awful, but there are a couple things we can do to make it a look a *lot* simplier. First,
That constant term out front doesn't matter at all. We can also take that $e^{-2\sigma^2}$ outside the product
as $e^-{2N\sigma^2}$, and which we'll also stuff in the constant $C$ because we're only interested in $\Theta$ right now. Finally, we can take a log to get rid of the exponential and turn the product into a sum. All together, we
get the log-likelihood expression:

$$\log L(\Theta|X,y) = C - \sum_{i=1}^N -(y_i - X_i\Theta)^2 = C - ||y - X\Theta||^2$$
Now, because log is a monotonically increasing function, maximizing $l$ is the same as maximizing $L$. Therefore
our [maximum likelihood estimate][MLE] of $\Theta$ for a given data set $(X, y)$ is simply:

$$ \hat{\Theta} \triangleq \underset{\Theta}{\text{argmin}} ||y - X\Theta||^2 $$
So, if your eyes were glazing over from all the statistical nomenclature, I have some good news for you: we're
done with the statistics. Everything in this equation is a real-valued vector or matrix and there's not a
random variable or probability distribution in sight. What we did above was essentially a short sketch of the relevant parts of
the [Gauss-Markov theorem][GMT] which proves that the OLS solution *is* the MLE for the statistical model
we started with and it has a bunch of other nice properties that we won't concern ourselves with here.

Ordinary Least Squares
----------------------

Note: for this next section, we're going to be doing some fairly rapid vector calculus. I suggest
you reference [the matrix cookbook][TMC] if any of the notation or concepts aren't familiar.

[TMC]: https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf

Let's call the right-hand side (the part we're trying to minimize) $J$. Then we have:

$$ J = || y - X\Theta ||^2 $$

And the problem is to minimize J with respect to $\Theta$. As optimization problems go, this one is pretty 
easy: it's continous, quadradic, convex, everywhere differentiable, and unconstrained. Because of these
nice properties, we know that it has a unique global minimum, and that the gradient is zero at this minimum.

$$ \begin{split} \nabla_\Theta J & = \nabla_\Theta \; (y - X\Theta)^T(y - X\Theta) \\
& = \nabla_\Theta \; y^T y - (X\Theta)^T y - y^T X\Theta + \Theta^T (X^T X) \Theta \end{split}$$
   
It's obvious that $y^T y$ is constant with respect to $\Theta$ so the first term simply vanishes. 
It's less obvious but also true that the next two terms are equal to each other - 
remember that a J is a scalar,
so those terms are each scalar, and the transpose of a scalar is itself. The final term is a 
quadradic form, and the [general rule][QFG] is $ q \nabla x^T A x = \frac{1}{2}A^T x + \frac{1}{2}A x $
but because the product of a matrix with itself is always symetric ($X^T X = (X^T X)^T$) we can use
the simpler form $\nabla x^T A x = 2 A x$.

$$ \nabla_\Theta J = - 2 y^T X + 2 X^T X \Theta$$
Setting this equal to zero at $\hat{\Theta}$ we get:

$$ (X^T X) \hat{\Theta} = y^T X $$
The right hand side is a known vector, the left-hand side is a matrix times an unknown vector, so this
is just the familiar equation for solving for a particular solution to a system of equations $Ax = b$.

Because $X^T X$ is square, we *could* just left-multiply both sides by its inverse to get an explicit
closed form for $\hat{\Theta}$:

$$ \hat{\Theta} = (X^T X)^{-1} y^T X $$

However, it turns out there is a faster and more numerically stable way (although obviously theoretically
equivalent) of solving for $\hat{\Theta}$ which relies on the [QR Decomposition][QRD] of the matrix $X^T X$.

QR Decomposition
----------------

Since we're going to be implementing QR in a minute, it's worth making sure we understand how it works in
detail. A QR decomposition of a matrix square $A$ is a product of an orthogonal matrix $Q$ and an upper-triangular
matrix $R$ such that $A = QR$. Why is this beneficial? Well, it turns out that to invert an orthogonal matrix,
all you need to do is take its transpose. $Q^T Q = \mathbb{1} \leftrightarrow Q^T = Q^{-1}$. So if we found
$QR = X^T X$, we could write our equation for $\hat{\Theta}$ as

$$ QR \hat{\Theta} = y^T X $$
$$ R \hat{\Theta} = Q^T y^T X $$
But R is upper triangular, and the right hand-side reduces to a single column vector, so we can solve this by
back-substituion. Back-substitution is easiest to explain with an example.

$$
 \left[ {\begin{array}{cc}
   2 & 1 & 3 \\
   0 & 1 & 1 \\
   0 & 0 & 4 \\
  \end{array} } \right]
  
  \left[ {\begin{array}{cc}
   x_1 \\
   x_2 \\
   x_3 \\
  \end{array} } \right]
  =
  \left[ {\begin{array}{cc}
   2 \\
   2 \\
   8 \\
  \end{array} } \right]

$$
In this problem, the matrix is upper triangular. We start on the bottom row, which is simply an equation
$4x_3 = 8$, so $x_3 = 2$. The second row represents the equation $x_2 + x_3 =2$, but we already know $x_3$,
so we can substitute that back in to get $x_2 - 2 = 0$, so $x_2 = 0$. The top row is $2x_1 + x_2 + 3_x3 = 2x_1 + 6 = 2$, so $x_1 = -2$.

So we know know how to finish the problem once we have $QR = X^X$. But how to get $Q$ and $R$? There are two
parts to understanding the algorithm. First, note that the product of any two orthogonal matrices is itself
orthogonal. Also, the identity matrix is orthogonal. Therefore, if we have a
candidate decomposition $A = QR$ where $Q$ is orthogonal (but R may not yet be square), then for any orthogonal
matrix $S$ we have $A = Q I R = Q S^T S R = (Q S^T) (S R) = Q' R'$ where $Q' = Q S^T$ and $R' = S R$ is *also*
a candidate decomposition! This is the general strategy behind not just QR decomposition, but behind many other
decompositions in linear algebra. At each step we want to apply an orthogonal transformation to bring $A$ closer
to the desired form, while simultaneously keeping track of a matrix to undo all of the transformations. 

That sets the rules and the goal of the game: we can apply any sequence of orthogonal transforms to a (square,
non-singular) matrix $A$ that will bring it into upper triangular form. But is there such a sequence? And how would it be constructed? Suprisingly,this sequence always exist.

Householder Reflections
-----------------------

How would I make *just one column* of $A$ zero below the diagonal? Or even more concretely, how would I 
make just the *first column* of $A$ zero except for the first element? 

Let's take a look at the "column view" of our matrix. It looks like this:

\[
\begin{bmatrix}
    \vert & \vert & \vert \\
    a_1   & a_2 & a_3 \\
    \vert & \vert & \vert
\end{bmatrix}
\]

We want $a_1$ to be zero except for the first element. What does that *mean*? Let's call our basis
vectors $e_1 = [1\, 0\, 0]^T$, $e_2 = [0\, 1\, 0]^T$, $e_3 = [0\, 0\, 1]^T$. Every vector in our space is a
linear combination of these basis vectors. So what it means for $a_1$ to be zero except for the
first element is that $a_1$ is co-linear (in the same line) as 
$e_1$ in other words: $\exists \alpha \in \mathbb{R} | H a_i = \alpha e_i $

We're going to do this with an orthogonal transformation. But orthogonal transformations are *length preserving*.
That means $\alpha = ||a_1||$. So we now understand that we need to find an orthogonal matrix that sends
the vector $a_1$ to the vector $||a_1|| e_1$. Note that any two vectors lie in a plane. We could either
*rotate* by $\cos^{-1} \frac{a_1 \dot e_1}{||a_1||} $, the angle between the vectors, or we can *reflect*
across the line which bisects the two vectors in their plane. These two strategies are called the
[Givens rotation][GOR] and the [Householder reflection][HOR] respectively. The rotation matrix is slightly
less stable, so we will use the Householder reflection.

<a title="Bruguiea [CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0)], from Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Householder.svg"><img width="256" alt="Householder" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Householder.svg/256px-Householder.svg.png"></a>

Implementing QR Decomposition
-----------------------------

TODO

Implementing Linear Regression
------------------------------

TODO

Testing
-------

TODO


[GOR]: https://en.wikipedia.org/wiki/Givens_rotation
[HOR]: https://en.wikipedia.org/wiki/Householder_transformation
[QFG]: https://www.cs.ubc.ca/~schmidtm/Courses/340-F16/linearQuadraticGradients.pdf
[GMT]: https://en.wikipedia.org/wiki/Gauss%E2%80%93Markov_theorem
[MLE]: http://mathworld.wolfram.com/MaximumLikelihood.html
[NEQ]: http://mathworld.wolfram.com/NormalEquation.html
[QRD]: https://en.wikipedia.org/wiki/QR_decomposition
