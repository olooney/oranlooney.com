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

Agents are going to take our jobs; agents are going to make us rich. Agents
suck the joy out of programming; agents make hacking fun again. Just give them
a token budget and get out of their way; watch them like a hawk and keep them
on rails for best results. There are a lot of conflicting views, a lot of soul
searching, a lot of vague metaphors. Here are some of my favorites:

* Agents are chainsaws. You can fell a tree in a fraction of the time, but you can also cut off your own leg.
  And you still need to know *where* and *how* to cut; chainsaws can't think for you.
* Agents are junior developers. Fast, forgetful juniors straight off the street. They add bandwidth and velocity 
  to a team, but left to their own devices they cause problems and create technical debt. It's your job to provide 
  guidance and direction, so congratulations: you're a software engineering team lead now!
* Agents are the sorcerer's hat. To the apprentice, a source of endless, effortless power. Put it on, speak a
  few magic words, and inanimate matter comes alive and starts working for you. Look where that got him. The 
  master sorcerer knows that power is to be wielded with utmost caution.

Like everyone else, I've been trying to make sense of all this. Then, a couple
of months ago, I got involved in a project at work where one of the goals was
to form an opinion on agentic programming. The scope of the project was months,
which I thought was interesting because most of the hot takes you see online
are based on weekend project level stuff. And, well, I did form an opinion.
Several, in fact. I'd go so far as to say that I formed <span
class="shimmer">Opinions™</span>. Opinions about where all this is going, what
it means for our industry, and for each of us individually.

The core thesis of article is that the ideas of traditional software
engineering can be used to understand the impact of coding agents, because
those concepts were never really about human psychology specifically, but about
things like managing complexity or handling uncertainty. We need to understand
how agents are different of course, where they're stronger or weaker, but once
we do that we can use old frameworks to imagine what the software industry is
going to be like in a few years, and from there we can work out a strategy
for surviving it.


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
        - Developers who have real subject matter expertise will be able to lean into that.
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
180. They no longer care about deadlines; they only care about bugs. All of
your heroics are instantly forgotten, and now you're just the guy who rushed a
buggy app into production and caused everybody all kinds of problems.

All experienced developers learn this lesson the hard way. The smart ones only
have to learn it once. It can't really be stated strongly enough or often
enough: code only has value once it reaches production. That means thinking
ahead to what a successful release looks like, which in turn usually means
pushing back against non-technical stakeholders who aren't thinking that far
ahead.

A demo isn't supposed to be a dog and pony show. It's not supposed to be fake.
A TV chef can't show a recipe for roast chicken and then whip out a
store-bought rotisserie chicken to show as the final result: the implicit
contract is that the final product they show you was cooked with the exact same
recipe you demonstrated. The same is true for software demos: yes, the users
are going to ooh and aah over the visuals, but *only because they think it's
real.* 

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
conclusion is a wisdom check, not an intelligence check. Or rather, you have to
make an int check every day to make progress, but if you fail you can just
re-roll the next day. But at the end of the project you have to make one single
Wisdom check and if you fail, the entire project fails with no chance to
re-roll. Do you want to make that roll with advantage or disadvantage? 

[BT]: https://rampantgames.com/blog/?p=7745
[MMM]: https://en.wikipedia.org/wiki/The_Mythical_Man-Month



The Broken Learning Loop
------------------------

Apprenticeship, mentoring, and tribal knowledge: software teams live or die by
these. Anybody who does a job for a couple of years naturally picks up a few
tricks, and developers (being generally quite bright) have an endless appetite
for detail, creating internal mental models of their languages, tools,
frameworks, and code base that would take a lifetime to write out... so of
course they never do. Call it "tribal knowledge," passed down through oral
tradition alone.

Software developers become more familiar with the specific languages,
libraries, and patterns used in their current project. By constantly working
the bug queue, they gain an intuitive sense for what kinds of mistakes are
easiest to make, and a sense of which mistakes their end users care about
most. Industry rule of thumb is that it takes a junior developer roughly a year
to fully familiarize themselves with a given codebase.

How in the world are we supposed to translate that experience to agents? The
first approach people try is loading them up with massive amounts of
instructions in the form of system prompts.

High needle-in-a-haystack performance gives the impression that LLMs are fully
digesting huge context windows. This is very much not the case;
needle-in-a-haystack style tasks are ideally suited to the "dot product"
attention mechanism at the heart of the transformer architecture; just because
they can find matching content from a large context does not mean they can
effectively use all the context, especially if it includes all kinds of
conditional "if this then that" rules. In practice, performance at obeying
[instructions starts to degrade fairly rapidly][HMD], so writing ever longer and more
detailed system prompts yields diminishing returns.

The slightly more modern approach of "skills" is promising precisely because it
seeks to work around this exact issue. Instead of always overloading the LLM
with instructions on every possible task, we divide up our instructions into
topics and let the LLM pull in instructions on a specific topic as needed. For
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
Retention will be very low, understanding vague. There's a reason why you gotta
actually do the problems in the back of the textbook if you want to learn
anything.

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
learning, but start actively forgetting how to program. A couple of years from
now, your guidance and review won't be worth anything, and you'll have no idea
how to bail the LLM out when it gets into trouble. A couple of years after
that, and all your outdated opinions and knowledge will be actively harmful,
like a clueless middle manager who "used to code." All of which will lead you
down the gentle slope into letting the agents do all the coding for you. And
after all, why fight it? You'll think to yourself, maybe hands-on-keyboard
coding just isn't a skill that's worth getting good at. Certainly the economic
incentives won't be there. In the last few decades a ton of people learned how
to program and entered the industry; now we'll see a reversal of that trend.
Ten years from now programmers will be either hobbyists, academic specialists,
or dinosaurs.


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

The thing about technical debt that makes it so dangerous is that it builds up
slowly, invisibly, like emphysema. You don't even notice it for the first few
months of the project. Then it feels manageable for the first year (it just
feels like making small "interest payments" on the debt.) After that, it
reaches a point where it dwarfs the baseline cost of development: development
velocity slows to a crawl, seemingly trivial new features take months to add,
and significant new features no longer even seem possible, both to the
developers and the stakeholders. At this point, everyone is well aware things
have gone horribly wrong, but since its too late to fix it, they soldier on
through the mud.

In contrast, well-factored code bases actually show *increased* development
velocity in years two through five, although every codebase will eventually
age.

I don't see why there's any particular reason to believe that LLMs will be
exempt from this phenomenon. The problem at its heart has to do with the
growing $O(n^2)$ interactions between all the components of a poorly
architected system. Even if an LLM can read and generate code 5x or 10x faster
than a human, you can't fight a combinatorial explosion in complexity by merely
being linearly faster.

In fact, everything I've seen so far puts the weight on the other end of the
scale. By making it possible to generate huge amounts of code from scratch in a
short period of time, they can (if unsupervised and unguided) generate a
tremendous amount of duplicative, poorly factored code. They also tend to get
lost in larger code base&mdash;once the program no longer fits comfortably in
their context window, they have a lot of trouble remembering that they've
solved this problem somewhere else in the code base, or noticing that there are
now three different places doing the same thing, and tends to spit out
duplicate code. Worse, they tend to do things in wildly different ways each
time, for example pulling in a different PDF parsing library each time it comes
up, exploding the number of dependency.

I'm also fairly convinced that current-gen agents are heavily rewarded for
producing "hello world" level stand-alone programs during RLHF, and not for
generating well-factored or well-architected code. They can do that, if they
are explicitly instructed to again and again, but their tendency seems to be
hyperfocus on just the one task their working on. In other words, they let the
complexity of the codebase balloon without regard for its overall architecture,
and rack up technical debt like a teenager who just got handed their dad's
credit card.


Reliability
-----------

Here's a useful case study: GitHub experienced a significant outage in 2025
suspected to involve cascading failures. Word on the street was that this was
directly related to AI-assisted infrastructure changes and automation
interactions. 

Whether or not an LLM spat out the specific line of code that ended up causing
the problem is almost beside the point.

At a high level, what's really happening is simple: as code velocity increases,
the opportunity to accidentally create weird interactions increases too. Weird
interactions lead to unpredictable behavior, which leads to production issues.
And not the kind of issues that can be fixed by bouncing the server: we're
talking about the kind of issues where the CEO wakes up the entire dev team at
2 AM for a 48-hour code-a-thon to figure out what even happened, and to repair
the numerous cascading failures that it caused.

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
The code base becomes brittle; more and more of it is basically *legacy code*
that no one wants to touch.

Developers respond by wrapping legacy code in layers so they don't have to
touch the legacy code directly. This causes complexity to accumulate: what would
have been a single straightforward function in a brand new application is now a
stack of ten functions, each trying to leverage the lower layers but adding
defaults, business rules, overrides, adapters and other cruft.

Small changes take forever; large changes essentially become impossible.
Delivery velocity drops below what anyone would consider acceptable. The code
base is put into maintenance mode: only essential bug fixes are made to keep
the system running, and no new development is even being attempted. Users learn
to live with the application in its current state, or move on to greener
pastures.

Eventually there isn't enough interest to sustain even that, and the project
is sunset.

Now, here is the crucial point you: while in some sense inevitable, it doesn't
happen on a fixed schedule: it happens faster for some projects than others.
And the thing that determines that, the thing that really sets the useful life
of a software project, is code quality. 

Just as a person who takes care of themselves can live a long and healthy life,
a code base with high code quality can continue to grow and deliver value for
five, ten, twenty years. In fact, "not leading to legacy code" is the unifying
principle behind all the disparate things that developers call "quality."

![Product Life Cycle as a Function of Code Quality](/post/code-quality_files/lifecycle_plot.png)

So, why did I just recap software engineering 101? Because nothing about these
dynamics changes because of LLMs. They're at least as confused by messy code
bases as humans are, maybe even more so. They're equally susceptible to falling
into the trap of adding complexity to deal with existing complexity, causing
the exact same positive feedback loop that kills projects. It has nothing to do
with human vs. LLM, and everything to do with the very nature of complexity
itself.

You need to understand this: *You can't linear your way out of an quadratic
problem.* The only approach that has ever worked is to cut it off at the head.


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

This is kind of a subtle point, but its worth wrapping your head around because
its going to have a huge impact on the way software development "feels" in the
coming years: increased velocity increases variance. The faster the code
delivery, the more turbulent the flow.

A good way to understand this intuitively is to realize that programming is not
a sprint *or* a marathon, it's an obstacle course. Sometimes you're clicking
along, writing code, testing it, checking it in, moving on to the next ticket.
Just burning down the sprint backlog. And then you hit some weird configuration
issue in a library you're using, nobody knows why or has ever seen anything
like it, and you've lost two days tracking it down. This is why project
timelines are so hard to estimate: these obstacles occur independently and
randomly in time, meaning the mean delivery time has a Poisson distribution.
The Poisson distribution is right-skewed, meaning that it has a "fat"
right-tail where some extremely large values appear surprisingly often.

The higher code velocity with LLMs magnifies this effect. If a task would
normally take you two weeks, spending two days waiting on a helpdesk ticket
isn't really visible at the project management level. But if you're intending
to vibe code the thing in a single afternoon, then that two-day delay is now a
*factor of five* multiplier to delivery time, which is *very* visible.

This variance bubbles it way up and becomes visible to project managers, and 
then to stakeholders. Ideally we would just educate them to be comfortable with
the uncertain nature of software development, to put down their schedules and
calendars and just let the features flow out at their natural pace, whatever
that happens to be... but agile methodologists have been trying to get stakeholders
to wrap their head around that for decades, with mixed success.

This particular aspect of software projects is going to get much, much more
painful as agents set ever higher expectations for velocity and consequently
expose stakeholders to ever increasing variance and timeline uncertainty. 


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

The other class of people who will benefit from coding agents are subject
matter experts: scientists, engineers, quants, etc., who do a little coding as
part of their work but who's main skillset is actually something completely
outside of programming. People who have specific, real-world problems they work
on, for whom software is just a means to an end, not an all consuming vocation.
Such people are sitting in the catbird seat: perfectly poised to get value out
of coding agents but still possessing unique, specialized knowledge that agents
don't have because it simply doesn't exist in any digestible form in any
publicly available text corpus.

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





[TS]: https://ceri.msu.edu/_assets/pdfs/t-shaped-pdfs/Primer-on-the-T-professional.pdf
[MF]: https://en.wikipedia.org/wiki/Memento_(film)
[SW]: https://simonwillison.net/
[BBM]: https://blog.codinghorror.com/the-big-ball-of-mud-and-other-architectural-disasters/
[HMD]: https://news.ycombinator.com/item?id=49096969


<div>
<link rel="stylesheet" href="/css/tree.css">
<script src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous"></script>
<script>
  $(".article > ul").eq(2).addClass("collapsible-tree");
</script>
<script src="/js/tree.js"></script>
</div>

