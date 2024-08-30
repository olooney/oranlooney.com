+++
title = "Quotes"
date = "2022-11-11"
+++

<style>
    .search-container {
        margin-top: 20px;
        width: 100%;
        max-width: 600px;
        margin-left: 0;
    }
    .search-form-control {
        width: 100%;
        padding: 10px;
        margin-bottom: 20px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
</style>

<div class="search-container">
    <input type="text" id="searchInput" onkeyup="filterQuotes()" placeholder="Search quotes..." class="search-form-control">
</div>
<div id="search-no-results" style="display: none">No matching quotes to display</div>

<script>
    function filterQuotes() {
        var input = document.getElementById("searchInput");
        var searchTerms = input.value.toUpperCase().split(/\s+/);
        var quotes = document.getElementsByTagName("p");
        var headers = document.querySelectorAll("h2, h3");
        var noResults = document.getElementById("search-no-results");

        // Filter quotes
        Array.from(quotes).forEach(quote => {
            var quoteText = (quote.textContent || quote.innerText).toUpperCase();
            var allMatch = searchTerms.every(term => quoteText.includes(term));
            quote.style.display = allMatch ? "" : "none";
        });

         // Filter headers
        Array.from(headers).forEach(header => {
            var nextSibling = header.nextElementSibling;
            var hideHeader = true;
            if (header.tagName === "H2") {
                while (nextSibling && nextSibling.tagName !== "H2") {
                    if (nextSibling.tagName === "H3") {
                        nextSibling = nextSibling.nextElementSibling;
                        continue;
                    }
                    if (nextSibling.style.display !== "none") {
                        hideHeader = false;
                        break;
                    }
                    nextSibling = nextSibling.nextElementSibling;
                }
            } else if (header.tagName === "H3") {
                while (nextSibling && nextSibling.tagName !== "H3" && nextSibling.tagName !== "H2") {
                    if (nextSibling.style.display !== "none") {
                        hideHeader = false;
                        break;
                    }
                    nextSibling = nextSibling.nextElementSibling;
                }
            }
            header.style.display = hideHeader ? "none" : "";
        });

        // display the "no results" message as needed
        var anyVisible = Array.from(quotes).some(quote => quote.style.display !== "none");
        noResults.style.display = anyVisible ? "none" : "";
    }
</script>


## Programming

### Writing Code

"A procedure should fit on a page."
<br>&mdash;David Tribble 


"When in doubt, use brute force."
<br>&mdash;Ken Thompson


"The only three numbers a programmer should ever care about are zero, one, and infinity."
<br>&mdash;Willem van der Poel


"The most important single aspect of software development is to be clear about
what you are trying to build."
<br>&mdash;Bjarne Stroustrup


"The cardinal sin is to make a choice without knowing you are making one."
<br>&mdash;Jonathan Shewchuk


"The cost of adding a feature isn't just the time it takes to code it. The cost
also includes the addition of an obstacle to future expansion... the trick is
to pick features that don't fight each other."
<br>&mdash;John Carmack


"The road to programming hell is paved with global variables." 
<br>&mdash;Steve McConnell


"The psychological profiling [of a programmer] is mostly the ability to shift
levels of abstraction, from low level to high level. To see something in the
small and to see something in the large."
<br>&mdash;Donald Knuth


"The whole point of getting things done is knowing what to leave undone."
<br>&mdash;Oswald Chambers


"Be careful that victories do not carry the seeds of future defeats."
<br>&mdash;Ralph Stockman


"Make it work, make it right, make it fast."
<br>&mdash;Kent Beck


### Process

"If it's your decision, it's design; if not, it's a requirement."
<br>&mdash;Alistair Cockburn


"Building a four-foot tower requires a steady hand, a level surface, and 10
undamaged beer cans. Building a 400 foot tower doesn't merely require 100 times
as many beer cans."
<br>&mdash;Steve McConnell


"If we'd asked the customers what they wanted, they would have said, 'faster
horses.'"
<br>&mdash;Henry Ford


"No one has ever found a bug in a piece of vaporware."
<br>&mdash;Anonymous


"Amateurs talk strategy and professionals talk logistics."
<br>&mdash;General Omar Bradley


"A program is a poem: you cannot write a poem without writing it. Yet people
talk about programming as if it were a production process and measure
'programmer productivity' in terms of 'number of lines of code produced.' In
doing so they book that number on the wrong side of the ledger: We should
always refer to 'the number of lines of code spent.'"
<br>&mdash;Edsger Dijkstra


"As a programmer, it's your job to put yourself out-of-business. What you can
do today can be automated tomorrow."
<br>&mdash;Douglas McIlroy


"Measuring programming progress by lines of code is like measuring aircraft
building progress by weight."
<br>&mdash;Bill Gates


"If you can't write it down in English, you can't code it."
<br>&mdash;Peter Halpern


"Without requirements or design, programming is the art of adding bugs to an
empty text file."
<br>&mdash;Louis Srygley


"A specification, design, procedure, or test plan that will not fit on one page
of 8.5-by-11 inch paper cannot be understood."
<br>&mdash;Mark Ardis 


"The first 90 percent of the code accounts for the first 90 percent of the
development time. The remaining 10 percent of the code accounts for the other
90 percent of the development time."
<br>&mdash;Tom Cargill 


"Any program is a model of a model within a theory of a model of an abstraction
of some portion of the world or of some universe of discourse."
<br>&mdash;Meir M. Lehman


"Less than 10 percent of the code has to do with the ostensible purpose of the
system; the rest deals with input-output, data validation, data structure
maintenance, and other housekeeping."
<br>&mdash;Mary Shaw


"[Thompson's rule for first-time telescope makers] It is faster to make a
four-inch mirror then a six-inch mirror than to make a six-inch mirror."
<br>&mdash;Bill McKeeman


"Build one to throw away&mdash;you will anyway."
<br>&mdash;George Stocker


"People don't want to buy a quarter-inch drill, they want a quarter-inch hole."
<br>&mdash;Theodore Levitt


"We build our computer \[systems\] the way we build our cities: over time,
without a plan, on top of ruins." 
<br>&mdash;Ellen Ullman


"Every great developer you know got there by solving problems they were
unqualified to solve until they actually did it." 
<br>&mdash;Patrick McKenzie


"With a sufficient number of users of an API, it does not matter what you
promise in the contract: all observable behaviors of your system will be
depended on by somebody."
<br>&mdash;Hyrum's Law


"\[Chesterton's Fence\] If you don't see the use of it, I certainly won't let you
clear it away. Go away and think. Then, when you can come back and tell me that
you *do* see the use of it, I *may* allow you to destroy it."
<br>&mdash;G. K. Chesterton


### Bugs

"The first step in fixing a broken program is getting it to fail repeatably."
<br>&mdash;Tom Duff 


"Finding your bug is a process of confirming the many things that you believe
are true&mdash;until you find one which is not true."
<br>&mdash;Norm Matloff


"Debugging is twice as hard as writing the code in the first place. Therefore,
if you write the code as cleverly as possible, you are, by definition, not
smart enough to debug it."
<br>&mdash;Brian Kernighan


"The most effective debugging tool is still careful thought, coupled with
judiciously placed print statements."
<br>&mdash;Brian Kernighan


"Never test \[at runtime\] for an error condition you don't know how to handle."
<br>&mdash;Steinbach


"Each new user of a new system uncovers a new class of bugs."
<br>&mdash;Brian Kernighan 


"In our business, one in a million is next Tuesday."
<br>&mdash;Gordon Letwin


### Simplicity

"Controlling complexity is the essence of computer programming."
<br>&mdash;Brian Kernighan


"If people do not believe that mathematics is simple, it is only because they
do not realize how complicated life is."
<br>&mdash;John von Neumann


"A complex system that works is invariably found to have evolved from a simple
system that worked. A complex system designed from scratch never works and
cannot be patched up to make it work. You have to start over with a working
simple system."
<br>&mdash;John Gall


"Sometimes, the elegant implementation is a function. Not a method. Not a
class. Not a framework. Just a function."
<br>&mdash;John Carmack


"Simplicity is prerequisite for reliability."
<br>&mdash;Edsger Dijkstra


"The purpose of abstraction is not to be vague, but to create a new semantic
level in which one can be absolutely precise."
<br>&mdash;Edsger Dijkstra


"\[...\] but there is one quality that cannot be purchased that way - and that is
reliability. The price of reliability is the pursuit of the utmost simplicity.
It is a price which the very rich find most hard to pay."
<br>&mdash;C.A.R. Hoare


"Inside every large program is a small program trying to get out."
<br>&mdash;Tony Hoare


"UNIX is simple. It just takes a genius to understand its simplicity."
<br>&mdash;Dennis Ritchie


"Complexity kills. It sucks the life out of developers, it makes products
difficult to plan, build, and test, it introduces security challenges and it
causes end-users and administrators frustration."
<br>&mdash;Ray Ozzie


"There are two ways of constructing software. One way is to make it so simple
that there are obviously no deficiencies. The other is to make it so complex
that there are no obvious deficiencies."
<br>&mdash;C.A.R. Hoare


"The purpose of software engineering is to control complexity, not to create
it."
<br>&mdash;Pamela Zave


"The key to understanding complicated things is to know what not to look at."
<br>&mdash;Harold Abelson


"The ability to simplify means to eliminate the unnecessary so that the
necessary may speak."
<br>&mdash;Hans Hoffman


"Any intelligent fool can make things bigger, more complex, more violent. It
takes a touch of genius - and a lot of courage - to move in the opposite
direction."
<br>&mdash;Albert Einstein


"Such is modern computing: everything simple is made too complicated because
it's easy to fiddle with: everything complicated stays complicated because it
is hard to fix."
<br>&mdash;Rob Pike


"Simplicity is hard to build, easy to use, and hard to charge for. Complexity
is easy to build, hard to use, and easy to charge for."
<br>&mdash;Chris Sacca


"Knowledge is a process of piling up facts. Wisdom lies in simplification."
<br>&mdash;Martin Luther King, Jr.

"Simplicity is a great virtue but it requires hard work to achieve it and
education to appreciate it. And to make matters worse: complexity sells
better."
<br>&mdash;Edsger Dijkstra


### Optimization

"[The First Rule of Program Optimization] Don't do it."<br>
"[The Second Rule of Program Optimization-For experts only] Don't do it yet."
<br>&mdash;Michael A. Jackson


"In non-I/O-bound programs, a few percent of the source code typically accounts
for over half the run time."
<br>&mdash;Donald Knuth 


"Programmers waste enormous amounts of time thinking about, or worrying about,
the speed of noncritical parts of their programs, and these attempts at
efficiency actually have a strong negative impact when debugging and
maintenance are considered."
<br>&mdash;Donald Knuth


"The fastest I/O is no I/O."
<br>&mdash;Nil's-Peter Nelson


"The cheapest, fastest, and most reliable components of a computer system are
those that aren't there."
<br>&mdash;Gordon Bell


"You know that algorithm that all the papers make fun of in their intro?
Implement that and forget the rest of the paper."
<br>&mdash;Ian Wong


## Science

### Methodology

"Knowledge itself is power."
<br>&mdash;Francis Bacon


"Truth is ever to be found in simplicity, and not in the multiplicity and
confusion of things."
<br>&mdash;Isaac Newton


"Models should be as simple as possible, but not more so." 
<br>&mdash;Attributed to Einstein


"Science is simply common sense at its best, that is, rigidly accurate in
observation, and merciless to fallacy in logic."
<br>&mdash;Thomas Henry Huxley 


"Measure what is measurable, and make measurable what is not so."
<br>&mdash;Galileo Galilei


"The only relevant test of the validity of a hypothesis is comparison of its
predictions with experience."
<br>&mdash;Milton Friedman


"We try things. Occasionally they even work."
<br>&mdash;Rob Balder


"Some people will never learn anything, for this reason, because they
understand everything too soon."
<br>&mdash;Alexander Pope


"It is a capital mistake to theorize before one has data." 
<br>&mdash;Sir Arthur Conan Doyle


"Those who have taken upon them to lay down the law of nature as a thing already
searched out and understood, whether they have spoken in simple assurance or
professional affectation, have therein done philosophy and the sciences great
injury."
<br>&mdash;Francis Bacon


"Although this may seem a paradox, all exact science is dominated by the idea
of approximation. When a man tells you that he knows the exact truth about
anything, you are safe in inferring that he is an inexact man. Every careful
measurement in science is always given with the probable error... every observer
admits that he is likely wrong, and knows about how much wrong he is likely to
be."
<br>&mdash;Bertrand Russell


"I would rather have questions that can't be answered than answers that can't
be questioned."
<br>&mdash;Richard Feynman


### Statistics

"Statistics is the grammar of science." 
<br>&mdash;Karl Pearson


"All knowledge degenerates into probability."
<br>&mdash;David Hume


"If a man will begin with certainties, he shall end in doubts; but if he will
be content to begin with doubts he shall end in certainties."
<br>&mdash;Francis Bacon


"There are three types of lies -- lies, damn lies, and statistics."
<br>&mdash;Benjamin Disraeli


"If your experiment needs statistics, you ought to have done a better experiment."
<br>&mdash;Ernest Rutherford


"To consult the statistician after an experiment is finished is often merely to
ask him to conduct a post mortem examination. He can perhaps say what the
experiment died of."
<br>&mdash;Ronald Fisher


"The actual and physical conduct of an experiment must govern the statistical
procedure of its interpretation."
<br>&mdash;Ronald Fisher


"You can't fix by analysis what you bungled by design."
<br>&mdash;Light, Singer and Willett


"He uses statistics as a drunken man uses lamp-posts--for support rather than
illumination."
<br>&mdash;Andrew Lang


"It is largely because of lack of knowledge of what statistics is that the
person untrained in it trusts himself with a tool quite as dangerous as any he
may pick out from the whole armamentarium of scientific methodology."
<br>&mdash;Edwin B. Wilson



### Research 

"What I cannot create, I do not understand."
<br>&mdash;Richard Feynman


"Study hard what interests you the most in the most undisciplined, irreverent
and original manner possible." 
<br>&mdash;Richard Feynman


"Everything is interesting if you go into it deeply enough."
<br>&mdash;Richard Feynman


"You think you know when you can learn, are more sure when you can write, even
more when you can teach, but certain when you can program."
<br>&mdash;Alan J. Perlis


"If you find that you're spending almost all your time on theory, start turning
some attention to practical things; it will improve your theories. If you find
that you're spending almost all your time on practice, start turning some
attention to theoretical things; it will improve your practice."
<br>&mdash;Donald Knuth


"It is unworthy of excellent men to lose hours like slaves in the labour of
calculation which could safely be relegated to anyone else if machines were
used." 
<br>&mdash;Gottfried Wilhelm Leibniz, 1685


"Far better an approximate answer to the right question, which is often vague,
than an exact answer to the wrong question which can always be made precise."
<br>&mdash;John Tukey


"Email is a wonderful thing for people whose role in life is to be on top of
things. But not for me; my role is to be on the bottom of things. What I do
takes long hours of studying and uninterruptible concentration."
<br>&mdash;Donald Knuth



### Machine Learning

"People worry that computers will get too smart and take over the world, but
the real problem is that they're too stupid and they've already taken over the
world." 
<br>&mdash;Pedro Domingos


"Programming, like all engineering, is a lot of work: we have to build
everything from scratch. \[Machine\] Learning is more like farming, which lets
nature do most of the work. Farmers combine seeds with nutrients to grow crops;
\[Machine\] Learners combine knowledge with data to grow programs."
<br>&mdash;Pedro Domingos


"As one Google Translate engineer put it, 'when you go from 10,000 training
examples to 10 billion training examples, it all starts to work. Data trumps
everything.'"
<br>&mdash;Garry Kasparov


"A single neuron in the brain is an incredibly complex machine that even today
we don't understand. A single 'neuron' in a neural network is an incredibly
simple mathematical function that captures a minuscule fraction of the
complexity of a biological neuron."
<br>&mdash;Andrew Ng


"Coming up with features is difficult, time-consuming, and requires expert
knowledge. 'Applied machine learning' is basically feature engineering."
<br>&mdash;Andrew Ng


"I once ran a small neural net 100 times on simple three-dimensional data
re-selecting the initial weights to be small and random on each run. I found 32
distinct minima, each of which gave a different picture, and having about equal
test set error."
<br>&mdash;Leo Breiman


"The one nice thing about Random Forest is that is doesn't overfit \[as more
trees are added\]. You can’t have too many trees: it just stabilizes."
<br>&mdash;Trevor Hastie


"The question of whether a computer can think is no more interesting than the
question of whether a submarine can swim."
<br>&mdash;Edsger Dijkstra


"Artificial Intelligence is not 'man versus machine.' It is 'man with machines'
versus 'man without machines.'"
<br>&mdash;Stephen Thaler


## Philosophy

### Truth

"Facts do not cease to exist because they are ignored."
<br>&mdash;Aldous Huxley


"If any man is able to convince me and show me that I do not think or act
right, I will gladly change; for I seek the truth by which no man was ever
injured. But he is injured who abides in his error and ignorance."
<br>&mdash;Marcus Aurelius


"One should respect public opinion insofar as is necessary to avoid starvation
and keep out of prison, but anything that goes beyond this is voluntary
submission to an unnecessary tyranny."
<br>&mdash;Bertrand Russell 


"If it can be destroyed by the truth, it deserves to be destroyed by the truth."
<br>&mdash;Carl Sagan?


"One of the saddest lessons of history is this: If we've been bamboozled long
enough, we tend to reject any evidence of the bamboozle. We're no longer
interested in finding out the truth. The bamboozle has captured us. It's simply
too painful to acknowledge, even to ourselves, that we've been taken. Once you
give a charlatan power over you, you almost never get it back."
<br>&mdash;Carl Sagan


"Humankind cannot bear very much reality."
<br>&mdash;T. S. Eliot


"When people thought the Earth was flat, they were wrong. When people thought
the Earth was spherical, they were wrong. But if you think that thinking the
Earth is spherical is just as wrong as thinking the Earth is flat, then your
view is wronger than both of them put together."
<br>&mdash;Isaac Asimov


"A wise man proportions his belief to the evidence."
<br>&mdash;David Hume


"Certain mystes aver that the real world has been constructed by the human
mind, since our ways are governed by the artificial categories into which we
place essentially undifferentiated things, things weaker than our words for
them."
<br>&mdash;Gene Wolfe, *Book of the New Sun*


"Men must be taught as if you taught them not / And things unknown proposed as
things forgot."
<br>&mdash;Alexander Pope


"Above all, don't lie to yourself. The man who lies to himself and listens to
his own lies comes to a point that he cannot distinguish the truth within him,
or around him, and so loses all respect for himself and for others."
<br>&mdash;Fyodor Dostoyevsky


"Some of the greatest discoveries consist mainly in the clearing away of
psychological roadblocks which obstruct the approach to reality; which is why,
post factum, they appear so obvious."
<br>&mdash;Arthur Koestler



### Ethics

"The only good is knowledge and the only evil is ignorance."
<br>&mdash;Socrates


"Violence is the last refuge of the incompetent."
<br>&mdash;Isaac Asimov


"Trust, but verify."
<br>&mdash;Russian Proverb


"When I do good I feel good, when I do bad I feel bad, and that's my religion."
<br>&mdash;Abraham Lincoln


"When you believe in things that you don't understand, then you suffer:
superstition ain't the way."
<br>&mdash;Stevie Wonder


"The world would be a much simpler place if one could bring about social change
merely by making a logically consistent moral argument."
<br>&mdash;Peter Singer


"This too shall pass."
<br>&mdash;Persian Adage


"A ship in harbor is safe, but that's not what ships are built for."
<br>&mdash;John A. Shedd


"Our responsibility is to do what we can, learn what we can, improve the
solutions, and pass them on."
<br>&mdash;Richard P. Feynman



### Ignorance

"The trouble with the world is that the stupid are cocksure and the intelligent
full of doubt."
<br>&mdash;Bertrand Russell 


"Ignorance more frequently begets confidence than does knowledge."
<br>&mdash;Charles Darwin


"For the great enemy of truth is very often not the lie&mdash;deliberate,
contrived and dishonest&mdash;but the myth&mdash;persistent, persuasive, and
unrealistic. Too often we hold fast to the cliches of our forebears. We subject
all facts to a prefabricated set of interpretations. We enjoy the comfort of
opinion without the discomfort of thought."
<br>&mdash;John F. Kennedy


"If they can get you asking the wrong questions, they don't have to worry about
answers."
<br>&mdash;Thomas Pynchon, *Gravity's Rainbow*


"I have a foreboding of an America in my children's or grandchildren's 
time&mdash;when the United States is a service and information economy; when 
nearly all the manufacturing industries have slipped away to other countries;
when awesome technological powers are in the hands of a very few, and no one
representing the public interest can even grasp the issues; when the people
have lost the ability to set their own agendas or knowledgeably question those
in authority; when, clutching our crystals and nervously consulting our
horoscopes, our critical faculties in decline, unable to distinguish between
what feels good and what's true, we slide, almost without noticing, back into
superstition and darkness... The dumbing down of American is most evident in
the slow decay of substantive content in the enormously influential media, the
30 second sound bites (now down to 10 seconds or less), lowest common
denominator programming, credulous presentations on pseudoscience and
superstition, but especially a kind of celebration of ignorance." 
<br>&mdash;Carl Sagan


"There is a cult of ignorance in the United States, and there has always been.
The strain of anti-intellectualism has been a constant thread winding its way
through our political and cultural life, nurtured by the false notion that
democracy means that my ignorance is just as good as your knowledge." 
<br>&mdash;Isaac Asimov


"If we are to have another contest in the near future of our national
existence, I predict that the dividing line will not be Mason and Dixon's but
between patriotism and intelligence on the one side, and superstition, ambition
and ignorance on the other."
<br>&mdash;Ulysses S. Grant, 1879


"Either America will destroy ignorance or ignorance will destroy the United
States." 
<br>&mdash;W.E.B. Du Bois


## Humor

### Jokes

"Should array indices start at 0 or 1? My compromise of 0.5 was rejected
without, I thought, proper consideration."
<br>&mdash;Stan Kelly-Bootle


"There are only two hard problems in computer science: cache invalidation,
naming things, and off-by-one errors."
<br>&mdash;Leon Bambrick



"It ain't what you don't know that gets you in trouble. It's what you know for
sure that just ain't so."
<br>&mdash;Josh Billings?


"A statistician is a person who draws a mathematically precise line from an
unwarranted assumption to a foregone conclusion."
<br>&mdash;Anonymous


"If it works, it's obsolete."
<br>&mdash;Marshall Mcluhan


"A Bayesian is one who, vaguely expecting a horse, and catching a glimpse of a
donkey, strongly believes he has seen a mule."
<br>&mdash;Anonymous


"Beware of bugs in the above code; I have only proved it correct, not tried it."
<br>&mdash;Donald Knuth


"The essence of XML is this: the problem it solves is not hard, and it does not
solve the problem well."
<br>&mdash;Phil Wadler


"Nothing is more permanent than a temporary solution."
<br>&mdash;Russian Proverb


"Eschew clever rules."
<br>&mdash;Joe Condon 


"The term 'exponential' is used quadratically too often."
<br>&mdash;Geoffrey Hinton


"Statistics means never having to say you're certain."
<br>&mdash;Rob Hyndman


"A mathematician is a device for turning coffee into theorems."
<br>&mdash;Paul Erdos


"Corollary: A co-mathematician is a device for turning ffee into co-theorems."
<br>&mdash;Anonymous


"Anyone who considers arithmetical methods of producing random numbers is, of
course, in a state of sin."
<br>&mdash;John von Neumann 


"A statistician is someone who is good with numbers but lacks the personality
to be an accountant."
<br>&mdash;Anonymous


"Learning to program teaches you how to think. Computer science is a liberal
art."
<br>&mdash;Steve Jobs


"You either believe in the law of the excluded middle, or you don't."
<br>&mdash;Lew Lefton


"Pointers are real. They’re what the hardware understands. Somebody has to deal
with them. You can’t just place a LISP book on top of an x86 chip and hope that
the hardware learns about lambda calculus by osmosis."
<br>&mdash;James Mickens


"Math is all about nuance. For example, there's a fine line between a numerator
and a denominator."
<br>&mdash;Anonymous


"Every time I fire a linguist, the performance of the speech recognizer goes
up."
<br>&mdash;Frederick Jelinek


"Some people, when confronted with a problem, think 'I know, I'll use
multithreading.' Nothhw tpe yawrve o oblems."
<br>&mdash;Eiríkr Åsheim


"The secret to success is an even number of sign errors."
<br>&mdash;John Carmack


### Poems 

<b>A Dozen, A Gross, A Score</b><br>
\\[ \frac{12 + 144 + 20 + 3\sqrt{4}}{7 + 5 \times 11} = 9^2 \\]
A dozen, a gross, plus a score<br>
Plus three times the square root of four<br>
Divided by seven<br>
Plus five times eleven<br>
Is nine squared (and not a bit more.)
<br>&mdash;John Saxon


<b>Word Crunching</b><br>
<br>
I<br>
wrote<br>
a poem<br>
on a page<br>
but then each line grew<br>
to the word sum of the previous two<br>
until I started to worry at all these words coming with such frequency<br>
because, as you can see, it can be easy to run out of space when a poem gets all Fibonacci sequency.
<br>&mdash;Brian Bilston


<br><b>RSA Algorithm</b>
\\[ p, q \in \mathbb{P} \\]
\\[ n = pq \\]
\\[ \phi = (p-1)(q-1) \\]
\\[ \gcd(e, \phi) = 1 \land d \equiv e^{-1} (\mathrm{mod} \phi) \Rightarrow c = m^e (\mathrm{mod}\ n) \land m = c^d (\mathrm{mod}\ n) \\]
Take two large prime numbers, $q$ and $p$. <br>
Find the product $n$, and the totient $\phi$. <br>
If $e$ and $\phi$ have GCD one <br>
and $d$ is $e$'s inverse, then you're done! <br>
For sending $m$ raised to the $e$ <br>
reduced $\mathrm{mod}\ n$ gives secre-$c$!
<br>&mdash;Daniel G.


<br><b>A Certain Definite Integral</b><br>
\\[ \int_1^{\sqrt[3]{3}} t^2dt \cos(3\pi/9) = \log(\sqrt[3]{e}) \\]
The Integral $t$-squared $dt$ <br>
From one to the cube root of three <br>
Times the cosine <br>
Of three $\pi$ over nine<br>
Equals log of the cube root of $e$.
<br>&mdash;Anonymous


<br><b>Mnemonic For Calculating Sixteen</b><br>
\\[ ln(e^4)\sqrt{1024} + 6 \times 12 - 8 \times 23 = 16 \\]
The log of $e$ to the four<br>
Times the square root of one thousand twenty four<br>
Adding six dozens please<br>
Minus eight twenty-threes<br>
Is sixteen, case closed, shut the door.
<br>&mdash;Anonymous


<br><b>A Complete Circle</b><br>
\\[ e^{2 \pi i} = 1 \\]
We start with the constant called "pi"<br>
And then multiply by two $i$<br>
Apply exponential<br>
(This step is essential)<br>
And one's the result - who knows why!
<br>&mdash;Dan Shved


<br><b>Mandelbrot Set (Lyrics)</b><br>
Just take a point called $Z$ in the complex plane<br>
Let $Z_1$ be $Z$ squared plus $C$<br>
And $Z_2$ is $Z_1$ squared plus $C$<br>
And $Z_3$ is $Z_2$ squared plus $C$<br>
And so on<br>
If the series of $Z$'s should always stay<br>
Close to $Z$ and never trend away<br>
That point is in the Mandelbrot Set
<br>&mdash;Jonathan Coulton


<br><b>Bertrand's Postulate</b><br>
Chebyshev said it, but I'll say it again:<br>
there's always a prime between $n$ and $2n$.
<br>&mdash;N. J. Fine
