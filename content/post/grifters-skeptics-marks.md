---
title: "Grifters, Skeptics, and Marks"
author: "Oran Looney"
date: 2026-01-08
publishdate: 2026-01-08
tags:
  - Computer Science
  - Math
  - Python
  - Visualization
image: /post/grifters-skeptics-marks_files/lead.jpg
---


We’re in the golden age of grift. Where adventurers once flocked to California
and the Yukon because “there was gold in them thar hills,” the most exploitable
resource in 2026 are suckers. Great Grift Rush of ’06. “crime is legal now”,
smart money and retail investors. CAT bonds for retail investors, etc.

 

This is hardly the first time. The great depression brought with it a wave of
con artists, as portrayed in movies like Paper Moon (see lead photo above) or
The Sting. Mark Twain wrote of the innumerable swindlers and card sharps of his
day; he lost most of his own fortune investing in fraudulent schemes so
presumably he knew what he was talking about. When the conditions are right,
they seem to crawl out of the woodwork.

 

John Maynard Smith

[Evolution and The Theory of Games][ETG]

[ETG]: https://www.scribd.com/document/686059918/Evolution-and-the-Theory-of-Games-PDFDrive

![Book Cover](/post/grifters-skeptics-marks_files/etg_book_cover.jpg)



GSM Model
---------



| Player \ Opponent | Grifter                          | Skeptic                                  | Mark                                   |
|------------------|----------------------------------|-------------------------------------------|----------------------------------------|
| **Grifter**      | -grifter_loss                    | -grifter_loss                             | grift_gain                             |
| **Skeptic**      | -skeptic_cost                    | mutual_benefit - skeptic_cost             | mutual_benefit - skeptic_cost          |
| **Mark**         | -mark_loss                       | mutual_benefit                            | mutual_benefit                         |

TODO: justify constant cost



| Player \ Opponent | Grifter | Skeptic | Mark |
|------------------|---------|---------|------|
| **Grifter**      | -0.5    | -0.5    | 1.5  |
| **Skeptic**      | -0.2    | 0.8     | 0.8  |
| **Mark**         | -2.0    | 1.0     | 1.0  |


![GSM Simplex](/post/grifters-skeptics-marks_files/cannonical_gsm.png)

![GSM Time Series](/post/grifters-skeptics-marks_files/cannonical_gsm_ts.png)

![GSM High Skeptic Cost Simplex](/post/grifters-skeptics-marks_files/high_skeptic_cost_gsm.png)

![HDR Simplex](/post/grifters-skeptics-marks_files/hsr.png)



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

Compare to Hawks, Doves, and Retaliators, which leads to a fairly boring
equilibrium. Vigilante justice ultimately doesn't work. Due diligence does
work, but once there are sufficient consumer protections in place that you
are exceedingly unlikely to be scammed, everyone lowers their guard (or forgets
how to raise it at all) and soon the population is ripe for a new generation
of grifters. They do well for a while, until their very success leads to 
numerous copycats, which leads to a low-trust environment, which brings the
skeptics back... there's no way for the system to every truly stabilize.

Staying as a permanent skeptic has a higher payoff than any other permanent
strategy, but fixing a strategy is not optimal. The worst strategy is to do
whatever worked a dozen iterations ago, because by then the population mix has
evolved to exploit that. The theoretically best strategy is to be aware of the
current mix and switch just before its about to change. Note that such advanced,
memory based strategies are out-of-scope of this EGT model, and if they were 
possible we would have to include them as a separate population, which in turn
would change the dynamics, on so on ad infinitum. This is why human behavior
en masse is so hard to model: there isn't some "grifter" gene that fixes an
individuals behavior for life, but a rational decision based on innumerable
factors.





