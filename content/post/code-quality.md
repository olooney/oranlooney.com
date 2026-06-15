---
title: "The Code Quality Apocalypse Survival Guide"
author: "Oran Looney"
date: 2026-06-15
publishdate: 2026-06-15
tags:
  - Future
  - LLM
image: /post/code-quality_files/lead.jpg
---

Agents are going to take our jobs; agents are going to make us rich. Agents suck the joy out of programming;
agents make hacking fun again. Just give them a token budget and get out of their way; watch them like a 
hawk and keep them on rails for best results. There are a lot of conflicting views, a lot of soul searching,
a lot of vague metaphors. Here are some of my favorites:

* Agents are chainsaws. You can fell a tree in a fraction of the time, but you can also cut off your own leg.
And you still need to know *where* and *how* to cut; chainsaws can't think for you.
* Agents are junior developers. Fast, forgetful juniors straight off the street. They add bandwidth and velocity 
to a team, but left to their own devices they cause problems and create technical debt. It's your job to provide 
guidance and direction, so congratulations: you're a software engineering team lead now!
* Agents are the mischievous genies. They are good at granting the letter of your wish and utterly indifferent
to what you *meant* to ask for. Riches, power, and fame are all yours to be had... if only you can articulate
your heart's true desire precisely enough. If not... well, you can't say you hadn't been warned.
* Agents are the sorcerer's hat. To the apprentice, a source of endless, effortless power. Put it on, speak a
few magic words, and inanimate matter comes alive and starts working for you. Look where that got him. The 
master sorcerer knows that this power is to be wielded with utmost caution.

Like everyone, I've been trying to make sense of all this. In fact, I was asked at work to get involved
in a pilot project for agentic programming and give my opinion. The scope of the project was months, which
was interesting because most of the hot takes you see online are based on much smaller, "hello world!" or
weekend project level stuff. And, well, I did form an opinion. Several, in fact. I'd go so far as to
say that I developed <i>Opinions™</i>. Opinions about where all this is going, what it means for our 
industry, and for each of us individually.

The Argument
------------

In briefest outline, the argument is as follows. (Click to expand each section.)

- There is a code quality apocalypse coming.
    - That is to say, an age of unreliable, insecure, buggy, and brittle software.
    - The direct cause will be agentic coding.
        - Knowledge cutoff: agents default to outdated patterns even when better ones exist.
        - Context rot: agents struggle to understand large code bases as a whole.
        - Broken learning loop: neither humans nor agents accumulate deep expertise.
    - Industry-wide, it is inevitable.
        - Democratization will flood the field with people shipping production software for the first time.
        - The institutional knowledge that kept systems secure and reliable will evaporate without hands-on work.
        - Organization incentives will cause a race to the bottom.
    - Poor code quality will doom projects and reduce real and perceived value.
        - Complexity grows combinatorially; agents provide only a linear increase in velocity.
        - Higher velocity will not save you: you cannot linear your way out of a combinatorial problem.
        - Projects will be short-lived, quickly reaching legacy code status.
        - New projects will be started to replace them wholesale, which will then also fail for the same reasons.
        - Security, reliability, and usability failures will be the most visible and costly manifestations.
- It is not, however, inevitable for every developer, team, or project.
    - These problems are structurally identical to the problems historically caused by cowboy programmers.
        - Therefore, the same software engineering practices will also work for agentic programming.
        - It is possible to apply these practices to agentic coding.
    - Developers with engineering discipline will compound their advantage; those without will compound their problems.
    - Consequently, the industry will bifurcate into high and low skill work.
        - Developers offering short-lived, high-churn projects will be in high demand but even higher supply.
        - High supply will inevitably drive wages down in an endless race to the bottom.
        - Developers offering long-lived, reliable projects will be in less demand, but even lower supply.
        - This will drive wages up as companies compete for "talent," just as it did during the dot-com boom.
    - To stay in the high skill category will take discipline and foresight, but no more than any other profession.
- You *can* survive the coming code quality apocalypse.
    - View yourself as a team lead, not a typist.
    - Apply proven practices: code review, testing, observability, architectural discipline, merge discipline, etc.
    - Take real ownership of your codebase.
    - Continue to learn and invest in your own knowledge and skills as a long-term strategy.



Nothing New Under the Sun
-------------------------

There's nothing new about having someone else handle all the details of
curating a data set, performing the statistical analysis, and preparing a
report with nice visuals. It's called "being a PhD advisor." 

There's nothing new about having someone else write code for you while you try
to reconcile what the executives are asking for with the user's actual
workflows, draw high-level diagrams and dispense vague platitudes about keeping
things simple. It's called, "being a software architect."

The only thing that's new is that people who would otherwise have to put in
years of effort paying their dues down in the code mines are being forced into
that kind of high-level thinking from day one. If code construction isn't the
job, then what is?

There's a lot of tension around the concept of a manager who "used to code." In
the best-case scenario, they developed a deep sense for what the work involved,
what was important and what wasn't, that they've reflected on and abstracted
into a philosophy which helps guide how they run their team. In the worst case,
you can get managers who spent a couple years writing terrible code in obsolete
languages back in the 80s, and think nothing's changed in forty years. Somewhere
in the middle you have people who quickly realized they weren't actually very
good at coding and pivoted as soon as possible to something they could do better.

But the general lesson is that supervisors have to know the job in order to be
good supervisors. This isn't even specific to programming; as far as I know it
applies across all industries.

So, here's the problem in a nutshell. AI allows developers to skip the years of
actual coding and go straight to high-level software engineering. Which
necessarily puts them in the position of being a supervisor who doesn't know
the job very well. Unfortunately, the skills for this high-level work aren't
provided by a standard computer science degree; instead, developers are
expected to learn them on the job over a long apprenticeship. Many developers
never generalize, never move beyond code construction into thinking about
architecture, reliability, and project management. I know I certainly haven't
mastered those skills: I'm very much a "technical track" guy.

So if supervising agents calls for a qualitatively different set of skills than
the way programming is traditionally taught in school, how are developers
supposed to learn what they need to know? One answer is that you could just
read the software engineering literature and follow the advice there. In my
experience, however, it's not possible to even really understand the literature
without having hands-on professional experience on comparable projects. This
leads to ivory tower managers that can quote a lot of theoretical ideas but
don't have the counterbalancing weight of experience to keep them grounded.


The Tomato in the Fruit Salad
-----------------------------

One of the failure modes I observed on a recent project that leaned heavily
on agentic models was the difficulty of successfully merging code back into
main. One particular developer got himself in hot water by letting the LLMs 
go off on their own for *six days* without rebasing or merging, after which it
proved essentially impossible to re-integrate.

Having one developer go off and write a bunch of code which can't be merged
isn't a new problem. A first-year scrum master fresh out of an agile boot camp
can diagnose that. Having a subset of the team go off in different directions
and end up with competing code bases that take more time to integrate than the
original development is the kind of classic horror story Fred Brooks was
writing about in *[The Mythical Man-Month][MMM]* in 1975. TODO: of code without any
consideration for merge discipline. 

But the nature of the mistake didn't really have anything to do with LLM agents
at all. The LLM would have happily merged and rebased and done daily PRs to
keep everything in sync, *if it had been instructed to do so.* The mistake
really has nothing to do with LLMs or even programming: it's much more basic
than that, deeply rooted in the traditional social dynamics of software projects.
And those are the kinds of problems that LLMs absolutely do not help with.

We know why projects fail; as an industry we've been watching more than half of
all our projects fail for more than seven decades. And we've learned the root
cause is rarely that the devs literally just didn't know how to code. No,
failures are down to miscommunicated requirements, poorly planned timelines,
poor communication. You know, the hard stuff.

Crucially, projects don't fail because devs are dumb. Quite the contrary:
everyone reading this was probably once the smartest kid in their class. The
thing is, those developers that Brooks was writing about? The ones that made
all kinds of boneheaded project management and engineering mistakes? They were
really smart too. 

The reason is simple: intelligent people respond rationally to incentives and
are good at finding clever ways to meet those incentives. If they're being
incentivized to slam out code as quickly as possible without testing to meet a
deadline, if their "definition of done" is to show a demo, they'll focus on
that to the exclusion of all else. If the executives don't seem to care about
code quality, they'll ignore it too.

The problem is that the moment, and I mean the very nanosecond, the application
reaches production and is being used by real users, executive priorities do a
180. They no longer care about deadlines, but only care about bugs. All of
your heroics are instantly forgotten, and now you're just a guy who rushed a
buggy app into production and caused everybody all kinds of problems.

All experienced developers learn this lesson the hard way. The smart ones only
have to learn it once. It can't really be stated strongly enough or often
enough: it's the engineer's responsibility to *ship*. That means thinking ahead
to what a successful release looks like, and that in turn usually means pushing
back against non-technical stakeholders who don't have the experience or
visibility to see that far ahead.

A demo isn't supposed to be a dog and pony show. It's not supposed to be fake.
A TV chef can't show a recipe for roast chicken and then whip out a store-bought
rotisserie chicken to show as the final result: the implicit contract is that the
final product they show you was cooked with the exact same recipe you demonstrated.
The same is true for software demos: yes, the users are going to ooh and aah
over the visuals, but *only because they think it's real.* 

The famous ["black triangle" story][BT] illustrates what it means to show an honest
demo: yes, it's only one triangle, but it exercises the entire stack, proving
the underlying framework worked from top to bottom. If the team had simply shown
a PNG of a black triangle (or more aptly some pre-rendered graphic) that would
have said *nothing* about the state of the project or the capabilities of the team.
It would have *profoundly* misrepresented what they were doing to management
and stakeholders. It would have set themselves up for failure by setting false
expectations.

LLMs change some of the dynamics of coding, but they haven't changed this.
Using agents to do your coding is more like being a team lead than a
programmer. And where do team leads spend their time? What do they spend their
time thinking about? Supervising junior developers (or coding agents) is only a
small fraction of the job. Team leads need to think about the project at a 
higher level, thinking ahead, working on requirements and timelines, talking to
people&mdash;you know, the real reasons projects commonly fail.


In D&D terms, seeing a software development project through to a successful
conclusion is a wisdom check, not an intelligence check. Or rather, you have
to make an int check every day to make progress, but if you fail you can just
re-roll the next day. But at the end of the project you have to make one single
Wisdom check and if you fail, the entire project fails with no chance to re-roll.
Do you want to make that roll with advantage or disadvantage? 

[BT]: https://rampantgames.com/blog/?p=7745
[MMM]: https://en.wikipedia.org/wiki/The_Mythical_Man-Month



The Broken Learning Loop
------------------------

Apprenticeship, mentoring, and tribal knowledge: software teams live or die by
these. Any human who does a job for years on end naturally picks up a few
tricks, and developers (being generally quite bright) have an endless appetite
for detail, creating internal mental models of their languages, tools,
frameworks, and code base that would take a lifetime to write out... so of
course they never do.

Anyone who's worked on a process automation project (RPA) will know how much
tribal knowledge is passed down through oral tradition that never makes it into
any kind of official documentation; it's simply not possible to fully document
every edge case and judgment call, and most organizations accept this and
assign senior employees to mentor new hires.

Software developers become more familiar with the specific languages,
libraries, and patterns used in their current project. By constantly working
the bug queue, they gain an intuitive sense for what kinds of mistakes are
easiest to make, and a sense of which mistakes their end users care about
most. Industry rule of thumb is that it takes a junior developer roughly a year
to fully familiarize themselves with a given codebase.

The first approach people try is loading them up with massive amounts of
instructions in the form of system prompts.

High needle-in-a-haystack performance gives the impression that LLMs are fully
digesting huge context windows. This is very much not the case;
needle-in-a-haystack style tasks are ideally suited to the "dot product"
attention mechanism at the heart of the transformer architecture; just because
they can find matching content from a large context does not mean they can
effectively use all the context, especially if it includes all kinds of
conditional "if this then that" rules. In practice, performance at obeying
instructions starts to degrade fairly rapidly, so writing ever longer and more
detailed system prompts yields diminishing returns.

The modern approach of "skills" is promising precisely because it seeks to work
around this exact issue. Instead of always overloading the LLM with
instructions on every possible task, we divide up our instructions into topics
and let the LLM pull in instructions on a specific topic as needed. For
example, a Microsoft shop could provide a skill for PDFs that demonstrates how
to access Azure Document Intelligence correctly; without this skill, it might
equally well choose to generate code for AWS Textract or some other tool. Since
the skill's instructions are only loaded up when the LLM detects that it has a
task related to ingesting PDF documents, it doesn't clutter up the context
window.

This approach alleviates the pressure but does not entirely eliminate the
underlying problem, which is that there is a limit to the amount of guidance we
can provide to an LLM in a "one-shot" mode.

The other side of the problem is that agentic programming also reduces human
skill retention. Reading (or let's be honest here, briefly skimming) generated
code simply doesn't teach you as much as actually writing something yourself.
Retention will be very low, understanding vague and general.

Long after autopilots were invented, pilots continued to handle all take-offs
and landings manually. The rationale behind this is interesting. You might
think you could let the autopilot handle easy cases under standard conditions
and only have the pilot take over for more complex cases and adverse
conditions. The problem with this is that then the pilot *won't have enough
experience and skill to handle the difficult cases when they arise.* You can
only go so far with simulation training; it's vitally important that pilots get
plenty of real-world practice handling their aircraft during normal conditions.
The nature of human skill acquisition is such that once something is second
nature to us, we can use it in difficult situations outside of all previous
experience almost automatically.

The same basic lesson applies to human programmers and agentic programming.
It's all well and good to talk about "supervising," "guiding," or "instructing"
your agents, to briefly skim their output, but if you're not getting hands-on
keyboard time writing code yourself every single day, you won't just stop
learning, but start actively forgetting how to program. A couple of years from now,
your guidance and review won't be worth anything, and you'll have no idea how
to bail the LLM out when it gets into trouble; a couple of years after that,
and all your outdated opinions and knowledge will be actively harmful, like a
clueless middle manager who "used to code." All of which will lead you down the
gentle slope into letting the agents do all the coding for you. And after all,
why fight it? In the age of agentic programming, maybe hands-on-keyboard coding
just isn't a skill that's worth getting good at. Certainly the economic
incentives won't be there. In the last few decades a ton of people learned how
to program and entered the industry; now we'll see a reversal of that trend.
Ten years from now programmers will be either hobbyists, academic specialists,
or dinosaurs.


Regression to the Mean
----------------------

LLMs are broad but not deep. The text corpus used to train LLMs is basically
"the internet" as a whole, and when it comes to programming that means open
source code repositories such as GitHub, Q&A sites like Stack Overflow, and
endless tutorial blog posts. However, this corpus has a significant bias
towards smaller, self-contained projects and tutorials and guidance aimed at
beginners.

The average GitHub repository is not Django or Redis. It's a TODO app with
twelve commits last updated six years ago that was engineered to the exacting
standard of "works on my machine." 

High quality advice is often separated from code examples. The LLM may have
been trained on high quality textbooks like Elements of Statistical Learning, 
and if you specifically ask about best practices in empirical risk minimization
it will be able to refer back to them. However, the code samples it draws from
come from random Kaggle blog posts. TODO


The Knowledge Cutoff Problem
-----------------------------

Pydantic V2 was released in 2023, three years ago at the time of this writing,
but LLMs still frequently attempt to use the older, deprecated V1 methods. Even
when instructed to use V2, they frequently slip in one or two V1 constructs by
accident, which must then be fixed iteratively. This is a direct consequence of
how they are trained: a lot of the repos and blog posts they are relying on are
outdated and were written against V1, and it doesn't have a strong sense that
any particular Pydantic code example that it is training on is V1 or V2 because
that is left implicit in the original source text. How often this occurs is
strongly correlated with how advanced the work you're doing is; it does OK with
defining simple Pydantic models and fields, starts to make mistakes when you
use custom Fields or validators, and is more often confused than not when
working with advanced constructs like iterating over the metadata for all the
fields of a model. Not only are those deeper, more advanced features the aspect
of the library that changed the most from V1 to V2, it's also the one where it
has the fewest examples to learn from.

While vendors actively attempt to fight this knowledge cutoff problem by
training newer versions of LLMs on "fresh" facts such as recent news events,
the fact that it's still an issue after three years with a fairly popular
library like Pydantic shows how difficult the problem is. Libraries that make
major changes to their interface, such as the "runes" Svelte introduced in
version 5, are putting their developers into a difficult position. Developers
can use those features manually right away, disregarding LLM tooling, or try to
use some of their precious context to write instructions for dealing with the
new syntax, or can wait until the LLMs have had time to catch up. Developers
that rely entirely on so-called "vibe coding" might not even be aware that
their LLMs are generating code that targets an older, deprecated version of the
library.


Software Complexity
-------------------

Software engineers over the last sixty years have learned one huge lesson the
hard way: software complexity kills. One bad developer slamming out spaghetti
code as fast as he or she can type can, in a single year, build a system that
a team of ten good developers cannot maintain.

I don't see why there's any particular reason to believe that LLMs will be
exempt from this phenomenon. The problem at its heart has to do with the
growing n! possible interactions between all the components of a poorly
architected system. Even if an LLM can read and generate code 5x or 10x faster
than a human, you can't fight a combinatorial explosion in complexity by merely
being linearly faster.

In fact, everything I've seen so far puts the weight on the other end of the
scale. By making it possible to generate huge amounts of code from scratch in a
short period of time, they can (if unsupervised and unguided) generate a
tremendous amount of duplicate, poorly factored code.

The most pertinent fact about technical debt is that it takes a while to build
up. It's invisible in the first few months of the project, feels manageable for
the first year (it just feels like making small "interest payments" on the
debt), but after a year or two the technical debt reaches a point where it
dwarfs the basic cost of development: development velocity slows to a crawl,
seemingly trivial new features take months to add, and no significant new
features or major refactoring is even possible. In contrast, well-factored code
bases actually show *increased* development velocity in years two through five,
although every codebase will eventually age.


Security
--------

Security is very difficult to get right for any kind of codebase that has an
attack surface, such as a web application. A web application can appear to
function perfectly while containing authentication bugs or injection
vulnerabilities. 

Secure software development depends heavily on a kind of tribal knowledge
bordering on institutional paranoia. Organizations accumulate checklists, review
procedures, and threat models from previous incidents. Senior engineers know which
operations require extra scrutiny because they remember the outage or breach
from five years ago that established the rule in the first place.

TODO: Long term, AI red teaming will identify and patch security issues early.


Reliability
-----------

Here's a useful case study: GitHub experienced a significant outage in 2025
suspected to involve cascading failures. Word on the street was that this was
directly related to AI-assisted infrastructure changes and automation
interactions. 


Whether or not an LLM spat out the specific line of code that ended up causing
the problem is almost beside the point.

At a high level, what's really happening is simple:
 as code velocity increases, the
opportunity to accidentally create weird interactions increases too. 
Weird interactions lead to unpredictable behavior, which leads to production
issues. And not the kind of issues that can be fixed by bouncing the server:
we're talking about the kind of issues where the CEO wakes up the entire dev
team at 2 AM for a 48-hour code-a-thon to figure out what even happened, and
to repair the numerous cascading failures that it caused.

A human developer who spent three weeks carefully implementing a subsystem
usually develops some intuition about its failure modes. When stuff goes
wrong, even in a very weird way, they'll have a complete mental model of what's
happening and can usually diagnose it right away.

An engineer supervising five agents generating ten thousand lines of code
before lunch, on the other hand, will not. So the team will sit there pasting
log error messages and stack traces into an LLM while the company burns to the
ground.

The danger isn't that the code LLMs write is wrong; the danger is that nobody
fully understands why it works when it does, why it fails when it doesn't, or
how to fix it when it goes wrong.


A Period of Chaos
-----------------

Periods of rapid technological progress are chaotic.

Hindsight has the tendency to flatten the messy reality into neat narratives.
For the people stuck in the middle of it, the situation feels very different
before the winners have been crowned. Competing frameworks proliferate. Best
practices change every few months. Experts disagree publicly and with enormous
confidence. Entire camps of developers reorganize themselves around mutually
incompatible assumptions. Nobody really knows anything, everyone is confused;
the only difference is the extent to which individuals are self-aware, in
denial, or outright dishonest about this.

The JavaScript ecosystem spent a decade cycling through
successive waves of frameworks, packaging systems, build pipelines, state
management patterns, testing philosophies, and deployment models. Every year
brought a new raft of "best practices," usually outright contradicting last
year's consensus.

As someone who lived through that, the current LLM ecosystem feels very
similar. TODO Just when we seem to be getting a handle on things a newer,
larger model drops which invalidates half the conclusions people drew from the
previous benchmark cycle.

Other than moving to the mountains and living in a [ten-foot square hut][HJK]
it's hard to know what to do.

[HJK]: https://en.wikipedia.org/wiki/H%C5%8Dj%C5%8Dki


Nobody Ever Really Cared Anyway
-------------------------------

The good news is that no one ever really cared about code quality anyway. It
was essentially invisible to executives, who almost universally viewed it as
programmer excuses for not delivering faster. 

Software engineers pushed back, purely for their own sanity, and because they
knew they'd be the ones woken up at 2 am to debug some issue breaking the entire
app. 

So, as strange as it sounds, the industry's focus on code quality arose almost
accidentally, as an emergent outcome of the game played between engineers and
executives. Execs don't care about code quality, but they *do* care about
production failures, and they are smart enough to pay someone else and tell
them that they were *accountable* for production failures, and reasonable
enough to listen when those same people pushed back against crazy timelines or
unreasonable expectations.

We attained a kind of fragile equilibrium, purely by chance. LLM coding agents
*break* that equilibrium: they are the ultimate yes men, and will immediately
and joyously cave to any kind of pressure from above to "just get it done."

So, executives will get what they've always asked for: apps coded quickly. Of
course, just giving someone *exactly* what they ask for is often
indistinguishable from sabotage.


Why You *Should* Care Anyway
--------------------------

How does software die? I don't mean abandoned due to lack of interest, I mean
how does a good, useful code base reach a point where even the people who love
it have to leave it behind?

It happens gradually: the code base becomes more complex, less maintainable.

The code base becomes brittle:

<dl>
  <dt>brittle</dt>
  <dd>code where any change tends to break other things.</dd>
</dl>

More and more of it is basically *legacy code* that no one wants to touch.

<dl>
  <dt>legacy code</dt>
  <dd>any code that developers are afraid to change.</dd>
</dl>

Developers respond by wrapping legacy code in layers so they don't have to
touch the legacy code directly. This causes complexity to accumulate: what would
have been a single straightforward function in a brand new application is now a
stack of ten functions, each trying to leverage the lower layers but adding
defaults, business rules, overrides, adapters and other cruft.

<dl>
  <dt>cruft</dt>
  <dd>redundant, overly complex, dysfunctional code.</dd>
</dl>

As the code base becomes more complex, it becomes harder to change anything and
the project accumulates technical debt.

<dl>
  <dt>technical debt</dt>
  <dd>a metaphor used to emphasize the cost of short-sighted architectural
  decisions; we call it "debt" because we have to make "interest payments" in
  the form of increased maintenance costs until it is cleaned up.</dd>
</dl>

Small changes take forever; big changes essentially become impossible. Delivery
velocity drops below what anyone would consider acceptable. The code base is
put into maintenance mode: only essential bug fixes are made to keep the system
running, and no new development is even being attempted. Users learn to live
with the application in its current state, or move on to greener pastures.

Eventually there isn't enough interest to sustain even that, and the code base
is sunset.

Now, here is the crucial point you need to understand. This doesn't happen on a
fixed schedule: it happens faster or slower depending on code quality.

Just as a person who takes care of themselves can live a long and healthy life,
a code base with high code quality can continue to grow and deliver value for
five, ten, twenty years. In fact, "not leading to legacy code" is the unifying
principle behind all the disparate things that developers call clean code.

<dl>
  <dt>clean code</dt>
  <dd>code that is easy for humans to understand and modify without accidentally
  breaking things.</dd>
</dl>

On the flip side, projects that use the [big ball of mud architecture][BBM] and
have lots of code quality problems can reach legacy status in a matter of
months, not years.

![Product Life Cycle as a Function of Code Quality](/post/code-quality_files/lifecycle_plot.png)

So, why did I just recap software engineering 101? Because nothing about these
dynamics changes because of LLMs. They're at least as confused by messy code
bases as humans are, maybe even more so. They're equally susceptible to falling
into the trap of adding complexity to deal with existing complexity, causing
the exact same positive feedback loop that kills projects. It has nothing to do
with human vs. LLM, and everything to do with the very nature of complexity
itself.

You need to understand this: *You can't linear your way out of an exponential
problem.* The only approach that has ever worked is to cut it off at the head.


What Ancient Greek Philosophers Teach Us About Agentic Coding
-------------------------------------------------------------

Why did ancient Athenians study mathematics, and send their children to be
educated by sophists and philosophers? Even when you have slaves to do your
work, you still have to *understand* what's going on in order to make good
decisions. That's why learning mathematics is still valuable even if you don't
do any calculations yourself. Abe Lincoln studied Euclid's *Elements* as a
young lawyer. Euclid himself told King Ptolemy, "there's no royal road to
geometry." No one else can understand the world for you.

With agentic coding, a lot of the details of syntax and code construction don't
really matter. So what does matter? Architecture, design, domain modeling. This
stuff isn't any "softer" or less technical; just more theoretical. And "theoretical"
doesn't mean *easy*; just ask any physicist.

We should actually focus *more* on theory if we have LLMs to do our
coding. Think more about algorithmic complexity, data structures, architecture,
software patterns, project management, and less about the day-to-day details of
code construction and configuration.

Using LLMs to Increase Code Quality
-----------------------------------

Used intentionally, LLMs can be used to *increase* code quality. Here are a
few of the things I've found they're actually quite good at... if you bother
to ask them to do it:

* Correctness
    * Code Review
    * Type Annotations and Type Checking
    * Enforce Naming Conventions and Style Guides
    * Detect Security Flaws
    * Validate Config Files
    * Diagnosing and Fixing Valgrind Issues
    * Diagnosing and Fixing Profiling Issues
    * Ensure Consistent Logging
    * Adding I18N or ARIA Accessibility
* Translating Between Programming Languages or Frameworks
    * SQL <--> pandas <--> polars <--> spark
    * Python <--> TypeScript <--> Rust
    * SQLAlchemy <--> Django ORM <--> Prisma <--> LINQ
* Other Strong Use Cases:
    * Writing Regular Expressions
    * Generating Plots with Matplotlib and Similar Libraries
    * Writing LaTeX Equations
* Documentation
    * Keep Documentation in Sync with Code
    * Check Spelling and Grammar in:
        * Comments
        * Docstrings
        * String Literals
        * HTML Templates, etc.
    * Generate Architecture Diagrams
* Testing
    * Write Unit Tests
    * Write Fuzz Tests, Playwright Tests, etc.
    * Generate Synthetic Test Data


The general pattern is to put it into a loop with a test tool. It runs a tool like
`pytest` or `valgrind`, reviews the output, makes fixes for issues reported, and
runs it again until all issues are resolved.

Best practices for this stuff don't really change at all with LLMs. You still
have to remember to do them, but you don't have to do the drudge work yourself.
But it's *way* faster and easier to say, "Run cProfile on the load test script
and diagnose and fix any significant bottlenecks."


Congratulations, You're a Team Lead Now!
----------------------------------------

Coding with LLM Agents feels exactly like being a team lead:

* Write Jira Tickets
* Discuss Project Scope
* Coordinate Day-to-Day Work
* Review Code
* Set Architectural Direction
* Debug Weird Issues

On the other side of the equation, agent weaknesses are eerily familiar:

* Keeping up to date with recent library changes and versions
* Choosing and sticking to a single architecture or framework.
* Negotiating project scope.
* Sitting down and actually talking to business stakeholders.
* Premature optimization.
* Overengineering simple requirements.
* Getting lost down rabbit holes.
* Trouble understanding legacy code.
* Papering over real bugs with "defensive" programming.
* "Fixing" unit tests by having them not call real code.
* Not able to use interactive debuggers effectively.

Sure seems like a junior developer to me.

Therefore, almost all the project management best practices are still in play.


Code Velocity is Cursed
-----------------------

Increased velocity increases variance.

It's not a sprint *or* a marathon, it's an obstacle course. Sometimes you're
clicking along, writing code, testing it, checking it in, moving on to the next
ticket. Just burning down the sprint backlog. And then you hit some weird
configuration issue in a library you're using, nobody knows why or has ever
seen anything like it, and you've lost two days tracking it down. This is why
project timelines are so hard to estimate: these obstacles occur independently and
randomly in time, meaning the mean delivery time has a Poisson distribution. 
The Poisson distribution is right-skewed, meaning that it has a "fat" right-tail
where some extremely large values appear surprisingly often.

The higher code velocity with LLMs actually magnifies this effect. If a task
would normally take you two weeks, spending two days waiting on a helpdesk 
ticket isn't really visible at the project management level. But if you're
intending to vibe code the thing in a single afternoon, then that two-day delay
is now a *factor of five* multiplier to delivery time, which is *very* visible.

"Developer heroics are project management failures."

"You can't code your way out of a problem you project managed your way into."

How to Succeed
---------------

The people who are seeing success with these tools, people like [Simon
Willison][SW], are the people who are *already* capable of shipping software.
They already have the skill and knowledge needed to write production quality
code, pull requirements from actual stakeholders, and manage real-world
projects. Skills won from hard years down in the software trenches. So, when they
use agentic coding assistants, they just deliver faster. GPT and Claude are not
the worst entry-level dev they've had under them, not by a long shot; plus,
they're eager and willing and hard-working, which counts for a lot.

But maybe you're in a different boat. Maybe you're using agentic coding not
to accelerate your current work, but to do stuff you've never done before.
Nothing wrong with that; LLMs have a very broad knowledge base and are very
helpful when doing things outside one's own wheelhouse. An nginx config setting
here, an advanced database query there, dealing with a vendor's query DSL every
now and then, that kind of stuff. LLMs make us more [T-shaped][TS], which is a
good thing. But there's a risk when you start using LLMs to do core work in an
area outside your current expertise, and there's a right way and a wrong way
to manage that risk.

The risk is that the LLM will be a crutch, a layer that separates you from the
underlying logic. You'll generate terrible code, which is fine, because all
beginners do, but you *won't even know it,* because you never even look at the
code that has your name in the `git blame`. And because you don't read it,
you're not really learning. A month into the project you might not even know
which ORM you're using or why you chose it. 

On top of that, the agent isn't learning either! Current gen LLMs have serious
memory problems, problems that would get them a neurological diagnosis if they
were human. Every time you close that chat window, they forget you, they forget
your codebase. And every time you open a new chat window, they're looking at
your code as if this is the first time in their life they've ever seen it.
Leonard from [Memento][MF] has nothing on them. And like Leonard, we try to 
work around the issue by writing little notes to ourselves, with similarly
mixed results.

![Memento Tattoo](/post/code-quality_files/memento_tattoo.jpg)

All these little `AGENTS.md` or skills or other little documents and tricks
we use to try to give the LLM *some* kind of memory are a pale substitute for
the kind of deep familiarity a developer builds for their stack and code base
over the span of a few years. 

So if *you're* not learning, and the *agent* isn't learning, then who really
understands the code? The answer is no one. That's why I'd say that's the wrong
way to approach agentic programming.

The right way is to be more like a team lead: lean into the work and read each
line of code, develop expertise, provide guidance. Set your agentic coding
buddy up for success by clearing blockers and building a project structure
around it for the things it's *not* good at, things like QA testing, eliciting
requirements, and managing expectations. You know, just like team leads and
managers have done for their devs for decades.

Above all, demonstrate *ownership* of the code base, real engineering
ownership, like the engineer of record who signs off on a bridge. Learn and
follow software engineering and project management best practices. Learn also
from the LLM: ask it questions, read its code, invest in your own
understanding.


A Mantra
--------

Here is a mantra which has served me well when I find myself operating outside
my comfort zone and forced to learn some new skill in real time:

> "I don't know anything. In a year I'll be competent, in two I'll be an expert,
> but today I don't know anything. It will be a long time before I know how
> to do anything, and longer still until I know the right way to do it."

That might seem weirdly negative, but it's actually designed to avoid the most
common and dangerous pitfalls beginners make: jumping straight into having
opinions about the "right" ways to do things.

> "Some people will never learn anything, for this reason, because they
> understand everything too soon." <br>&mdash;Alexander Pope

It's OK to not know what you're doing! Just breathe, relax. Nobody expects you
to be an expert on day one. Just start, get moving, and pay attention to what
works and what doesn't. Reach out for advice and guidance.

There's nothing more ridiculous than claiming to be an expert in something that
didn't exist until two years ago and has changed completely every six months
since. That doesn't make me think you're a genius: it makes me think that your
bar for "expertise" is extremely low. We're all just trying stuff, throwing
spaghetti at the wall to see what sticks. It's good to *try* to make sense of
things, to come up with theses and test them, to introduce theories that reduce
complex evidence to elegant rules. All that work will pay off eventually. But
today, every conclusion is tentative, every pat simplification subject to
disruption, and nobody knows anything for certain. All we can do is to keep
an open mind and keep trying new things.


Forecast
--------

Code quality will drop like a rock for the next five years, which will manifest
itself as less reliable applications and more security issues.

Any democratization of a technology often creates a perceived drop in maturity, but
what's really happened is that with the gatekeepers gone a huge number of people
have entered the field. There are just as many experienced senior developers
developing high quality codebases as before; but now they represent 1% of the
coding population instead of 10%.

Longer term, the industry will adapt. New tooling, new methodologies, new
review processes, and new architectural conventions will emerge. Software
engineering has repeatedly reinvented itself in response to increases in scale
and complexity, and it will again:  as an industry we are uniquely well-situated
to reinvent our own tooling to meet new challenges.


Appendix A: Timeless Software Engineering Quotes
------------------------------------------------

Selections from my collection of [quotes][Q] that
are apropos agentic programming, with commentary.

> "It is a profoundly erroneous truism that we should cultivate the habit of
> thinking of what we are doing. The precise opposite is the case. Civilization
> advances by extending the number of important operations which we can perform
> without thinking about them."
> <br>&mdash;Alfred North Whitehead

and

> "It is unworthy of excellent men to lose hours like slaves in the labour of
> calculation which could safely be relegated to anyone else if machines were
> used."
> <br>&mdash;Gottfried Wilhelm Leibniz, 1685

At the most fundamental philosophical level, at the broadest possible
scale, despite the teething trouble, despite what we'll have to give up, 
agentic programming is still basically pushing in the right direction.

> "The most important single aspect of software development is to be clear about
> what you are trying to build."
> <br>&mdash;Bjarne Stroustrup

Agents can generate large amounts of activity, but they cannot compensate for unclear
objectives. Precise goals, constraints, and success criteria are essential.

> "The cardinal sin is to make a choice without knowing you are making one."
> <br>&mdash;Jonathan Shewchuk

When you over-rely on agents, you're committing this "cardinal sin" on an industrial scale.

> "Be careful that victories do not carry the seeds of future defeats."
> <br>&mdash;Ralph Stockman

Quick wins with agentic programming can lead to maintenance, security, or reliability problems later.
Watch them like a hawk and keep them on rails, especially in the early days of a project.

> Replicants are like any other machine&mdash;they're either a benefit or a hazard. If they're a benefit, it's not my problem.
> <br>&mdash;Rick Deckard

Agentic programming comes with pros and cons. Your job is to leverage the benefits and mitigate the hazards.
That requires having a very clear understanding of where they're strong and where they're weak.

> "We build our computer [systems] the way we build our cities: over time, without a plan, on top of ruins."
> <br>&mdash;Ellen Ullman

Truth be told, a lot of software engineering wisdom is aspirational, rather than achieved in practice.
Agents will generate a ton of poorly designed systems, but so do we. 

> "As a programmer, it's your job to put yourself out-of-business. What you can
> do today can be automated tomorrow."
> <br>&mdash;Douglas McIlroy

Or a similar idea in a more folksy idiom:

> "People don't want to buy a quarter-inch drill; they want a quarter-inch hole."
> <br>&mdash;Theodore Levitt

The goal was always to solve a problem, get to a solution; we use tools to get us there.

> "If you can't write it down in English, you can't code it."
> <br>&mdash;Peter Halpern

Ambiguous requirements remain problematic; work on your writing skills (which are
really just critical thinking skills.) That was worth doing before LLM agents;
now you have no excuse.

> "\[...\] but there is one quality that cannot be purchased that way - and that
> is reliability. The price of reliability is the pursuit of the utmost
> simplicity. It is a price which the very rich find most hard to pay."
> <br>&mdash;C.A.R. Hoare

Simplicity is stil the best path to reliability; agents don't change that dynamic.
But they do make it easy to generate endless complexity at the click of button.

> "Artificial Intelligence is not 'man versus machine.' It is 'man with machines'
> versus 'man without machines.'"
> <br>&mdash;Stephen Thaler

The most effective use of agents is typically collaborative rather than competitive. 
Any benchmark for "human" vs. "machine" is fundamentally flawed; the right comparison
is "human without assistance" vs. "human with assistance."

> "Trust, but verify."
> <br>&mdash;Russian Proverb

Formally verify with type checks, unit testing, etc., in an agentic loop, and
verify with human review by qualified developers at the end.

> "There are two ways of constructing software. One way is to make it so simple
> that there are obviously no deficiencies. The other is to make it so complex
> that there are no obvious deficiencies."
> <br>&mdash;C.A.R. Hoare

Agents default to the second mode. It takes engineering discipline to achieve the first.




[TS]: https://ceri.msu.edu/_assets/pdfs/t-shaped-pdfs/Primer-on-the-T-professional.pdf
[MF]: https://en.wikipedia.org/wiki/Memento_(film)
[SW]: https://simonwillison.net/
[BBM]: https://blog.codinghorror.com/the-big-ball-of-mud-and-other-architectural-disasters/

<div>
<link rel="stylesheet" href="/css/tree.css">
<script src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous"></script>
<script>
  $(".article > ul").eq(2).addClass("collapsible-tree");
</script>
<script src="/js/tree.js"></script>
</div>

