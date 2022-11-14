---
title: "Eight Billion"
author: "Oran Looney"
date: 2022-11-11
image: /post/eight-billion_files/lead.jpg
---

Today is the last day when the number of people alive will start with a seven.
Sometime late Tuesday afternoon, or perhaps early Wednesday morning, the
population will cross the eight billion mark. No big deal, right?  You've
probably been mentally rounding up to eight billion for a while now. But when I
was a kid, the number they taught us in school was five billion. By the time I
was in college, it was up to six, and a decade ago it hit [seven][7BH]. 

Now it's
eight. Isn't this just a factoid, a little piece of trivia we have to keep
updating so we can win pub quizzes?

Sure, until we start to look at the big picture. Until we start to wonder where
all this is heading. Then we can see that we are in wildly unprecedented,
totally uncharted territory. 

<a href="https://www.worldometers.info/world-population/#pastfuture" target="_blank" title+"World Population Clock Chart">
  <img src="/post/eight-billion_files/population.png">
</a>

Here's a little piece of folk wisdom from my days as physics student: "If any
quantity changes by more than an order of magnitude, double check all your
approximations.  You're more than likely in a different regime." 

This usage of the word "regime" may be unfamiliar to you because as far as
I can tell its almost unique to physics, but you've almost certainly aware of the 
phenomenon.  For example, you've probably heard of the difference between [turbulent][TF] and
[laminar flow][LF].

<div style="width: 320px; padding: 0px; margin: auto;">
<video controls autoplay loop muted>
  <source src="/post/eight-billion_files/laminar_turbulent.mp4" type="video/mp4">
  <img src="/post/eight-billion_files/laminar_turbulent.png" title="Static Illustration of Turbulent vs. Laminar Flow.">
</video>
</div>

You can imagine regime shift as a slider. When we drag it to the left, a certain
effect like friction or the Coriolis force dominates, and we get a certain kind
of behavior. When we drag it to the right, the contribution of those effects
becomes very small compared to other effect like gravity or the weak nuclear
force and we get a completely different kind of behavior. We can study those
two regimes separately by making two different sets of simplifying assumptions.
So, even those both models are derived from the same set of universal equations,
they exhibit qualitatively different behavior. 

Examples abound. As a particularly extreme example, consider that both high
energy physics (splitting atoms or even protons in massive collider) and
condensed matter physics (freezing stuff to near absolute zero in Dewar flasks)
are both (in theory) derived from the same standard model, they couldn't be
more different in practice.

Or, to put it in plain English:

> "Building a four-foot tower requires a steady hand, a level surface, and 10
> undamaged beer cans. Building a 400 foot tower doesn't merely require 100
> times as many beer cans." - Steve McConnell

We can tell a similar story across a wide variety of problems. A human can run
about 8 miles per hour. To go from 8 mph to 80, you don't just "run harder."
You need to build an engine or jump off a cliff. To go from 80 to 800, you need
a jet and an airframe specifically designed to break the sound barrier. At
8,000 mph the physics of airflow go through *another* qualitative shift as we
enter the [hypersonic regime.][HR] Not only do you now need a [scramjet][SJ],
you also need to start seriously worrying about how your going to get rid of
all that heat. Each order of magnitude isn't just *harder*, it's completely and
qualitatively *different.* 

In his 1975 book [*Science Since Babylon*][SSB], [Derek de Solla][DS] observed
that the number of PhDs being issued was doubling roughly every 20 years. This
fact is often communicated with the vivid expression, "90% of all scientists
who have ever lived are alive today." 

All those scientists and engineers building stuff and figuring out stuff
causes a lot of churn. William Gibson, prophet of cyberpunk, said it best:

> In the whispering quiet of Heaven's night you imagine you can hear the
> paradigms shatter, shards of theory tinkling into brilliant dust as the
> lifework of some corporate think tank is reduced to the tersest historical
> footnote...
> <br>- William Gibson, *Hinterlands*

The first time I really felt this first-hand was working with JavaScript
frameworks circa 2010. It was a wild time. Entire frameworks would come into
existence, become *de facto* standards or best practices overnight, and be
considered outdated and untouchable a year or two later. Oh, you're still doing
server side HTML? Haven't you heard about XHR? It stands for XML HTTP Request
and it's the future. Of course, you would never pass XML; that's so last year.
(Yeah, that includes XHTML; we're moving forward with HTML5 because it turns
out getting developers to consistently close their tags *really* is hard.)
Everyone is passing JSON to REST APIs now. Actually, use jQuery to do it for
you. What, you're still using jQuery?  You gotta get up to speed with MVC
frames like AngularJS. They'll bind your data to HTML for you. Thank you for
being an earlier adopter of AngularJS 1.0; please transition your project to
AngularJS 2.0 where we've broken backwards compatibility every way we can think
of, plus a couple new ways we invented just for this project! Actually, let's
all just use React. (How about Vue? Oh, I'm fine; how are you?)  Of course,
you'd never actually write your own HTML/CSS; you'd use components and a CSS
framework like Bootstrap. But obviously component libraries are rigid and
inflexible and we should write our own "lightweight" HTML.  Don't forget to add
responsive design! And support Retina! And touch events. Gotta bend over
backwards to support IE6 - just kidding, it's all Chrome now. Don't use Python
on the server &mdash; use Node.js. Oh god NPM is so bad but never mind: gotta
move fast, break things. Don't use JavaScript &mdash; use CoffeeScript or
TypeScript. Actually, JavasScript is fine now. (Thanks ECMA!) Here's one way
package JavaScript into modules. Here's another, incompatible way. Maybe a
third-party library can help unify the two? Oh, actually now there are three
incompatible ways to package modules.

In those conditions, all you can do is get better at drinking from the fire
hose. This is when CI and CD really seemed to come into the mainstream. What
were once sophisticated engineering practices for elite teams because survival
tactics for everyone living through this maelstrom of change. 

This isn't an example of unbounded exponential growth due to a phenomenon
called the [demographic transition][DT]. As countries become wealthier and
more modernized their birth rate falls until it is close to or even below the
[replacement rate][RR]. We're actually past the inflection point and we can see
the population growth slowing down; the peak was around 1970. Current
projections show the population levelling off at around 11 billion, a number
which we will reach in about a century.

However, while we're not talking about exponential growth extending
indefinitely into the future, we are talking about a phase transition.

![Ecology Sigmoid Curve](/post/eight-billion_files/sigmoid.png)

I can't say this any more clearly or succulently, so I'll put it in a larger
font:

This is a different world. We're in a different regime now.  The demographic
has transitioned. The virtual constraints of the saddle point theorem aren't so
virtual anymore. We've hit all the inequality constraints for all the
resources. All the stopgap solutions relying on unsustainable resources have
been exploited; all the aces we had up our sleeves at the start of the game
have been played.  Earth with 10 billion people might as well be an entirely
different planet as Earth with 1 billion. 

Almost every piece advice you've ever read, every piece of wisdom or
philosophy, every cultural norm you've inherited, was produced in a different
world. A smaller world, a slower world, a less connected world. A world where
natural resources were essentially limited only by our capacity to extract
them. If two hundred years ago the walls were over the horizon and out of
sight, and a hundred years ago they were pleasantly off in the middle distance,
today they're filling the windshield and rushing at us at highway speeds.

This is not pessimism. The future is pretty bright overall: less war, more art,
better toys, etc. Just different. Very, very different.  Take every assumption
you have and subject it to criticism. Ask yourself, "does this idea still hold
in the modern world? Does it even make sense?"



[HR]: https://en.wikipedia.org/wiki/Hypersonic_speed
[SJ]: https://en.wikipedia.org/wiki/Scramjet
[SSB]: https://www.librarything.com/work/1749640
[DS]: https://en.wikipedia.org/wiki/Derek_J._de_Solla_Price
[DT]: https://en.wikipedia.org/wiki/Demographic_transition
[RR]: https://en.wikipedia.org/wiki/Total_fertility_rate#Replacement_rates
[7BH]: https://en.wikipedia.org/wiki/7_Billion_Humans
[TF]: https://physics.info/turbulence/
[LF]: https://en.wikipedia.org/wiki/Laminar_flow
