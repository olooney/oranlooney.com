---
title: "The Angle Addition Formulas"
author: "Oran Looney"
date: 2024-04-08
publishdate: 2024-04-08
tags:
  - Math
  - Visualization
image: /post/angle-addition_files/lead.jpg
---

The usual way to do this is to start from the series or differential equation
definition and then use the unit circle to prove that $\sin$ and $\cos$ really
do have the geometric.

I never liked this because it's very much like pulling a rabbit out of a hat,
or perhaps more like pulling a "previously prepared" turkey out of the oven on
a cooking show. It gives students and completely backwards impression of how
mathematics is done: we don't start from intuitive definitions and work on them
until we can understand them more deeply or connect them to other structures;
no, we simply write down a bizarre and unmotivated equation and show it has the
desired properties, with no mention of how anyone thought it up in the first
place. This often leads to shorter, more elegant proofs but at the cost of
completely failing to teach the student how to actually "do" mathematics.

Look at this series definition: Why would anyone ever "start" from this
expression?

The differential equation definition is almost as bad.  We also have to rely on
the [ODE existence and uniqueness theorem][PLT] which is non-trivial to prove.

What would be nice would be to start from the intuitive, geometric definition
and derive the analytic definitions by working forward. I think I've found a
clear and unambiguous way to explain this at the undergraduate level. Briefly,
we'll prove the angle addition formulas using geometric methods, then show how
this leads immediately to the derivatives.

In this post, we're interested in establishing a foundation for $\sin$ and
$\cos$ from geometric principles, we have to establish some ground rules. It's
of crucial importance that you ignore everything you already know about these
functions. Yes, I know you can prove this stuff more easily from Euler's
formula. Yes, I know there a dozen of different ways to prove any of these. For
the moment, pretend like you don't know *anything* about $\sin$ and $\cos$
except the geometric definitions, and we won't use anything unless we've proved
it earlier. The structure of the proofs is as follows:

<img src="/post/angle-addition_files/proof_structure.png">

As the goal is to ground everything on the geometric definition in an
easy-to-follow way, jumping ahead and using theorems before we've established
that foundation defeats the purpose.


By far the most elegant and concise way to prove theorems about $sin$ and $cos$
is to use [Euler's formula][EF] $e^{ix} = \cos x + i \sin x$ but that has the
disadvantage of requiring a knowledge of complex analysis which is
pedagogically backwards. I think it makes more sense to follow the historical
development and start from purely geometric arguments, move on to algebra and
calculus, and only then show how the use of complex numbers makes the arguments
far more elegant. 


\\[
\begin{align}
\sin(\theta) &= \frac{\text{opposite}}{\text{hypotenuse}} \tag{1} \\\\\\\\
\cos(\theta) &= \frac{\text{adjacent}}{\text{hypotenuse}} \tag{2}
\end{align}
\\]

Notation
--------

In the first draft of this proof, I left points unlabeled and simply referred
to "the middle triangle" or the "right angle in the top triangle" and so on.
The idea was to keep things simple for a broad audience but I quickly found it
was very hard to follow. Instead, we'll use the conventional notation, which
I'll briefly review here.

We use upper case roman letters such as $A$ or $B$ to label points. The line
segment connecting two points is written $\overline{AB}$. The triangle with
vertices $A$, $B$, and $C$ is written $\triangle ABC$. Even though the notation
symbol shows an equilateral triangle, the triangle in question doesn't have to
be. I'll write "The right triangle $\triangle ABC$" if it's important to
specify that the triangle is a right triangle.

The above are all fairly self-explanatory, but the last bit of notation can be
confusing if you don't know exactly what it means. To describe the angle at $B$
between $\overline{AB}$ and $\overline{BC}$, we write $\angle ABC$. 

<img src="/post/angle-addition_files/angle.png">

$\angle ABC$ is always equal to $\angle CBA$, but $\angle BAC$ or $\angle ACB$
refer different angles located at a different part of the diagram. To locate an
angle $\angle ABC$ in the diagram, first look for the point labeled with the
middle letter $B$. Then imagine lines connecting $B$ to $A$ and $C$ - the angle
referred to is the angle between those lines. 

I know this notation takes some getting used to, but it allows us to
unambiguously refer to angles on a cluttered diagram.


Geometric Proof of Angle Addition Formulas
------------------------------------------

We set up the problem by simply stacking two right triangles
on top of each other.

<img src="/post/angle-addition_files/aa_01.png">

Let's define $\overline{AB}$ to have a length of 1. $\overline{AB}$ is
hypotenuse of the right triangle $\triangle ABC$. Since the hypotenuse is
length 1, the lengths of opposite and adjacent sides are simple $\sin(\beta)$
and $\cos(\beta)$ respectively.

<img src="/post/angle-addition_files/aa_02.png">

We can do the same thing for the triangle $\triangle ACD$ and angle $\alpha$
but with the twist that hypotenuse of this triangle is no longer 1. Therefore,
the lengths of the opposite and adjacent sides have to each be multiplied by
$\cos(\beta)$.

<img src="/post/angle-addition_files/aa_03.png">

Let's add another triangle to our diagram by extending $\overline{CD}$ out in a
straight line and drawing a perpendicular line through the point $B$. This
gives us the triangle BCE. Since $\overline{BE}$ is perpendicular to
$\overline{EC}$ it is in fact a right triangle.

Now, the line $\overline{EC}$ is perpendicular to $\overline{AB}$, and the line
$\overline{BC}$ is perpendicular is $\overline{AC}$, so the angle $\angle BCE$
is the same as the angle $\angle CAD$ which we called $\alpha$. 

Now that we know the hypotenuse and one angle of the right triangle $\triangle
BCE$ we can once again use the definitions of $\sin$ and $\cos$ to label the
lengths of the opposite and adjacent sides.

<img src="/post/angle-addition_files/aa_04.png">

We'll do something similar for the last triangle. We'll draw a line
perpendicular to $\overline{AD}$ through $A$ and extend it up to point $F$
where it intersects the extension of $\overline{BE}$. $\overline{FE}$ and
$\overline{AD}$ are parallel (because they are both perpendicular to
$\overline{AF}$) therefore $\angle FBA$ is equal to $\angle BAD$ which is the
sum of $\alpha$ and $\beta$. So we can label this angle $\alpha+\beta$. For the
fourth and final time, we'll use the definition of $\sin$ and $\cos$ to label
opposite and adjacent sides of the right triangle FAB. Note that this is where
the expressions $\cos(\alpha + \beta)$ and $\sin(\alpha + \beta)$ enter the
proof.

<img src="/post/angle-addition_files/aa_05.png">

So far, everything has been construction - adding triangles and chasing angles
to label edge lengths. But now the diagram is complete, and we can easily read
off the angle addition formulas by equating opposite sides.  Note that $FEAD$
forms a rectangle; $\overline{FE}$ and $\overline{AD}$ are parallel which
proves $\overline{AF}$ and $\overline{DE}$ are equal; likewise $\overline{AF}$
and $\overline{ED}$ are parallel, which proves $\overline{FE}$ and
$\overline{AD}$ are equal. 

\\[
\begin{align}
    \cos(\alpha+\beta) + \sin(\alpha) \sin(\beta) = \cos(\alpha) \cos(\beta) \tag{3} \\\\\\\\
    \sin(\alpha+\beta) = \sin(\alpha) \cos(\beta) +  \cos(\alpha) \sin(\beta) \tag{4}
\end{align}
\\]

We only need to rearrange these slightly to put them in the canonical form of the angle addition
formulas:

\\[
\begin{align}
    \cos(\alpha+\beta) &= \cos(\alpha) \cos(\beta) -  \sin(\alpha) \sin(\beta) \tag{5} \\\\\\\\
    \sin(\alpha+\beta) &= \sin(\alpha) \cos(\beta) +  \cos(\alpha) \sin(\beta) \tag{6}
\end{align}
\\]

Derivatives
-----------

How does the angle addition formula help? 

\\[
\begin{align}
    \frac{d}{dx} \sin(x) &= \lim_{h \to 0} \frac{\sin(x + h) - \sin(x)}{h} \\\\\\\\
\end{align}
\\]

\\[
\begin{align}
     &= \lim_{h \to 0} \frac{\sin(x)\cos(h) + \cos(x)\sin(h) - \sin(x)}{h}
\end{align}
\\]

By considering a triangle with hypotenuse 1 and a very small "opposite" side,
it's not hard to see geometrically that $\sin(x) \approx x$ and $\cos(h) = x$
when x is small, so we have:

\\[
\begin{align}
\frac{d}{dx} \sin(x) &= \lim_{h \to 0} \frac{\sin(x) + \cos(x) h - \sin(x)}{h}
\end{align}
\\]

\\[
\begin{align}
                     &= \lim_{h \to 0} \frac{\cos(x) h}{h}
\end{align}
\\]

\\[
\begin{align}
                     &= \cos(x)
\end{align}
\\]

The equivalent argument for $\cos(x)$ is:

\\[
\begin{align}
\frac{d}{dx} \cos(x) &= \lim_{h \to 0} \frac{\cos(x + h) - \cos(x)}{h}
\end{align}
\\]

\\[
\begin{align}
                     &= \lim_{h \to 0} \frac{\cos(x)\cos(h) - \sin(x)\sin(h) - \cos(x)}{h}
\end{align}
\\]

\\[
\begin{align}
                     &= \lim_{h \to 0} \frac{\cos(x) - \sin(x) h - \cos(x)}{h}
\end{align}
\\]

\\[
\begin{align}
                     &= \lim_{h \to 0} \frac{-\sin(x) h}{h}
\end{align}
\\]

\\[
\begin{align}
                     &= -\sin(x)
\end{align}
\\]


This motivates the differential equation definition of $\sin$ and $\cos$ as the
solutions to the initial value problem:

For $\cos(t)$:
\\[
\begin{align}
\frac{d^2y}{dt^2} &= -y \\\\\\\\
y(0) &= 1 ,&
y'(0) &= 0
\end{align}
\\]

and for $\sin(t)$:
\\[
\begin{align}
\frac{d^2y}{dt^2} &= -y \\\\\\\\
y(0) &= 0 ,&
y'(0) &= 1
\end{align}
\\]


Now that we know what the derivatives should be from geometric arguments we can
motivate the series definition via the Taylor series, and the differential
equation definition directly.


Pythagorean Theorem
-------------------

There are two other properties that we would like $\sin$ and $\cos$ to have as
well. First, we'd like them to trace out a unit circle; in other words, we want
to make sure that $\sin^2(\theta) + \cos^2(\theta)$ for all angles $\theta$.

There are lots of ways to prove this, but the angle addition formula provides
one of the neatest approaches. Instead of adding two seperate angles $\alpha$
and $\beta$, we'll use $\theta$ and $-\theta$. These two sum to zero so we
have:


\\[
\begin{align}
    1  &= cos(0) \\\\\\\\
       &= cos(\theta - \theta) \\\\\\\\
       &= \cos(\theta)\cos(-\theta) - \sin(\theta)\sin(-\theta) \\\\\\\\
       &= \cos(\theta)\cos(\theta) + \sin(\theta)\sin(\theta) \\\\\\\\
       &= \cos^2(\theta) + \sin^2(\theta)
\end{align}
\\]

Here, we additionally used the fact that $\cos$ and $\sin$ are even and odd
functions respectively, so $\cos(-x) = \cos(x)$ and $\sin(-x) = - \sin(x)$.

That means that the Pythagorean theorem is actually an immediate corrallary of
the angle addition formula - barely more than a special case, really.


Arc Length
----------

The above shows that $\sin$ and $\cos$ trace out a unit circle, but there is
one final thing we need to show to fully connect the geometric and analytic
definitions. 

The formula for arc length is:

\\[
L = \int_{a}^{b} \sqrt{\left(\frac{dx}{dt}\right)^2 + \left(\frac{dy}{dt}\right)^2} \, dt
\\]

Let's write down the equations for the unit circle in parametric form. Luckily,
we already worked out the first derivatives:
\\[
\begin{align}
    x(t) = \cos(t), & \frac{dx}{dt} = -\sin(t)
\end{align}    
\\]

\\[
\begin{align}
y(t) = \sin(t), & \frac{dx}{dt} = \cos(t)
\end{align}
\\]

Then, substituting these into the arc length formula:
\\[
L = \int_{0}^{\theta} \sqrt{(-\sin(t))^2 + (\cos(t))^2} \, dt
\\]

Simplifying inside the square root:
\\[
L = \int_{0}^{\theta} \sqrt{\sin^2(t) + \cos^2(t)} \, dt
\\]

Since we showed above that $\sin^2(t) + \cos^2(t) = 1$ for all $t$, this
further simplifies to:
\\[
L = \int_{0}^{\theta} 1 \, dt
\\]

Integrating from $0$ to $\theta$:
\\[
L = \left. t \right|_{0}^{\theta} = \theta - 0 = \theta
\\]

<!-- x_ -->

This tells us that the parameter $t$ we used is equal to the arc length along
the unit circle; in other words, the angle expressed in radians.

Conclusion
----------

We've shown that all of usual analytic definitions of $\sin$ and $\cos$ can be
derived from the geometric definition, and that this can be made elementary if
we start by proving the angle addition formulas using geometric arguments. The
geometric proof itself is quite beautiful and easy to remember as it is simply
a matter of stacking two triangles, building a rectangle around them, and
equating the opposing sides. We offer this as a more pedagogically sound and
historical accurate way to motivate the various analytic definitions of $\sin$
and $\cos$. 


[EF]: https://en.wikipedia.org/wiki/Euler%27s_formula
[PLT]: https://en.wikipedia.org/wiki/Picard%E2%80%93Lindel%C3%B6f_theorem
