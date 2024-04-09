---
title: "Angle Addition"
author: "Oran Looney"
date: 2024-04-08
publishdate: 2024-04-08
tags:
  - Math
  - Visualization
image: /post/angle-addition_files/lead.jpg
---

The geometric definition 

\\[
\begin{align}
\sin(\theta) &= \frac{\text{opposite}}{\text{hypotenuse}} \tag{1} \\\\\\\\
\cos(\theta) &= \frac{\text{adjacent}}{\text{hypotenuse}} \tag{2}
\end{align}
\\]

We set up the problem by simply stacking two right triangles
on top of each other.

<img src="/post/angle-addition_files/aa_01.png">

Let's define $\overline{AB}$ to have a length of 1. $\overline{AB}$ is hypotenuse of
the right triangle ABC. Since the hypotenuse is length 1,
the lengths of opposite and adjacent sides are simple $\sin(\beta)$ and $\cos(\beta)$ respectively.

<img src="/post/angle-addition_files/aa_02.png">

We can do the same thing for the triangle $\triangle ACD$ and angle $\alpha$ but with the
twist that hypotenuse of this triangle is no longer 1. Therefore, the lengths
of the opposite and adjacent sides have to each be multiplied by $\cos(\beta)$.

<img src="/post/angle-addition_files/aa_03.png">

Let's add another triangle to our diagram by extending $\overline{CD}$ out in a straight line
and drawing a perpendicular line through the point B. This gives us the 
triangle BCE. Since $\overline{BE}$ is perpendicular to EC it is in fact a right triangle.

Now, the line $\overline{EC}$ is perpendicular to $\overline{AB}$, and the line $\overline{BC}$ is perpendicular is $\overline{AC}$,
so the $\angle BCE$ is the same as the $\angle CAD$ which we called $\alpha$. 

A different way of seeing this is to note that because the angles of a triangle
sum up to $180^\circ$, the $\angle ACD$ is $180^\circ - \alpha - 90^\circ = 90^\circ - alpha$.
However the angles $\angle BCE$, $\angle BCA$, and $\angle ACD$ also add up to $180^\circ$. Since $\angle BCA$ is a right angle,
we have $\angle BCE + 90^\circ + (90^\circ - \alpha) = 180^\circ$ which simplifies to $\angle BCE = \alpha.$

Regardless of how we get there, we now now the hypotenuse and one angle of the right triangle $\triangle BCE$
so we can once again use the definitions to label the lengths of the opposite and adjacent sides.

<img src="/post/angle-addition_files/aa_04.png">

We'll do something similar for the last triangle. We'll draw a line perpendicular to $\overline{AD}$ through
$A$ and extend it up to point $F$ where it intersects the extension of $\overline{BE}$. $\overline{FE}$ and $\overline{AD}$ are parallel
(because they are both perpendicular to $\overline{AF}$) therefore $\angle FBA$ is equal to $\angle BAD$ which
is the sum of $\alpha$ and $\beta$. So we can label this angle $\alpha+\beta$. For the fourth
and final time, we'll use the definition of $\sin$ and $\cos$ to label opposite and adjacent
sides of the right triangle FAB. Note that this is where the expressions $\cos(\alpha + \beta)$
and $\sin(\alpha + \beta)$ enter the proof.

<img src="/post/angle-addition_files/aa_05.png">

So far, everything has been construction - adding triangles and chasing angles to label edge
lengths. But now that we've constructed this perfect little square, we can actually read both
angle addition formulas off the diagram. Note that FEAD forms a perfect rectangle; $\overline{FE}$ and $\overline{AD}$
are parallel which proves $\overline{AF}$ and $\overline{DE}$ are equal; likewise $\overline{AF}$ and $\overline{ED}$ are parallel, which proves
$\overline{FE}$ and $\overline{AD}$ are equal. 

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



