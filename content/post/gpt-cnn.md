---
title: "A Picture is Worth 170 Tokens: How Does GPT-4o Encode Images?"
author: "Oran Looney"
date: 2024-06-05
publishdate: 2024-06-05
tags:
  - Machine Learning
  - LLM
  - CNN
image: /post/gpt-cnn_files/lead.jpg
---

Here's a [fact][GOP]: GPT-4o charges 170 tokens to process each `512x512` tile
used in high-res mode. (They also charge 85 tokens for the low-res master
thumbnail, but let's focus on the `512x512` tiles to start with.) At 0.75
tokens/word, this suggests a picture is worth about 227 words - only a factor
of four off from the traditional saying.

OK, but *why* 170? It's an oddly specific number, isn't it? OpenAI uses round
numbers like "$20" or "$0.50$ in their pricing, or powers of 2 and 3 for their
internal dimensions. Why choose a numbers like 170 in this instance?

Numbers that are just dropped into the codebase without explanation are called
"[magic numbers][MNP]" in programming, and 170 is a pretty glaring magic
number.

And why are image costs even being converted to token counts anyway? If it were
just for billing purposes, wouldn't it be less confusing to simply list the
cost per tile?

What if OpenAI chose 170, not as part of some arcane pricing strategy, but
simply because it's literally true? What if image tiles are represented
internally as 170 consecutive tokens? And if so, how?

Embeddings
----------

The first thing to recall about the transformer model is that it operates on
vectors, not discrete tokens. They *have* to be vectors, or the dot product
similarity at the heart of transformers wouldn't make any sense. Tokens are
converted to embedding vectors by an embedding model before they even hit the
first layer of the transformer model.

For example, Llama 3 uses 4,096 feature dimensions internally, so 10 input
tokens are converted `10x4096` matrix. That's the "real" input into a
transformer model.

But there's no law that says that these vectors **must** come from a token
embedding model. That's a strategy that works well for text data, but if we
have data in a different format that we want to represent to a transformer
model we can simply use a different strategy. 

We know that OpenAI has been thinking along these lines for a while now because
in 2021 they released the [CLIP embedding model][CLIP]; CLIP embeds both text
and images into the same semantic space, allowing you to use cosine similarity
to find images related to text strings, or images which are semantically
similar to other images. You can try the [demo][CD] on hugging face to get a
feel for how it works:

<a href="https://huggingface.co/spaces/vivien/clip"><img src="/post/gpt-cnn_files/clip_demo.png"></a>

However, CLIP embeds the entire image as a single vector, not 170 of them.
GPT-4o must be using a different, more advanced strategy internally to
represent images (and likewise voice and potentially other kinds of data;
that's why it's their "omni-modal" model.)

Let's see if we can't deduce what that "different strategy" might be for image
data.

Number of Feature Dimensions
----------------------------

We don't know what number of dimensions GPT-4o uses internally to represent
features because that's proprietary, but we can make some reasonable
assumptions:

OpenAI seems to likes powers of 2, sometimes with a factor of 3 mixed in. For
example, they used 1,536 for [ada-002][ADA] embeddings or 3,072 for
[text-embedding-3-large][TE3]. GPT-3 is known to use [12,288 dimensions
throughout][GPT3].

It doesn't seem likely that the number of embeddings would have gone down from
GPT-3 to GPT-4o, but it's possible. Releases like GPT-4 Turbo were actually
faster and cheaper than earlier version, and a reduction in embedding dimension
may have been part of that if the developers had benchmarks showing that the
smaller size was just as good in terms of quality.

So, it's likely that the number of feature dimensions used inside of GPT-4o is
one of these:

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
                <td align="center">$2{,}048$</td>
                <td align="center">$2^{11}$</td>
            </tr>
            <tr>
                <td align="center">$3{,}072$</td>
                <td align="center">$3 \cdot 2^{10}$</td>
            </tr>
            <tr>
                <td align="center">$4{,}096$</td>
                <td align="center">$2^{12}$</td>
            </tr>
            <tr>
                <td align="center">$12{,}228$</td>
                <td align="center">$3 \cdot 2^{12}$</td>
            </tr>
            <tr>
                <td align="center">$16{,}384$</td>
                <td align="center">$2^{14}$</td>
            </tr>
            <tr>
                <td align="center">$24{,}576$</td>
                <td align="center">$3 \cdot 2^{13}$</td>
            </tr>
        </tbody>
    </table>
</div>

For the sake of argument, I'll assume that GPT-4o is using 12,228 for the
dimension of its embedding vectors. It doesn't really matter if we're of by a
factor of 2 or 4; the same arguments will work.


Representing Images
-------------------

Image tiles are square, so are likely represented by a square grid of tokens.
170 is very close to `13x13`. The extra token could a single embedding vector
which encodes a kind of "gestalt impression" of the entire image, exactly as
CLIP does. 

So the question is, how do we go from `512x512x3` to `13x13x12228`?

### Strategy 1: Raw Pixels

Here's an extremely simple way to stuff an image into the embedding space:

1. Divide the `512x512` into a `8x8` grid of "mini-tiles."
2. Each mini-tile is `64x64x3`; flatten it a vector of dimension 12,228.
3. Each mini-tile is a single embedding vector.
4. The entire image tile is represented as 64 consecutive vectors.

There are two main problems with this approach:

1. 64 &ne; 170, and
2. it's extremely stupid.

By "extremely stupid" I mean that it doesn't make much sense to embed using raw
RGB values and hope the transformer can handle it. For example, if the image is
shifted one pixel to the left, tokens generated in this way would suddenly have
very low similarity; there's no translational invariance. And that's just a
small taste of what goes wrong.

No, we should probably used a model that is designed and proven to be able
to handle image data.

### Strategy 2: CNN

Just to get a sense of what the options are, let's take look at a classic CNN
architecture, [AlexNet][AN]:

<img src="/post/gpt-cnn_files/alexnet.png">

The basic building blocks are:

1. Convolution Layer. These scan over an image in $k \times k$ sized blocks,
   training small a small neural network. 
2. Max Pool Layer. These also look at a $k \times k$ block, but simply take the
   maximum value from each. 

Next, let's take a look at a slightly newer (circa 2018) CNN, one that's a 
little closer in spirit to what we'll need for GPT-4o, [YOLOv3][YV3]:

<img src="/post/gpt-cnn_files/yolo_v3.png">

Here, the notation "xN" means that the entire block is repeated N times. YOLOv3
is 10 times as deep as AlexNet but is still very similar in some regards.

The main differences (which are characteristic of newer CNN architectures) are:

1. A preference for `3x3` over larger kernels.
2. The use of "stride 2" convolutional layers instead of max pool layers. These
   achieve the same step down in dimension but are thought to lose less
   information.
3. The use of skip connections, show here as residual "layer," which simply add
   on the contribution from an earlier layer to [prevent training degradation.][RNN]
4. Fully convolutional, no fully connected layers. It doesn't go all the way
   down to a single output class, but stops as `13x13`.

This last point is crucial: YOLO doesn't predict just one class for the entire
image; it predicts an entire *grid* of object classes. (It also does some stuff
with bounding boxes that we'll ignore for now.) That's how it can see a large
number of different objects in the same image in a single pass. Hence the name:
You Only Look Once. This is basically what I think our hypothetical GPT-4o CNN
must do too, only it's output is a `13x13` grid of feature vectors.

These examples give us a pretty good sense of what a "best practice" CNN would
look like. All we have to now is play a little game of connect the dots. How
can we go from `512x512x3` to `13x13x12228`, using standard CNN building blocks?

Note: in the below I use the so-called "[valid][VP]" padding strategy because
I'm interested in stepping down the dimension and am not worried about keeping
the dimension exactly the same so that we can repeat blocks or use skip
connections. The practical upshot is that we lose a few dimensions ($k-1$ for 
a $k \times k$ kernel) each time we apply a convolution layer.

<!--
There's another decision which is important in determining output dimension:
the padding strategy. When a CNN kernel runs over the input layer, we have two
choices on how to handle the edges. 

Option One: we can simply start the kernel a little bit inside the image so it
doesn't go outside, and stop a little early on the other side. For example,
let's say we have a `3x3` kernel. Instead of looping from `(0, 0)` to `(width -
1, height - 1)`, we start with the kernel centered at (1, 1) and run to `(width
- 2, height 2)`. This strategy is called "valid" padding or no padding. A layer
with a $k \times k$ kernel that uses valid padding reduces the output dimension
by `k - 1`. 

Option Two: we can run the kernel from `(0, 0)` to `(width - 1, height - 1)`
but when we hit the edge and the kernel goes out of bounds, we'll pretend
like there are zeros everywhere outside the original dimensions. This strategy
is called "zero" padding. This keeps the output dimension exactly the same as
the input dimension. 
-->

I tried
<a href="/post/gpt-cnn_files/gpt4o_speculative.png" target="_blank">several</a>
<a href="/post/gpt-cnn_files/gpt4o_speculative4.png" target="_blank">different</a>
<a href="/post/gpt-cnn_files/gpt4o_speculative2.png" target="_blank">variations</a>,
but most of these
required special cases on one or more layers to "fit." Until I found this one,
which steps down elegantly with no special cases at all:

<img src="/post/gpt-cnn_files/gpt4o_speculative3.png">

It fits very neatly, doesn't it? From 512 to 13 dimensions in 5 identical
blocks, while simultaneously quadrupling the number of channels with each
block to hit the 3,072 number of features dimensions that we assumed.
Unfortunately, it also feels a little outdated because of the `5x5` kernels and
max pool layers. 

Here's an alternative that *almost* worked (got to `12x12` instead of `13x13`)
while staying closer to the YOLO design:

<img src="/post/gpt-cnn_files/gpt4o_speculative4.png">

While impossible to prove, these speculative designs demonstrate that there are
plausible CNN architectures that could represent an image as a $k \times k$
grid of embedding vectors.


Experimental Validation
-----------------------

Does GPT-4o really see a `13x13` grid of semantic feature vectors? I invented
a task, loosely inspired by [Zener cards][ZC], to test this. The task is to
identify the color and shape for every symbol on a grid in an image.

I wrote a [simple program][ZP] to generate test grids that look like this:

<img src="/post/gpt-cnn_files/zener_5x5.png">

I then used this prompt to obtain comparison data:

    """Divide this image into a {k}x{k} grid and describe the shape and color of
    each cell. Report your results as a JSON array of array (no objects or row
    labels) and use all lowercase."""

If the `13x13` tokens hypothesis is correct, GPT-4o should do well on this task
up to about 13 and then performance should degrade. The CNN isn't literally
dividing the image up into a grid so it might start to degrade before then,
and might struggle more with even grid sizes than odd because the cells won't
be aligned.

However, that is not in fact what happens. Instead, performance is perfect for
`5x5` grids and smaller (e.g. [`2x2`][Z2], [`3x3`][Z3], [`4x4`][Z4]) but began
to degrade rapidly after that, and by the time we reach `13x13` it was no
better than chance.

For example, here is a `7x7` grid:

<img src="/post/gpt-cnn_files/zener_7x7.png">

For which GPT-4o returned this:

    [
        ["blue diamond", "purple triangle", "red plus", "purple circle", "orange square", "purple circle", "blue circle"],
        ["blue diamond", "red circle", "green plus", "red square", "orange diamond", "blue triangle", "purple plus"],
        ["blue diamond", "orange triangle", "red square", "orange square", "blue plus", "purple circle", "blue circle"],
        ["green diamond", "blue circle", "orange circle", "green circle", "purple diamond", "green triangle", "orange diamond"],
        ["purple square", "purple circle", "green plus", "green diamond", "green circle", "blue triangle", "purple triangle"],
        ["red plus", "red triangle", "purple circle", "blue triangle", "orange triangle", "red diamond", "orange diamond"],
        ["orange plus", "blue diamond", "green triangle", "green plus", "green triangle", "purple diamond", "purple square"]
    ]

It got 38/49 correct - an accuracy of 76%. The exact pattern of hits and
misses looks like this (yellow is correct, purple incorrect):

<img src="/post/gpt-cnn_files/zener_7x7_results.png">

Performance continues to degrade as the grid size increases and by the time we
get to the `13x13` grid:


<img src="/post/gpt-cnn_files/zener_13x13.png">

The results are no better than chance:

<img src="/post/gpt-cnn_files/zener_13x13_results.png">


Does that mean I was wrong about 169 tokens representing a `13x13` grid?
Yes. Yes it does. My disappointment is immeasurable and my day is ruined.

> "The great tragedy of science: the slaying of a beautiful hypothesis by an ugly fact." - Thomas Huxley 

But the `5x5` grid results are suggestive. It really can keep track of 25
distinct objects and their absolute positions within in the image. Maybe the
basic concept is right, I just got the dimension wrong. It would be easy
to tack on another couple of layers to our CNN to get down to `5x5` instead
of `13x13`:

<img src="/post/gpt-cnn_files/gpt4o_speculative5.png">

How could we structure the data to reach 170 tokens if we assume we only use
`5x5` grids and smaller?


Pyramid Strategy
----------------

One way to get close to both 85 and 170 is to assume that we encode the image
in a series of increasingly granular levels, like a pyramid. We start with 1
embedding vector to capture a gestalt impressions of the whole image, add a
`3x3` to capture left/middle/right and top/middle/bottom, then adding a `5x5`,
`7x7` etc.

<img src="/post/gpt-cnn_files/grids.png">

This strategy gets us very close to 85 tokens for the master thumbnail if
we stop at `7x7`:

$1^2 + 3^2 + 5^2 + 7^2 = 1 + 9 + 25 + 49 = 84$

And very close to 170 if we add one final `9x9` grid:

$1^2 + 3^2 + 5^2 + 7^2 + 9^2 = 1 + 9 + 25 + 49 + 81 = 165$


If we throw in an *ad hoc* `2x2` grid for the `512x512` tile and assume one
special `<|image start|>` for each, we can get a perfect match:

$1 + 1^2 + 3^2 + 5^2 + 7^2 = 1 + 1 + 9 + 25 + 49 = 85$

$1 + 1^2 + 2^2 + 3^2 + 5^2 + 7^2 + 9^2 = 1 + 1 + 4 + 9 + 25 + 49 + 81 = 170$

This scheme lacks any sort of delimiters for the start and end of a row, but
I think that could be handled with positional encoding similar to the way
[RoPE][RoPE] is used to encode position for text tokens, but in 2D. 

The above takes only odd grid sizes and goes past `5x5`. Given that the Zener
grid performance starts to fall off after `5x5`, taking all the grids (even and
odd) up to 5 makes sense:

<img src="/post/gpt-cnn_files/grids2.png">

This approach gives us 55 tokens:

$1^2 + 2^2 + 3^2 + 4^2  + 5^2 = 55$

If we assume 3 tokens per mini-tile and a delimiter token between each, we
can get to 170:

$3 \times (1^2 + 2^2 + 3^2 + 4^2  + 5^2) + 5 = 170$

This isn't fully satisfactory on numerological grounds but does jive well with
the empirical results so I'm going put it down as my final answer. The pyramid
strategy has a lot of intuitive appeal - it feels like an almost "obvious" way
to encode spatial information at different zoom levels - and may explain why
it does so well with the `5x5` grid and below and so poorly on `6x6` and above.


OCR
---

The one thing that none of the above grid hypotheses explain is how GPT-4o is
doing OCR. YOLO and CLIP can't do OCR, and the strategies suggested above seem
like they would struggle for the same reasons. I mean, if it can't read off 36
symbols in a neat `6x6` grid from an image, it certainly can't read off a
several hundred text characters flawlessly. And yet GPT-4o patently *can* do
high-quality OCR: it can transcribe long blocks of text, read handwritten text,
or text which has been shifted, rotated, projected, partially occluded, etc.


I have another theory for that: I think they're running [Tesseract][TS] (or
their own in-house OCR) and feeding the identified text into the transformer
alongside the image data. I mean, that's what I would do.

This would explain why the early versions were so easily confused by text
hidden in images: from its POV, that text *was* part of the prompt. (This is
fixed now; GPT-4o is good at ignoring malicious embedded prompts.) Malicious
prompt rejection example. However, this does not explain why there's no charge
per token for the text found in an image.

Interestingly enough, this seems to suggest its actually *more efficient* to
send text as images: A `512x512` image with a small but readable font
can easily fit 400-500 tokens worth of text, yet you're only charged for 170
input tokens plus the 85 for the master thumbnail for a grand total of 255
tokens - far less than the number of words on the image.

This theory explains why there is additional latency when processing images.
The CNN would be essentially instantaneous, but 3rd-party OCR would add
additional time. BTW (and I'm not saying this proves anything) but the Python
environment used by the OpenAI code interpreter has [PyTesseract][PTS] installed. You
can literally just ask it to run PyTesseract on any image you've uploaded if
you want to get a second opinion.


Conclusion
----------

Well, we've made a lot of speculative hay out of what is essentially only one
morsel of hard fact: that OpenAI used the magic number 170.

However, there does seem to be a complete plausible approach, very much in line
with other best practice CNN architectures such as YOLO, for mapping from
image tiles to embedding vectors.

So, I don't think 170 tokens is just an approximation used to bill for roughly
the amount of compute it takes to process an image. And I don't think they're
concatenating layers to join image and text data the way some other multi-modal
models do.

No, I think GPT-4o is *literally* representing `512x512` images as 170
tokens, using an CNN architecture very similar to YOLO to embed the image
directly into the transformers semantic feature space.

When I started this article, I was entirely convinced that I had cracked it
entirely, that I was going to find that the 170 tokens were for a `13x13` grid
and one additional "gestalt impression" token. That got blown out of the water
when performance on the Zener task started to degrade after `5x5` - whatever
they're doing internally, it's certainly a lot smaller than `13x13`.

Still the analogy to YOLO is compelling, and the performance on the `5x5` Zener
task all but confirms that they're doing some kind of grid. This theory has
a lot of predictive power: it explains how GPT-4o is able to handle multiple
images, and tasks like comparing two images, for example. It explains how its
able to see multiple objects in the same image, but gets overwhelmed when there
are too many objects in a busy scene. And it explains why GPT-4o seems
extremely vague and the absolute and relative positions of separate objects
within the scene. 

Ironically, the one thing this theory can't cleanly explain is the question
which motivated this article in the first place: why 170 tokens in particular?
The pyramid theory (`1x1 + 2x2 + 3x3 + 4x4 + 5x5`) was the best I was able to
come up with, and it's not particularly neat.

TODO: Question

<!-- https://unsplash.com/photos/black-and-gray-camera-on-white-table-Y5dd6hLkn-8 -->


Postscript: Alpha Channel Shenanigans 
--------------------------------------

One interesting thing I noticed is that GPT-4o *ignores* the alpha channel,
resulting in somewhat counter-intuitive behavior.

When I say, "ignores", I don't mean that it gets rid of transparency by
compositing it onto some default background, the way an image editor might
when convert PNG to JPG. No, I mean it literally just grabs the RGB channels
and ignores the alpha channel.

We can illustrate this with four carefully prepared images. For convenience,
These images are displayed on top of a checkerboard pattern - the images
themselves have flat, transparent backgrounds.

What do I mean by "transparent black" or "transparent white?" Well, when
we represent an RGBA color with four bytes, the RGB bytes are still there
even when alpha is 100%. `(0, 0, 0, 255)` and `(255, 255, 255, 255)` are
in some sense different colors, even though there's no situation where a
correct renderer would display them differently since they're both 100%
transparent.

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
three RGB channels while setting the alpha channel to 100%. Here's a little
Pillow function to do that:


    from PIL import Image

    def set_alpha(image, output_path, alpha_value):
        # copy the image and ensure it's RGBA
        image = image.convert("RGBA")

        # set the alpha channel of every pixel to the given value
        pixels = image.getdata()
        new_pixels = [(r, g, b, alpha_value) for r, g, b, a in pixels]
        image.putdata(new_pixels)

        return image


I used that to make the two images below; they have identical RGB data, and
only differ in the alpha channel:

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

You can try downloading the 
<a href="/post/gpt-cnn_files/platypus_hidden.png" download>`hidden_platypus.png`</a> 
image and dropping it into ChatGPT yourself; it will correctly describe it. 
You may also note the image is 39.3 KB, the same size as
<a href="/post/gpt-cnn_files/platypus.png" download>`platypus.png`</a> 
even though PNG compression should have made it much smaller if it was really
a perfectly blank, transparent image. Or you can use the above function to
set the alpha channel back to 255, recovering the original image.

I'm not sure if this is bug but its certainly [surprising][PLS] behavior; In
fact, it feels like something a malicious user could use to smuggle information
past humans and directly to GPT-4o. However, GPT-4o is *much* better at
detecting and ignoring malicious prompts hidden in images:

<img src="/post/gpt-cnn_files/gpt4o_malicious_test1.png">

(You can see several other examples of GPT-4o successfully detecting and
ignoring malicious prompts hidden in images in my [gallery of GPT-4o test
images][ITG] generated by my [`image_tagger`][IT] utility.)

So even if it is a bug, it's not obvious it can be exploited. Still, it would
be less surprising in GPT-4o "saw" the same thing that a human would in a
browser.

[AN]: https://en.wikipedia.org/wiki/AlexNet
[IT]: https://github.com/olooney/image_tagger
[ITG]: https://olooney.github.io/image_tagger/gallery/index.html
[RNN]: https://en.wikipedia.org/wiki/Residual_neural_network
[PLS]: https://en.wikipedia.org/wiki/Principle_of_least_astonishment
[RoPE]: https://blog.eleuther.ai/rotary-embeddings/
[GOP]: https://openai.com/api/pricing/
[MNP]: https://en.wikipedia.org/wiki/Magic_number_(programming)
[ADA]: https://openai.com/index/new-and-improved-embedding-model/
[TE3]: https://platform.openai.com/docs/guides/embeddings/embedding-models  
[ZC]: https://en.wikipedia.org/wiki/Zener_cards
[ZP]: https://gist.github.com/olooney/07850f0a2f0fcaac973ffabac765454a
[Y10]: https://github.com/THU-MIG/yolov10
[YV3]: https://arxiv.org/abs/1804.02767
[CLIP]: https://openai.com/index/clip/
[CD]: https://huggingface.co/spaces/vivien/clip

[Z2]: /post/gpt-cnn_files/zener_2x2.png
[Z3]: /post/gpt-cnn_files/zener_3x3.png
[Z4]: /post/gpt-cnn_files/zener_4x4.png
[TS]: https://en.wikipedia.org/wiki/Tesseract_(software)
[PTS]: https://pypi.org/project/pytesseract/
[GPT3]: https://dugas.ch/artificial_curiosity/GPT_architecture.html
[VP]: https://stackoverflow.com/questions/37674306/what-is-the-difference-between-same-and-valid-padding-in-tf-nn-max-pool-of-t
