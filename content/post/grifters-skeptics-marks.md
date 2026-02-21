---
title: "Grifters, Skeptics, and Marks"
author: "Oran Looney"
date: 2026-01-24
publishdate: 2026-01-24
tags:
  - Computer Science
  - Math
  - Python
  - Visualization
image: /post/grifters-skeptics-marks_files/lead.jpg
---


We are in a golden age of grift. Where adventurers once flocked to California
or the Yukon because "there was gold in them thar hills," the best way to get
rich today is to fleece suckers. We've got crypto rug pulls, meme stocks, and a
seemingly endless stream of financial products engineered for nothing more than
plausible deniability. Things have gotten so bad that financial professionals
frequently joke, "[crime is legal now][PBCIL]."

This is hardly the first time. The Great Depression brought with it a wave of
con artists, as portrayed in movies like [*Paper Moon*][PM] or [*The
Sting*][TS]. A century earlier, Mark Twain wrote of the innumerable swindlers
and card sharps operating along the Mississippi river; indeed, Twain himself
lost most of his own fortune investing in [fraudulent investment schemes][MTI].
When the conditions are right, grifters seem to crawl out of the woodwork. This
WWI era comic is still relevant today, with influencers routinely shilling
products without declaring affiliation:

![Old Comic](/post/grifters-skeptics-marks_files/old_comic.jpg)

Nor is this a purely American phenomenon: Umberto Eco writes about the fairly
loose relationship the middle ages had with truth in books like *[The Prague Cemetery][TPC]*
or *[Baudolino][UEB]*.

[TPC]: https://en.wikipedia.org/wiki/The_Prague_Cemetery
[UEB]: https://en.wikipedia.org/wiki/Baudolino

![Baudolino Book Cover](/post/grifters-skeptics-marks_files/baudolino_book_cover.jpg)



Is this just the new normal? Is it just going to keep getting worse? Or is this
just the high watermark in a cycle as old as civilization? If it is cyclic, is
it driven by external circumstances such as war or poverty, or does the
oscillation arise naturally from the dynamics of system?

Such ivory tower questions have a pragmatic application: should we expect grift
and corruption to get worse, stay the same, or get better over the next decade?

The answer, I'd argue, lies in a moderately obscure mathematical theory from
the 1980s. 


Evolutionary Game Theory
------------------------

The version of game theory most people have seen is the rational-agent sort:
perfectly informed players maximize utility, best responses snap into place,
and equilibria have the clean finality of a solved puzzle. Evolutionary Game
Theory (EGT) is different. It assumes that all strategies exist in the
population and that success in games leads to reproductive success slowly
increases the relative proportion of that strategy in the population over time.
Strategies that earn higher payoffs become more common. Strategies that earn
lower payoffs decline.

This is the framework John Maynard Smith popularized in [*Evolution and the
Theory of Games*][ETG]. The book is now mostly read by specialists, but it
contains a small number of ideas that are so widely applicable that once you
see them, you start seeing them everywhere.

![Evolutionary Game Theory Book Cover](/post/grifters-skeptics-marks_files/etg_book_cover.jpg)

Note that triangle diagram on the cover of the book; we'll be revisiting that
visualization several times.

Source code available in the [Jupyter notebook][NB].


GSM Model
---------

We're going to try and model the prevalence of grifters with a EGT model with
three strategies, then use the mathematical tools Maynard developed to study
that model. While such a simplistic toy model won't even try to capture all
the nuances of the real-world, we can hope for qualitative insights. The three
strategies are:

- **Grifter**: attempts exploitation when possible.
- **Skeptic**: pays an ongoing cost to avoid being exploited.
- **Mark**: trusts by default; cooperates cheaply, but is vulnerable.

We can formalize these strategies within EGT by defining a payoff matrix:

| Players | Grifter                          | Skeptic                                  | Mark                                   |
|------------------|----------------------------------|-------------------------------------------|----------------------------------------|
| **Grifter**      | -grifter_loss                    | -grifter_loss                             | grift_gain                             |
| **Skeptic**      | -skeptic_cost                    | mutual_benefit - skeptic_cost             | mutual_benefit - skeptic_cost          |
| **Mark**         | -mark_loss                       | mutual_benefit                            | mutual_benefit                         |

When a Grifter meets another Grifter or a Skeptic, the scam fails. The Grifter
wastes time and effort and incurs a loss. But when a Grifter meets a Mark does
the strategy pay off: the Grifter successfully exploits the Mark and gains a
sizable reward.

A Skeptic never gets scammed, but pays a constant price for vigilance. When a
Skeptic meets anyone&mdash;Grifter, Skeptic, or Mark&mdash;they incur an
constant overhead cost, which represents costs investing in education and doing
due diligence. When interacting with honest counterparts (Skeptics or Marks),
they still achieve mutual cooperation, but still have to pay the cost for their
caution.

A Mark is trusting and unguarded. When a Mark meets another Mark, everything
goes smoothly: they cooperate without hesitation and both receive maximal payoffs.
Things go almost as well when they meet a Skeptic; after the Skeptic has done
their homework the two are able to cooperate without issue, and the Mark still
receives a maximal payoff.

It's only when a Mark encounters a Grifter that things go south. When that
happens, the Mark gets exploited and incurs a large loss.

The specific parameters don't affect the qualitative outcome much, but here are
some reasonable parameter values for concreteness:


<table>
  <thead>
    <tr>
      <th>parameter_name</th>
      <th>value</th>
      <th colspan="2">note</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>mutual_benefit</td>
      <td>1.0</td>
      <td colspan="2">mutual benefit of cooperation</td>
    </tr>
    <tr>
      <td>skeptic_cost</td>
      <td>0.2</td>
      <td colspan="2">overhead of being a skeptic</td>
    </tr>
    <tr>
      <td>grift_gain</td>
      <td>1.5</td>
      <td colspan="2">payoff for a Grifter exploiting a Mark</td>
    </tr>
    <tr>
      <td>mark_loss</td>
      <td>2.0</td>
      <td colspan="2">loss suffered by a Mark when exploited</td>
    </tr>
    <tr>
      <td>grifter_loss</td>
      <td>0.5</td>
      <td colspan="2">cost of a failed grift</td>
    </tr>
  </tbody>
</table>

With those parameters, the concrete payoff matrix is:

|  Players | Grifter | Skeptic | Mark |
|------------------|---------|---------|------|
| **Grifter**      | -0.5    | -0.5    | 1.5  |
| **Skeptic**      | -0.2    | 0.8     | 0.8  |
| **Mark**         | -2.0    | 1.0     | 1.0  |


Replicator Dynamics
-------------------

To turn payoffs into population dynamics, we use replicator equations: each
strategy grows (or shrinks) in proportion to how well it is doing relative to
the population average.

Here is the simple, discrete-time simulator I used:

```python
def replicator(populations, A, delta=0.05, N=2000):
    """
    Given an initial vector of `populations`, an payoff matrix `A`, a step size
    `delta`, and a number of iterations `N`, return the trajectory as a 2D
    numpy matrix and the final population as a 1D numpy array the same shape as
    the population.
    """
    # ensure populations is a normalized numpy vector
    populations = np.asarray(populations, float)
    populations = populations / populations.sum()

    # initialize the trajectory with the initial conditions
    trajectory = [populations.copy()]
    
    for _ in range(N):
        # payoff for this iteration
        fitness = A @ populations 

        # update population in direction of the most successful strategy
        average = populations @ fitness
        populations = populations + delta * (populations * (fitness - average))

        # avoid extinction and normalize
        populations = np.clip(populations, 1e-6, 1 + delta) 
        populations = populations / populations.sum()
        
        # track the full history of population trajectories
        trajectory.append(populations.copy())

    return np.array(trajectory), populations
```

This is not the only way to do it but works well enough for our purposes. Note
that the simulation returns the complete trajectory (history) of each
population over time: we are not searching for an optimal strategy; we are
watching what happens when strategies compete and the winners become more
common.

Results
-------

The state of a three-strategy population fits naturally on a simplex: a
triangle where each corner is a pure population (100% Grifter, 100% Skeptic,
100% Mark), and each interior point is a mixture. Several different trajectories
are shown as colored fields, each with different random initial conditions, and
a vector field showing the evolutionary pressure at each point is overlaid.

![GSM Simplex](/post/grifters-skeptics-marks_files/cannonical_gsm.png)

It's also instructive to look at the longitudinal view, ploting the three
populations as a time series:

![GSM Time Series](/post/grifters-skeptics-marks_files/cannonical_gsm_ts.png)

We can see the system does not settle down to a single equilibrium point but
instead falls into quasi-periodic cycles. This is the signature of
"non-transitive" games such as rock-paper-scissors; in such games trajectories
orbit rather than converge.

Our game is "non-transitive" because success is a function of the current
population mix, and that very success always leads to a different mix:

* Marks prosper when grifters are rare, because trust is efficient.
* Grifters prosper when marks are common, because exploitation is easy.
* Skeptics prosper when grifters are common, because vigilance pays for itself.


Discusses "asymmetric games with cyclical dynamics."

Non-transitive games (rock-paper-scissors game where every strategy can be beat by at least one other) always lead to these kinds of cyclical dynamics and do not converge to a single equilibrium point. 

Golden Age of Grift, "crime is legal now."

Evolutionary Game Theory, toy models, qualitative behavior.

Due diligence and education, I'm convinced this is a constant cost.

Non-transitive relationships causes the system to converge not a single point
but to an orbit. Not uncommon; many predator/prey ecological models also fall
into periodic orbits.

"Lilies of the valley" - Marks have a higher payoff in a high-trust environment
with fewer grifters. Trust is efficient and easy, so long as most people are
trustworthy.

Paper Moon.

Sensitive to parameters, other scenarios, like the cost of skepticism being
too high leads to extinction.

Hawks, Doves, and Retaliators
-----------------------------

A useful contrast is the classic Hawks/Doves/Retaliators story, which is often
used as a first EGT example because it is compact and behaves nicely: it tends
to settle to a stable equilibrium point.

![HDR Simplex](/post/grifters-skeptics-marks_files/hdr.png)

This point is called an [Evolutionarily stable strategy][ESS] (ESS). 

Why does HDR converge to an ESS while GSM does not? The Realiator strategy goes
extinct and stays extinct because it bears the full cost of policing Hawks
itself. In contrast, the Skeptic in GSM is not concerned with punishing
Grifters but simply avoiding them.


Cost of Skepticism
------------------

It is possible for the GSM model to collapse to an ESS equilibrium if
we make the constant cost of skepticism (which you'll remember represents the
overhead of eduction and conducting due diligence before deals) too high:

![GSM High Skeptic Cost Simplex](/post/grifters-skeptics-marks_files/high_skeptic_cost_gsm.png)

Such a model basically collapses to feudalism, with an underclass permanently
exploited by by an aristocracy, which is only limited in size by its frequent
destructive conflicts with itself.

However, as long as the cost of skepticism isn't prohibitive, it remains
a competitive strategy.

Conclusion
----------

The current generation of grifters is putting on a masterclass in spotting
con artists

lilies of the valley.

Does due diligence work? Private equity firms seem to think so.





<style>
  .article table tbody td {
    text-align: center;
    width: 25%;
  }
</style>


[PBCIL]: https://www.youtube.com/watch?v=UqWHiMBBNGM
[PM]: https://en.wikipedia.org/wiki/Paper_Moon_(film)
[TS]: https://en.wikipedia.org/wiki/The_Sting
[MTI]: https://time.com/4297572/mark-twain-bad-business/
[ETG]: https://www.scribd.com/document/686059918/Evolution-and-the-Theory-of-Games-PDFDrive
[NB]: /post/grifters-skeptics-marks_files/grifters-skeptics-marks.ipynb
[ESS]: https://en.wikipedia.org/wiki/Evolutionarily_stable_strategy


 

