---
title: "A Picture is Worth 227 Words - Speculating About GPT-4o Internals"
author: "Oran Looney"
date: 2024-05-27
publishdate: 2023-05-27
tags:
  - Machine Learning
  - LLM
  - CNN
image: /post/gpt-cnn_files/lead.jpg
---

**DRAFT DO NOT PUBLISH**


Problem Statement
-----------------

TODO: punchy intro

GPT-4o charges 170 tokens to process each $512 \times 512$ tile used in high-res mode.
(Ignoring the 85 token for the low-res "master thumbnail".) 
At 0.75 tokens/word, this suggests a picture is worth about 227 words - only
a factor of four off from the traditional saying.

OK, but why 170? It's an oddly specific number. It's not power of 2 or a
multiple of 5 the way most "round" numbers are. Numbers that are just dropped
into the codebase without explanation are called "[magic numbers][MNP]" in
programming, and 170 is a pretty glaring magic number.

[MNP]: https://en.wikipedia.org/wiki/Magic_number_(programming)

And why are image costs even converted to tokens anyway? If it were just for
billing purposes, wouldn't it be less confusing to simply list the cost per tile?

What if OpenAI chose 170, not as part of some arcane pricing strategy, but
simply because it's literally true? What if image tiles are represented
internally as 170 consecutive tokens? And if so, how?


Making Assumptions
------------------

OpenAI seems to likes powers of 2, sometimes with a factor of 3 mixed in.
For example, 1,536 (ada-002) or 3,072 (text-embedding-3-large)

Alternatively, image tiles are square, so are likely represented by a square grid of tokens.
Following the "powers of 2s and 3s" logic, 170 might be 512/3.
Following the square logic, 170 is very close to $13 \times 13$.

TODO: recall that "tokens" are represented internally in transformer models
as vector embeddings.

It's likely that a the internal vector dimension used to represent tokens
inside of GPT-4o is one of these:

<div style="width: 50%; margin: auto">
    <table>
        <thead>
            <tr>
                <th align="center">Dimension</th>
                <th align="center">Prime Factors</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td align="center">$1{,}536$</td>
                <td align="center">$3 \cdot 2^9$</td>
            </tr>
            <tr>
                <td align="center">$2{,}024$</td>
                <td align="center">$2^{11}$</td>
            </tr>
            <tr>
                <td align="center">$3{,}072$</td>
                <td align="center">$3 \cdot 2^{10}$</td>
            </tr>
            <tr>
                <td align="center">$4{,}048$</td>
                <td align="center">$2^{12}$</td>
            </tr>
        </tbody>
    </table>
</div>

Let's say it's 3,072 for the sake of argument.
How do we go from $ 512 \times 512 \times 3 $ to $170 \times 3{,}072$?

### Strategy 1: Raw Pixels

Here's an extremely simple way to stuff an image into the embedding space:

1. Divide the $512 \times 512$ into a $16 \times 16$ grid of "mini-tiles."
2. Each mini-tiles is $32 \times 32 \times 3$, for a total size of $3{,}072$.
3. Each mini-tile can be embedded a a single token.
4. Represent the image as 256 consecutive tokens.

There are two main problems with this approach:

1. 256 is larger than 170, and
2. it's extremely stupid.

By "extremely stupid" I mean that it doesn't make much sense to embed using raw
RGB values and hope the transformer can handle it. The transformer architecture
is optimized for text, not images, and this brute force way of stuffing data in
gives us no way to map into the same "semantic space" used by token embeddings.

### Strategy 2: CNN

TODO Discuss AlexNet and YOLOv3


<img src="/post/gpt-cnn_files/layers_alexnet.png">
Note: AlexNet was designed to work on $227 \times 227$ pixels. I've adjusted it to match the $512 \times 512$ input.


<img src="/post/gpt-cnn_files/layers_yolo_v3.png">
Note: YOLOv3 was designed to work on $416 \times 416$ pixels. I've adjusted it to match the $512 \times 512$ input.

TODO: explain why YOLO ends in a grid instead of a single output, bounding boxes, etc.

Suggest 3x3 and 5x5 versions


<img src="/post/gpt-cnn_files/layers_3x3_speculative.png">


If you use $5 \times 5$ convolution layers alternating with $2 \times 2$
max pool layers, all the math works beautifully without any special cases:

<img src="/post/gpt-cnn_files/layers_5x5_speculative.png">

The $5 \times 5$ version seems to fit extremely neatly, reaching our target
size of $13 \times 13$ and target embedding dimension of 3,072 without any
special cases. At 16-bit precision, this uses a maximum of about 12 GB of VRAM
so can be run quickly on an inexpensive, commodity GPU.

However, $5 \times 5$ convolutions aren't very common in best-practice CNN
Architectures, so maybe it's using two back-to-back $3 \times 3$ convolutions,
similar to the VGG16 architecture:

<!-- <img src="/post/gpt-cnn_files/layers_3x3_vgg_speculative.png"> -->


<img src="/post/gpt-cnn_files/layers_3x3_vgg_short_speculative.png">

This gets us roughly the same effect, but at the cost of more layers. 


Once we've transformed the image tensor from $512 \times 512 \times 3$
to $13 \times 13 \times 3{,}072$, we can represent them to the transfomer
as 169 consecutive embedding vectors.

Add one token for flag the start of an image block:

    <| Image Tile Start |>
    3,072 channels from (0,0)
    3,072 channels from (1,0)
    ...skipping 166 similar embedding vectors...
    3,072 channels from (13,13)

(Alternatively, perhaps its $12 \times 12$ with special tokens for start, end, and "row" delimiter.)
Note that RoPE (Rotary Position Embedding) should help GPT-4o understand the approximate positions of tokens within the image, but not perfectly.


Semantics
---------

TODO 

Problem: Aligning image semantics with token semantics

Possible Solution: Train the CNN to predict the embedding vector for the tagged token
For example, if there's a cat in the upper left, train it to predict the 3,072-dimension embedding vector for the token "cat".

Possible Solution 2: End-to-End training

OCR
---

This does *NOT* explain how it does OCR.
YOLO can't really do OCR, especially not the high-quality OCR GPT-4o exhibits.
I have another theory for that: I think they're running tesseract (or their own in-house OCR) and feeding the identified text in alongside the image data.
I think that is why the early versions could be easily confused by text hidden in images; from its POV, that text *was* part of the prompt.
 (This is fixed now; GPT-4o is good at ignoring malicious embedded prompts.)
Malicious prompt rejection example.
However, this does not explain why there's no charge per token for the text found in an image.

Interestingly enough, this seems to suggest its actually *more efficient* to
send text as images:A $512 \times 512$ image with a small but readable font
can easily fit 400-500 tokens worth of text, yet you're only charged for 170
input tokens plus the 85 for the master thumbnail for a grand total of 255
tokens - far less than the number of words on the image.

This theory explains why there is additional latency when processing images.
The CNN would be essentially instaneous, but OCR takes a bit of time.BTW,
and I'm not saying this proves anything, but the Python environment used by the
OpenAI code interpreter has pytesseract installed. You can literally just ask
it to run pytesseract on any image you've uploaded if you want to get a second
opinion.


Conclusion
----------

Well, we've made a lot of speculitive hay out of what is essentially only one
morsel of hard fact: that OpenAI used the magic number 170.

However, there does seem to be a complete plausible approach, very much in line
with other best practice CNN architectures such as YOLO, for mapping from
image tiles to embedding vectors.

So, I don't think 170 tokens is just an approximation used to bill for roughly
the amount of compute it takes to process an image. And I don't think they're
concatinating layers to join image and text data the way some other multi-modal
models do.

No, I think GPT-4o is *literally* representing $512 \times 512$ images as 170
tokens, using an CNN architecture very similar to YOLO to embed the image
directly into the transformers semantic embedding space.

The architectures that best "fits" is 5 layers of $5 \times 5$ convolutions alternating with 5 layers of $2 \times 2$ max pooling,
or a similar architecture with two back-to-back $3 \times 3$ convolution layers. 
It's impossible to be that precise, but I think it's roughly in that ballpark.
(Not least because *most* state-of-the-art image classifiers are roughly in the same ballpark.)

This explains how its able to handle multiple images, and tasks like comparing two images, for example.
It explains how its able to see multiple objects in the same image, but gets overwhelmed when there are too many objects in a busy scene.
It also explains why GPT-4o seems extremely vague and the absolute and relative positions of separate objects within the scene; RoPE
can only do so much.

<!-- https://unsplash.com/photos/black-and-gray-camera-on-white-table-Y5dd6hLkn-8 -->


Postscript: Alpha Channel Shenanigans 
--------------------------------------

One curious thing I noticed while working on this project is that GPT-4o
*ignores* the alpha channel, resulting in occasionally suprising behavior.

We can illustate this with four carefully prepared images. For convenience,
These images are displayed on top of a checkboard pattern - the images themselves
have flat, transparent backgrounds.

What do I mean by "transparent black" or "transparent white?" Well, when
we represent an RGBA color with four bytes, the RGB byes are still there
even when alpha is 100%. `(0, 0, 0, 255)` and `(255, 255, 255, 255)` are
in some sense different colors, even though there's no situation where a
correct renderer would display them differently.

<style>
    .grid-container {
        display: grid;
        grid-template-columns: auto auto;
        gap: 10px;
        text-align: center;
    }
    .grid-item {
        padding: 10px;
    }
    .image-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .image-container img {
        margin: 0px;
        padding: 0px;
        max-width: 100%;
        height: auto;
        background: repeating-conic-gradient(#888888 0% 25%, #cccccc 0% 50%) 0 / 20px 20px;
    }
</style>
<div class="grid-container">
    <div class="grid-item">
        <div class="image-container">
            <img src="/post/gpt-cnn_files/black_on_transparent_black.png" alt="MODICUM">
            <div>Black Text on Transparent Black Background</div>
            <div>GPT-4o Reads: ""</div>
        </div>
    </div>
    <div class="grid-item">
        <div class="image-container">
            <img src="/post/gpt-cnn_files/black_on_transparent_white.png" alt="ENORMOUS">
            <div>Black Text on Transparent White Background</div>
            <div>GPT-4o Reads: "ENORMOUS"</div>
        </div>
    </div>
    <div class="grid-item">
        <div class="image-container">
            <img src="/post/gpt-cnn_files/white_on_transparent_black.png" alt="SCINTILLA">
            <div>White Text on Transparent Black Background</div>
            <div>GPT-4o Reads: "SCINTILLA"</div>
        </div>
    </div>
    <div class="grid-item">
        <div class="image-container">
            <img src="/post/gpt-cnn_files/white_on_transparent_white.png" alt="GIGANTIC">
            <div>White Text on Transparent White Background</div>
            <div>GPT-4o Reads: ""</div>
        </div>
    </div>
</div>

What's going on here? The pattern that emerges is that GPT-4o can read the
text if and only if the text color is different than the "color" of the
transparent background.

This tells us that GPT-4o *disregards* the alpha channel and only looks at the
RGB channels. To it, transparent black is black, transparent white is white.

We can see this even more clearly if we mess with an image to preserve the
three RGB channels while setting the alpha channel to 100%. These two images
have identical RGB data, and only differ in the alpha channel:

<div class="grid-container">
    <div class="grid-item">
        <div class="image-container">
            <img src="/post/gpt-cnn_files/platypus.png" alt="Visible Platypus">
            <div>Alpha Channel = 255</div>
        </div>
    </div>
    <div class="grid-item">
        <div class="image-container">
            <img src="/post/gpt-cnn_files/platypus_hidden.png" alt="Hidden Platypus">
            <div>Alpha Channel = 0</div>
        </div>
    </div>
</div>

GPT-4o has no trouble seeing the hidden platypus:

<img src="/post/gpt-cnn_files/chatgpt_hidden_platypus_test.png" alt="ChatGPT passes the hidden platypus test.">

If you don't believe me, download the 
<a href="/post/gpt-cnn_files/platypus_hidden.png" download>`hidden_platypus.png`</a> 
image and paste it into ChatGPT yourself; it will correctly describe it. (DON'T
right-click copy-and-paste - the transparency will be lost as it passes
through the clipboard.) You may also note the image is 39.3 KB, the same
size as
<a href="/post/gpt-cnn_files/platypus.png" download>`platypus.png`</a> 
even though PNG compression should have made it much smaller if it was really
a perfectly blank, transparent image. *You* can't see it, because your browser correctly respects the alpha channel,
but GPT-4o can, because it ignores it completely.

I'm not sure if this is bug but its certainly suprising behavior; In fact,
it feels like something a malicous user could use to smuggle information past
humans and directly to GPT-4o. It's true that GPT-4o is *much* better at
detecting and ignoring malicious prompts hidden in images:


<img src="/post/gpt-cnn_files/gpt4o_malicious_test1.png">

You can see several other examples of GPT-4o successfully detecting and
ignoring malicious prompts hidden in images in my [gallery of GPT-4o test
images][ITG].

[ITG]: https://olooney.github.io/image_tagger/gallery/index.html

So even if it is a bug, it's not obvious it can be exploited. Still, it would
be less suprising in GPT-4o "saw" the same thing that a human would in a
browser.
