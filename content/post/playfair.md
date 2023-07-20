---
title: "Cracking Playfair Ciphers"
author: "Oran Looney"
date: 2023-06-28
publishdate: 2023-06-28
tags:
  - Math
  - Python
  - Visualization
image: /post/playfair_files/lead.jpg
---

Once upon a midnight dreary
Once upon a midnight dreary
Once upon a midnight dreary
Once upon a midnight dreary
Once upon a midnight dreary
Once upon a midnight dreary

Recently the Zodiac 340 was finally cracked after more than 50 years.
While the effort to crack it was extremely impressive and you should watch
David Oranchak's series on how it was done, the cipher itself was ultimately
disappointing. A homophonic substituion cipher with one minor twist that was
difficult to crack primarily because several errors were made when encoding it.

Sense of Rightness
------------------

The FBI, in a report on Graysmith's 1979 attempt to crack the Zodiac 340 cipher, made this rather damning statement:

> When a cryptogram has been decrypted properly there is an unmistakable sense of rightness about the solution. This sense of rightness is completely absent in the proposed solution.
> <br>&mdash; [FBI][FBI]

[FBI]: http://zodiackillerfacts.com/main/the-340-cipher-dead-ends/

If we are to automate the search, we need to quantify this "sense of rightness."

The traditional approach is to use trigrams or quadgrams and compare frequencies against the known frequencies of a target language such as English. For example, the trigram "THE" is very common
in English, while "QXZ" is very uncommon, so if we see "THE" in the recovered plaintext we can see know we are on the right track. 

This does work out of the box for Playfair, but it has a couple of problems. First, the pre-processing steps of replacing "J" with "I" and breaking up pairs like "LL" by inserting an "X" to get "LX"
mess up the freqencies a bit. If we're going to use n-grams, we should recalculate frequency based on already pre-processed text. Second, Playfair works on pairs of letters. Especially very early
in the search process, it's a promising signal if any pair of letters decodes to a common english bigram. However, bigrams are a fairly weak way of detecting correct text.

TODO: I tried using ChatGPT via the OpenAI API, but this is very slow - multiple seconds to check one message, when we need to be trying thousands or even millions of keys. However, it does work
really well; ChatGPT can segment and punctuate text that's been run together, and even tell if a message is messy/malformed English or complete gibberish. 

TODO I found a good compromise was to apply word segmentation, and then to check the resulting works against an English dictionary, with partial credit for typos or misspellings (which may 
be decryption errors, or intentional mistakes designed to make the message harder to crack.) For this purpose we use an off-the-shelf [Python package for word segmentation][WSG], 
implemented a [BK-tree][BKT] to find English words and near words, and wrote a heuristic function to guage the "Englishness" of a text:

This approach is still a little slow (still less than a second) but seemingly quite reliable. Nonsense gets scores under 10%, which even very bad/malformed English usually gets over 80%. 
It's not fast enough to use for inner loop of the search, but it is fast and reliable enough to automatically detect when we've truely cracked the cipher.

[WSG]: https://pypi.org/project/wordsegment/
[BKT]: https://en.wikipedia.org/wiki/BK-tree

My idea was to use a three-fold hybrid approach:

1. Use bigrams, but only on pairs of letters decoded together. This helps early on.
2. Also use trigrams, to help zero in on the final key once it starts to make sense.
3. Finally, use a slower method to verify that we've found a real English sentence.






The Playfair Cipher
-------------------

The [Playfair cipher][PC], as you can infer from its name, was invented by Charles
Wheatstone in 1854. (Lest you think Wheatstone was cheated of the credit, rest
assured that he received ample fame as the inventor of the [Wheatstone
bridge][WB], which was invented by Samuel Hunter Christie.)

[PC]: https://en.wikipedia.org/wiki/Playfair_cipher

[WB]: https://en.wikipedia.org/wiki/Wheatstone_bridge

The Playfair cipher is designed to be done on paper, so places a great
deal of emphasis on ease of use over security. No addition module 256 here!

Despite its simplicity, it is a considerable advance over substitution ciphers, even
the [homophonic substitution ciphers][HSC] that were popular at the time.

[HSC]: https://en.wikipedia.org/wiki/Substitution_cipher#Homophonic

The reason has to do with the permutation. Modern block ciphers like AES still
use a [substitution-permutation network][SNP] which work in a very similar
way and are difficult to crack for exactly the same reason. The only real reason
why AES is more secure than Playfair is that uses much more computational power.

[AES]: https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
[SPN]: https://en.wikipedia.org/wiki/Substitution%E2%80%93permutation_network


We're going to try two approaches. We'll start with a known plaintext attack,
and then try a more randomized approach.


Known Plaintext Attack
----------------------

Known plaintext attacks sound rather pointless at first glance. "You're
telling me you can crack this cipher for me, but only if I give you the
original message? I think I'll take my business to a different cryptographer."

> It rather involved being on the other side of this airtight hatchway.
> <br>&mdash;[Raymond Chen][RC], quoting Douglas Adams

[RC]: https://devblogs.microsoft.com/oldnewthing/20060508-22/?p=31283

However, there are several ways to obtain probable plaintext. For example,
you might guess it says "Keine besonderen Ereignisse," German for "Nothing to Report,"
a stock phrase often used in WWII which was used to [crack the Enigma machine][CAE]. 
As we'll see later, Playfair even has a weakness which allow us to automatically identify
candidate plaintext words. Nor is the exercise pointless - once you've cracked the 
cipher you'll be able to decrypt and read other messages that you don't yet know,
as well as encrypt fake messages.

[CAE]: https://en.wikipedia.org/wiki/Cryptanalysis_of_the_Enigma



<div style="width: 560px; margin: auto">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/-1oQLPRE21o" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

Testing


> Playfair is no longer used by military forces because of the advent of
> digital encryption devices. This cipher is now regarded as insecure for any
> purpose, because modern computers could easily break it within microseconds.
> <br>&mdash;[Wikipedia][WPC]

[WPC]: https://en.wikipedia.org/wiki/Playfair_cipher

Really, microseconds? That's a little surprising. Let's be generous and say we
can implement the Playfair decryption in 3 lookup operations, and the bigraph
lookup up 1 lookup operation, all of which hit the L1 cache. That's roughly 4
nanoseconds per bigraph, or 2 nanoseconds per character. We'll need 100
characters or more to have any hope of cracking the cipher, so that's 200
nanoseconds per candidate key that we check. That means we have to find a
solution while checking fewer than 5,000 keys.

Just how weak is the Playfair cipher?

<img src="/post/playfair_files/substitution_heatmaps.png">

In constract, playfair is achieving reasonable levels of mixing:

<img src="/post/playfair_files/playfair_heatmaps.png">


There are $24! = 6.2 \times 10^{23}$ possible keys.

If we interpret "microseconds"
to mean less than one millisecond, and assume

Torus
-----

As I pondered, weak and weary
As I pondered, weak and weary
As I pondered, weak and weary
As I pondered, weak and weary
As I pondered, weak and weary
As I pondered, weak and weary

<div id="playfairCanvas"><img src="/post/playfair_files/texture.png"></div>

Suddenly there came a tapping.

<div id="playfairTorus"><img src="/post/playfair_files/torus.png"></div>

<link rel="stylesheet" href="/post/playfair_files/playfair.css">

<script type="module">
    import { renderPlayfairCanvas, renderPlayfairTorus } from '/post/playfair_files/playfair_torus.js';
    renderPlayfairTorus('MYNAEISORWLBCDFGHKPQTUVXZ', 'playfairTorus');
</script>

While I nodded, nearly napping
While I nodded, nearly napping
While I nodded, nearly napping
While I nodded, nearly napping
While I nodded, nearly napping
While I nodded, nearly napping

Implementing KPA
----------------

Stack Overflow user Ilmari Karonen has helpfully [summarized the logic here][IKC].
Some of the are obvious, but others, like the the chains which allow us to fill
in an entire row or column, including the exact order, are extremely clever. 

[IKC]: https://crypto.stackexchange.com/questions/35722/how-to-find-the-keyword-of-the-playfair-cipher-given-the-plaintext-and-the-ciph


We have options about how we represent this problem to Z3. I found the most natural way was to use a 25x2
matrix, where each row represents a letter. The first column is the x-coordinate of that letter in the 5x5
playfair key grid, and the second is the y-coordinate. So every element of the matrix will be an integer
between 0 and 4, and we'll also need to make sure that a letter can go in one and only one cell.
Because they constraints apply to all Playfair key grids, we'll call them the universal constraints.

    from z3 import *

    X = [[Int('x_%i_%i' % (i, j)) for j in range(2)] for i in range(25)]
    position_constraints = [
        And(0 <= X[i][j], X[i][j] <= 4) 
        for j in range(2) 
        for i in range(25)
    ] 
    distinct_constraints = [
        Distinct([X[i][0]*5 + X[i][1] 
        for i in range(25)])
    ]
    universal_constraints = position_constraints + distinct_constraints

We'll write some helper function so help keep track of the constraints. Most of the information
will come in the form of learning that two letters are in the same row/column, or in adjacent rows/columns,
so we'll make it easy to describe such constraints.

    def row_col_constraint(*indices, spacing=0, orientation=0):
        constraints = [
            (X[indices[i]][orientation] + spacing) % 5 == X[indices[i+1]][orientation] 
            for i in range(len(indices) - 1)
        ]
        if len(constraints) >= 2:
            return And(*constraints)
        else:
            return constraints[0]

    def same_row(*indices):
        return row_col_constraint(*indices, spacing=0, orientation=0)

    def same_col(*indices):
        return row_col_constraint(*indices, spacing=0, orientation=1)

    def next_row(*indices):
        return row_col_constraint(*indices, spacing=1, orientation=0)

    def next_col(*indices):
        return row_col_constraint(*indices, spacing=1, orientation=1)


<img src="/post/playfair_files/rectangle_constraint.png">

Now we have to consider the various special cases. For example, if we see that the plaintext "XY" maps
to ciphertext "AB", and we also see that "AB" maps to "XY", then we know that X, Y, A, B must form a rectangle
in the key grid.

    # XY -> AB and AB -> XY, so XA/BY form a rectangle
    def rectangle_constraint(plain_digraph: str, cipher_digraph: str) -> list:
        p1, p2 = (playfair_ord(c) for c in plain_digraph)
        c1, c2 = (playfair_ord(c) for c in cipher_digraph)

        return And(
            same_row(p1, c1),
            same_row(p2, c2),
            same_col(p1, c2),
            same_col(p2, c1),
            Not(same_row(p1, p2)),
            Not(same_col(p1, p2)),
            Not(same_row(c1, c2)),
            Not(same_col(c1, c2))
        )

There are several other such special cases to consider:

Chain constraints three in a row, either in a column or row:

<img src="/post/playfair_files/chain_constraint.png">

In code:

    # XY -> PQ, PQ -> YA => row/col of XPYQA
    def chain_constraint(plain_digraph: str, cipher_digraph: str, next_digraph) -> list:
        p1, p2 = (playfair_ord(c) for c in plain_digraph)
        c1, c2 = (playfair_ord(c) for c in cipher_digraph)
        n1, n2 = (playfair_ord(c) for c in next_digraph)

        return Or(
            And(same_row(p1, c1, p2, c2, n2), next_col(p1, c1, p2, c2, n2)),
            And(same_col(p1, c1, p2, c2, n2), next_row(p1, c1, p2, c2, n2))
        )

    # XY -> PQ, PQ -> BX => row/col of YQXPB
    # omitted for brevity...
        
    # XY -> YZ so XYZ share a row or column and are all adjacent
    def adjacent_constraint(plain_digraph: str, cipher_digraph: str) -> list:
        p1, p2 = (playfair_ord(c) for c in plain_digraph)
        c1, c2 = (playfair_ord(c) for c in cipher_digraph)
        assert p2 == c1
        
        return Or(
            And(same_row(p1, p2, c2), next_col(p1, p2, c2)),
            And(same_col(p1, p2, c2), next_row(p1, p2, c2))
        )

    # XY -> WX so YXW share a row or column and are all adjacent
    # omitted for brevity...

However, even if we don't see any special pattern, we do actually glean a small
amount of information from every digraph we see. Remember, there are only three
cases for encoding a pair: the rectangle case, the same row case, and the same column case.
In all three, the ciphertext letter is *always* in the same row or the same column as 
the plaintext letter. If it's the same column, then the ciphertext letter is immediately
below the plaintext character:

<img src="/post/playfair_files/simple_constraint.png">

This is true for both the first and second characte of each digraph.  In code:

    # XY -> AB (no other information)
    def simple_constraint(plain_digraph: str, cipher_digraph: str) -> list:
        p1, p2 = (playfair_ord(c) for c in plain_digraph)
        c1, c2 = (playfair_ord(c) for c in cipher_digraph)
        
        return And(
            Or(same_row(p1, c1), And(same_col(p1, c1), next_row(p1, c1))),
            Or(same_row(p2, c2), And(same_col(p2, c2), next_row(p2, c2)))
        )

It's easy to scan through the known text and quickly build up a map of digraphs. This is also
a good opportunity to validate that the ciphertext really does look like it came from Playfair cipher.

    def parse_bigraph_map(plaintext: str, ciphertext: str) -> dict:
        """
        Parse and validate matching plaintext and ciphertext. A dict of distinct
        plaintext to ciphertext bigraphs mappings are returned, including all 
        mirrored mappings. This checks for obvious violations of the Playfair
        cipher algorithm and will raise an Exception if any are found.
        """
        
        # we only care about unique/distinct digraph mappings of the form AB -> XY 
        # and will ignore duplicates.
        bigraph_map = {}
        for plain_bigraph, cipher_bigraph in zip(bigraphs(plaintext), bigraphs(ciphertext)):
            # XY -> AB => YX -> BA, add both the original and mirrored versions to the map
            bigraph_map[plain_bigraph] = cipher_bigraph
            bigraph_map[ plain_bigraph[::-1] ] = cipher_bigraph[::-1]
            
        return bigraph_map

We have to examine each digraph mapping to see if we have enough information to identify a special
case:


    def constraints_from_known_text(plaintext: str, ciphertext: str, verbose_level=0) -> list:
        """
        Analyze the plain/ciphertext bigraph pairs of a message and make deductions about
        the structure of the key. These are returns as a list of Z3 constraints.
        """
        bigraph_map = parse_bigraph_map(plaintext, ciphertext)

        # build up constraints
        constraints = []
        seen_already = set()
        for plain_bigraph, cipher_bigraph in bigraph_map.items():
            # we only need to handle one of each mirror version.
            if plain_bigraph[::-1] in seen_already:
                continue
            else:
                seen_already.add(plain_bigraph)

            # XY -> YZ => XYZ in row or col
            if plain_bigraph[1] == cipher_bigraph[0]:
                constraints.append( adjacent_constraint(plain_bigraph, cipher_bigraph) )
                continue

            # XY -> ZX => YXZ in row or col
            # omitted for brevity

            if cipher_bigraph in bigraph_map:
                next_bigraph = bigraph_map[cipher_bigraph]

                # XY -> AB, AB -> XY => rectangle
                if next_bigraph == plain_bigraph:
                    constraints.append( rectangle_constraint(plain_bigraph, cipher_bigraph) )
                    continue

                # XY -> PQ, PQ -> YA => row or col of XPYQA
                if plain_bigraph[1] == next_bigraph[0]:
                    constraints.append( 
                        chain_constraint(plain_bigraph, cipher_bigraph, next_bigraph))
                    continue

                # XY -> PQ, PQ -> BX => rol or col of YQXPB
                # omitted for brevity
                        
            # AB -> XY
            constraints.append( simple_constraint(plain_bigraph, cipher_bigraph) )

        return constraints

Now that we've built up a set of Z3 constraints describing our specific problem, we can ask Z3 to find
a key meeting all of the above constraints:


    def solve_playfair_constraints(dynamic_constraints):
        solver = Solver()
        
        solver.add(universal_constraints)
        solver.add(dynamic_constraints)

        # Check for solution
        check = solver.check()
        if  check == sat:
            model = solver.model()
            grid = model_to_grid(model)
            return sat, grid
        else:
            return check, None

We can also get Z3 to keep generating different unique solutions through the simply trick of
adding a constraint to block the previous solution and re-solving:

    def iter_playfair_constraints(dynamic_constraints):
        solver = Solver()
        
        solver.add(universal_constraints)
        solver.add(dynamic_constraints)

        # Check for solution
        while True:
            check = solver.check()
            if  check == sat:
                model = solver.model()
                grid = model_to_grid(model)
                yield grid
                
                # block the found solution and try again
                solver.add(Or([
                    X[i][j] != model[X[i][j]] 
                    for i in range(25) 
                    for j in range(2)
                ]))
            else:
                break

When given only the first 100 characters as known plaintext, this approach was able to recover
almost the entire key, except for a transposition of Z and X in the last row. 

    M Y N A E
    I S O R W
    L B C D F
    G H K P Q
    T U V Z X

This is enough to recover most of the message:

<img src="/post/playfair_files/kpa_visual_diff.png">

Simulated Annealing
-------------------

Dual annealing, etc. Consider this function:

\\[
    f(x) = \sum_{k=1}^{1000} \frac{{|\sin(k\pi x)|}}{k}
\\]

Or in Python:

    def f(x, n=1000):
        return sum( abs(sin(k*pi*x))/k  for k in range(1, n+1) )

This function has 84,779 local minima between 0.2 and 0.8:

<img src="/post/playfair_files/many_local_minima.png">

How do you find the single global minima? One answer is simulated annealing:

    from scipy.optimize import dual_annealing
    dual_annealing(f, [(0.2, 0.8)], x0=[0.20001], callback=print)

-

    [0.5008241] [4.56639717] 0
    [0.5] 4.089060034436875 1
     message: ['Maximum number of iteration reached']
     success: True
      status: 0
         fun: 4.089060034436875
           x: [ 5.000e-01]
         nit: 1000
        nfev: 2145
        njev: 72
        nhev: 0

Parallel
--------

Pure simulated annealing

<pre style="font-size: 0.77em; background-color: black; color: green; padding: 0.5em;">
Cipher Text:
VYFAOAMEUGUGMQEXNWCWWSCOBHMFZIQYWAUGYWMEWCXIEAHZLGLMNYAZMZIUQYAFQMWCZILGLTGUGLYWYPRLFAMVWRZNWCISRBINCWIPIVZMYCNYEANBCNM
ZAFHSUGROMWMVQYVORILMKSBFIUQYQNSBVIVYVIBFKRFWDRIUQYOCIXUBXMWOXMACRYIUQYOSFMMVWYMVOMMFUGAQMXGUIVQYXICNAWNZMEBILMWYBLCOBM
VYFAIXQYOSCTAWMHCIIRLZQYNICOMXLMWUMALMPBNFRGQYIXQYSQSOQAWOWCUGMEOKWMMVKCYOZMDTDMMLCOIBMZUGMYHTRLMNSVUGWRTHGUQYPROPAMRUR
YACNSYBPYDTBTMCCKGVQYWYDOMZIUPYMGWMFYAMMXGUQYFNFMIURMGMRXYWXISHVUWAYMYLAWUGAQMXGSWBDRTHGUISUGBKMDFMMKYWYMEAVIMCEBRWUGWF
RWUGAHAWOSIUEAFBMZOCUZUGAZMALTYEMLDVKCIYROFAZMSASVDAWAORCTWQRWUGROWFKSPRWAVIVYFAIXNPMZGSOSSVOAMNUGNFMFYWMLMDWAMDAGWRILW
YWYMCLTGUMAYMMVFYNSACNIIXMDKCAGWAQYYOSREV

13:33:30  17896 LWFDCOPEIZMANQRHSKGYUBXTV YRWNPMNOTHTHRNFKAFDLBALZUSNLIERGBPTHSCNOLDTEPNYODHUORKRPROOTRGNWNRLDIR    23%
13:33:30  18092 WTPQMZLVOEFYKHXRNCGISBDAU LKHSQGUMAIAIQPMERTRPSRGVAYWXERTHQSAIFTUMPREXOUFOONETYLSOWEXITHSHPQPROW    24%
13:33:30  20452 YASDBPWEQZFLGTNMCHKORXUVI RDLYCBHPHEHEKPWULZLAEAMKSOFPBOPDAXHEAPHPALRVWSOEFLFCFBBWOPVXPDYLPKALQE    17%
13:33:34  17896 NVMWFXQTZIBASOYPRUDHLCEKG FAVYSBEUHEHEVTLTFMKVMOKAYPVWTZIAVOHEOFEUVKIZCSDIGKENFBOQWTTHIAYVTVVKTX    28%
13:33:39  17896 NOMWFXQTZIBASRYPVUDHLCEKG HAOYCQEUHEHEOTLTFMKOMRVCYPOWTZIAORHERFEUOKIZCSDIGKENFBRQWTTHIAYOTOOKTX    29%
13:33:43  17896 NOMFWXQTIZBASYRPVUHDLCEGK HAOYCQEUHEHEOTLTWFKOMRVCYPOMITIAORHERFEUOKZTCSDIKEENFBRQWTTHIAYOTOOKIX    29%
13:33:44  16908 EYABDOPWFLQHIXZKSGMRCNTUV NDWBWEKBTMTMKXBQTPTOPGKEYXXBXHHEATTMAPKBOTIHDYQXWRFRSNDIRXXTHEBWXKOTX     31%
13:33:53  20452 UEYNTOVXMGPBRFALQHKWZDSCI XERFGPVNTOTOVKYVTKIKHIZMRQNMICHEAGTOTHVNKIGSTBLSWOKOYEPIOCZTHEFRKVKIDL    31%
13:33:54  16908 OPWAFQHIZRCVTLUKSGXDEYMNB HSAWFWYBTDTDEINKMATOPGQEYRBWIHHEPWTDMPYBOTGZNOQITTNMENANIRTHEWAIEOTIR     34%
13:34:08  16908 KDGXSQRIZHCUTLVOFWAPEBMNY HPOWPWBYTDTDEINKMATOPGQCYRBWIRHEFWTDMPBYOTGZNOZITTNMNLXNIRTHEWOIEOTIH     34%
13:34:12  20452 UEYITPBRACOMXKGLQHNWZFDSV DTSBKPBFTOTOBMYMHNTGNVPGRQBQSUHENCTOTHBFGTKYIBLDWOQOHIPSOFYTHEBSMBGTFL    35%
13:34:14   9896 SMOADKNCFPBWRVIUYEGHZTLXQ WGAXMOOYHEHEDTGLMNNRBMOLIUANQBTHVMHEWNOYRNQVGOUQXETOMWSSTBHTHXATDRNQX     37%
13:34:19   9896 KNCFPSMOADBWRVIUYEGHZTLXQ WGXFMOOYHEHEDTGLTMNRBMLCIUANQBTHVMHEWMOYRNQVGOUQXETOTWSSTBHTHFXTDRNQX     39%
13:34:26   6440 ZKTUFPEMYONARSCBQGHWXVIDL DEKCECEPTHTHEGPVCBOCHCOFWGOTTXHEQCTHOHEPCOLVKEBUIWIOSPNKPTDTHECKGECOKB    46%
13:34:35   6440 WGPQHFTOVUSCXNLAMDEYRIBZK UEWSFDADTHTHEGDNSQSGRFXTKPATBRHERSTHAHADGSCBDYQKCHCYLEEREIKTHESWGEGSE     50%
13:34:42  13048 DIWZNQGKHPVTXUCEMOYBFLASR UERLXOEBTHTHEGOVZIXNZAXBYPELWDHEAOTHOZEBNXTWOFZSMIMTZBSWYIZTHELRGENXDH    54%
13:34:44   6440 DFZISKLWPRUXVTOHNQGBYAEMC UEANXCEATHTHEGAVQLERRZBRGBAIFZHELETHEKEARETFAYQDPNPAHAEFEIDTHENAGEREEV    57%
13:34:47  13048 HQGPZNWIBCYEMADSFRLOUVTKX UELELDEYTHTHEGDVCNBNNFZDNPERGCHEBETHENEYNBTCYMZPRPRAHNDPDGNTHEELGENBPH    60%
13:34:55  13048 FPDLBRSOIWEYAMNZUVTCQHXGK UADEDOANTHTHEGAQWBNBIRVWPKELTRHEONTHNSANBNGONYQUGTGIMEEVETSTHEEDGEBNE     60%
13:34:57   6440 WLRBFPICSOEMYNAQGHKDZTUVX UNXOFOEATHTHEGAZEBPRBPISRKALTPHEFETHEREARPTOANQUTMTIYMEETCTHEOXGERPQE     64%
13:35:00  13048 ISORWLBKCFGHDPQTUVXZMYNAE UNCERNEATHTHEGAZEOFRRIKRSBELTWHERETHESEARFTRANQUILITYMEETSTHEECGERFQF     79%
13:35:01   6440 BCDFLUVXZTHKPQGYNAEMSORWI UNDERNEATHTHEGAZEOFORIONSUELTWHERETHESEAOFTRANQUITIGYMEETSTHEEDGEOFF      83%
13:35:04  13048 ISORWLBCDFGHPKQTUVXZMYNAE UNDERNEATHTHEGAZEOFORIONSBELTWHERETHESEAOFTRANQUILITYMEETSTHEEDGEOFQF     85%
13:35:06   6440 BCDFLHKPQGUVXZTYNAEMSORWI UNDERNEATHTHEGAZEOFORIONSBELTWHERETHESEAOFTRANQUILITYMEETSTHEEDGEOFQF     87%

Candidate solution found!
Key: BCDFLHKPQGUVXZTYNAEMSORWI
Bigraph/Trigraph Score: 87%

Plain Text:
UNDERNEATHTHEGAZEOFORIONSBELTWHERETHESEAOFTRANQUILITYMEETSTHEEDGEOFTWILIGHTLIESAHIDDENTROVEOFWISDOMFORGOTTENBYMANYCOVET
EDBYTHOSEINTHEKNOWITHOLDSTHEKEYSTOUNTOLDPOWERASTHENORTHSTARSTANDSASTHESILENTSENTINELTHEPATHTOTHETROVEREVEALSITSELFONLYU
NDERTHESILVERYGLOWOFTHEMOONATITSZENITHDECIPHERTHEWHISPERSOFTHEANCIENTCONSTELLATIONSLETTHEMGUIDEYOUTHROUGHTHEDARKNESSAND
YOUSHALLUNLOCKTHESECRETSTHATLIEBENEATHTHECELESTIALTAPESTRYBUTREMEMBERTHEPATHISFRAUGHTWITHCHALLENGESMEANTONLYFORTHEWORTH
YPERSISTANDLETNOTTHEENIGMATICCOSMOSDETERYOURRESOLVEFORTHOSEWHODARETOUNDERTAKETHISIOURNEYTHECELESTIALREALMPROMISESENLIGH
TENMENTBEYONDMORTALCOMPREHENSION

Segmented Plain Text:
UNDERNEATH THE GAZE OF ORIONS BELT WHERE THE SEA OF TRANQUILITY MEETS THE EDGE OF TWILIGHT LIES A HIDDEN TROVE OF
WISDOM FORGOTTEN BY MANY COVETED BY THOSE IN THE KNOW IT HOLDS THE KEYS TO UNTOLD POWER AS THE NORTHSTAR STANDS AS THE
SILENT SENTINEL THE PATH TO THE TROVE REVEALS ITSELF ONLY UNDER THE SILVERY GLOW OF THE MOON AT ITS ZENITH DECIPHER THE
WHISPERS OF THE ANCIENT CONSTELLATIONS LET THEM GUIDE YOU THROUGH THE DARKNESS AND YOU SHALL UNLOCK THE SECRETS THAT
LIE BENEATH THE CELESTIAL TAPESTRY BUT REMEMBER THE PATH IS FRAUGHT WITH CHALLENGES MEANT ONLY FOR THE WORTHY PERSIST
AND LET NOT THE ENIGMATIC COSMOS DETER YOUR RESOLVE FOR THOSE WHO DARE TO UNDERTAKE THIS I OUR NEY THE CELESTIAL REALM
PROMISES ENLIGHTENMENT BEYOND MORTAL COMPREHENSION

English Word Score: 91%
Accepted solution.
</pre>


Cython
------

Python is actually very slow at character-by-character string manipulation. Unfortunately,
that's exactly what the inner loop of `Playfair.decrypt()` is doing. We can use Cython
to optimize the performance critical section of the code:


    @cython.boundscheck(False)
    @cython.wraparound(False)
    cpdef str playfair_decrypt(str cipher_text, str key):
        """
        Decrypt the given cipher text using the Playfair cipher with the provided key.

        Arguments:
        cipher_text -- The encrypted text. Must contain an even number of uppercase letters.
        key -- The key for decryption. Must be exactly 25 uppercase letters.

        Returns:
        The decrypted text.
        """
        cdef int i, j
        cdef int n = len(cipher_text)

        # populate a reverse lookup table
        cdef int[25][2] reverse_lookup
        for i in range(25):
            j = playfair_ord(key[i])
            reverse_lookup[j][0] = i // 5
            reverse_lookup[j][1] = i % 5

        # Allocate memory for the result
        cdef char* decrypted_text = <char*>malloc(n+1)
        if not decrypted_text:
            raise MemoryError()

        # decrypt playfair cipher
        cdef int x1, x2, y1, y2
        try:
            # Loop over the characters in cipher_text
            for i in range(0, n, 2):
                x1, y1 = reverse_lookup[playfair_ord(cipher_text[i])]
                x2, y2 = reverse_lookup[playfair_ord(cipher_text[i+1])]

                if x1 == x2:
                    decrypted_text[i] = key[5*x1 + (y1-1)%5]
                    decrypted_text[i+1] = key[5*x2 + (y2-1)%5]
                elif y1 == y2:
                    decrypted_text[i] = key[5*((x1-1)%5) + y1]
                    decrypted_text[i+1] = key[5*((x2-1)%5) + y2]
                else:
                    decrypted_text[i] = key[5*x1 + y2]
                    decrypted_text[i+1] = key[5*x2 + y1]

            # Null-terminate the string
            decrypted_text[n] = b'\0'

            # Convert the byte array back to a Python string to return it
            return decrypted_text.decode('utf-8')

        finally:
            # Free the allocated memory
            free(decrypted_text)


Hyperparameter Optimization
---------------------------

TODO: choosing optimal temperature and cooling rate parameters for simulated annealing.

    def crack(ciphertext, params):
        for _ in range(MAX_ATTEMPTS):
            key, score = mp.parallel_crack(
                ciphertext,
                initial_temperature=params['initial_temperature'],
                cooling_rate=params['cooling_rate']
            )
            score, english = evaluate(ciphertext, key)
            if english > mp.acceptance_threshold:
                break
        return key, score, english

We want to crack ciphers quickly, so we'll time each attempt

    def objective(params):
        for i in range(N_REPEATS):

            # create a new problem each repeat
            true_key = PlayfairCipher.make_random_key()
            cipher = PlayfairCipher(true_key)
            ciphertext = cipher.encrypt(plaintext)

            # measure time to crack
            start_time = time.time()
            key, score, english = crack(ciphertext, params)
            end_time = time.time()
            duration = end_time - start_time

        # hyperopt boilerplate omitted 

        return {
            'loss': df['duration'].mean(),
            'loss_variance': df['duration'].var(),
            'status': STATUS_OK,
            # other metrics omitted
        }

Let's ask hyperopt to find us the optimal parameters. 


    def hyperoptimize(trials=None):
        if trials is None:
            trials = Trials()

        space = {
            'initial_temperature': hp.loguniform(
                'initial_temperature', 
                low=np.log(1e-5), 
                high=np.log(1e-3)),
            'cooling_rate': hp.loguniform(
                'cooling_rate', 
                low=np.log(0.0001), 
                high=np.log(0.0003)),
        }

        best = fmin(
            fn=objective,
            space=space,
            algo=tpe.suggest,
            trials=trials,
            max_evals=N_TRIALS)

        return best, trials

When using the best parameters, we can crack messages in about 30 seconds. 

<img src="/post/playfair_files/hyperopt_initial_temperature.png">

<img src="/post/playfair_files/hyperopt_cooling_rate.png">

Conclusion
----------

Microseconds is hyperbole.