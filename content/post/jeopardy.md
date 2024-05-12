---
title: "Let's Play Jeopardy! with LLMs"
author: "Oran Looney"
date: 2024-05-12
publishdate: 2024-05-12
tags:
  - Python
  - Machine Learning
  - LLM
image: /post/jeopardy_files/lead.jpg
---


How good are LLMs at trivia? I used the [Jeopardy! dataset][JKD] from Kaggle to benchmark
ChatGPT and the new LLama3 models.  Here are the results:

<img src="/post/jeopardy_files/benchmark7.png">

There you go. You've already gotten 90% of what you're going to get out of this
article.  Some guy on the internet ran a half-baked benchmark on a
scattered handful of LLM models and approaches, and those results are largely in line with
[popular benchmarks][AA] and received wisdom on fine-tuning and RAG.

Still, the process was interesting, so I'm going to talk about it. At length. You've been warned.

All [code][JPT] for this article is available on Github.


About
-----

A couple of years ago, I found [this fantastic dataset of Jeopardy! questions][JKD]
on Kaggle.  It's 200,000+ question/answer pairs, plus the category (column) and
value (row) of the question.  (Just to be clear, this dataset follows the
convention that the "question" is the prompt that Alex reads, and the "answer"
is what the contestant should respond with... in the form a question, of
course.) Here is a sample:

<style>

    .nowrap {
        white-space: nowrap;
    }
    html .article > table {
        width: 100%;
        border-collapse: collapse;
        border: none;
    }

    html .article > table th {
        border: none;
        border-bottom: 1px solid #800000;
        font-size: 80%;
        color: #800000;
    }

    html .article > table td {
        border: none;
        font-size: 80%;
    }
</style>


| category                  | air_date   | question                                                                                    |   value | answer                   | round            |   show_number |
|:--------------------------|:-----------|:--------------------------------------------------------------------------------------------|--------:|:-------------------------|:-----------------|--------------:|
| THE GOOD BOOK             | <span class="nowrap">2006-05-22</span> | 'Jeremiah asks, "Is there no balm in" this land?'                                           |     400 | Gilead                   | Jeopardy!        |          5006 |
| OLD MEDICINE TERMS        | <span class="nowrap">1999-07-19</span> | 'This name for tuberculosis referred to the wasting away of the patient'                    |     200 | Consumption              | Jeopardy!        |          3441 |
| NUMBER OF LEGS ON...      | <span class="nowrap">2004-03-04</span> | 'A muskellunge'                                                                             |    1600 | 0                        | Double Jeopardy! |          4494 |
| PALINDROMIC WORDS         | <span class="nowrap">2007-12-06</span> | 'It's "the word" when keeping silent'                                                       |     400 | mum                      | Jeopardy!        |          5349 |
| "WA"?                     | <span class="nowrap">2010-05-11</span> | 'This principality united with Moldavia to form Romania'                                    |    1600 | Wallachia                | Double Jeopardy! |          5917 |


I never really did anything with it, but recently I dusted and off
and threw some LLMs at it.

In 2011, Watson playing Jeopardy was a major achievement. In 2024, it's a
weekend project.

The Jeopardy! dataset has a number of features with make it ideal grist for
the LLM and vector embedding mill:

1. Free text data.
2. Comes in handy prompt/response pairs.
3. Exercises knowledge, wordplay, and some inference.
4. Questions are quite short, so no chunking is necessary.
5. Mix of easy and hard questions.
6. Medium difficulty overall, making it suitable for benchmarking.

There's also one undeniable advantage to rolling your own benchmark,
no matter how half-baked: you can be sure that implementors are gaming
the metrics by "teaching to the test" and including benchmark data
in the pre-training or fine tuning of their model. It's widely suspected
that many popular benchmarks are at least a little poisoned in this way.

My goals:

1. Have my own point-of-view on Llama3 vs. ChatGPT. 
2. Prove that fine-tuning actually works.
3. Prove that RAG actually works.

TODO: DQA: value currency and unfair questions.

If you plan to use the Jeopardy! dataset yourself, there are two "gotchas" that
you should be aware of.

1. The "value" column is a currency field with a leading `$` and thousand-separators,
   although this is currently incosistent. 
2. Some questions use audio or visual cues that are represented in the dataset as
   links to external resources. These questions are unfair to the LLMs because the
   clue as given doesn't contain enough information to narrow it down to a unique
   answer. However, even if you remove those, over 200,000 "fair" questions remain.

The function `jpt.load_jeopardy_dataset()` shows how to handle these minor DQA issues.
   

Inference
---------

No API is 100% reliable. OpenAI has been pretty unreliable over the past year, but in all
fairness was pretty solid for this project. The AWS Bedrock API is less mature and
experienced many random failures during this project. 

    # reusable decorator to implement basic retry logic. We make up to three
    # attempts with exponential backoff. 
    retry_decorator = tenacity.retry(
        wait=tenacity.wait_exponential(min=0.1, max=2),
        stop=tenacity.stop_after_attempt(3), 
        after=tenacity.after_log(logger, logging.ERROR),
        reraise=True)

We use three retries because as the old saying goes, "four is too many and two
isn't enough." I don't why this is the case, but every programmer knows it to
be true deep in within their soul. It seems to be part of the shared
subconscious in the same way that [37][37] is the most random number.

Mini rant: a lot of Python programmers seem to think you have copy-paste decorator config for every
single function, but that's not the case. The expression after the `@` symbol just
needs to evaluate to an object which implements the implicit decorator interface - it
must be a callable that accepts a function and returns a function. That's it. That
means we can configure a decorator once, save it as a global variable, then reuse it
as often as we like. DRY! End rant.

Prompt Engineering
------------------

Speaking of DRY, we'll centralize a few other things that will be constant across all contestants,
namely the prompt template and system messages:

    jeopardy_question_template = '''
    CATEGORY: {category}
    {clue}
    '''
    
    system_messages = [
        {
            "role": "system",
            "content": ("You are a contestant on Jeopardy. Each prompt has both the "
                        "category (column header) and Jeopardy clue; answer in the form "
                        "of a question."),
        },
        {
            "role": "user",
            "content": ("CATEGORY: THE BIG APPLE\nThere's an annual footrace up its "
                        "86 flights of stairs"),
        },
        {
            "role": "assistant",
            "content": "What is the Empire State Building?"
        }
    ]

I say "system_messages", but it also includes one example of a correct
question/answer pair. Every LLM will use the exact same prompts so that we have
a level playing field for our benchmark.

A typical contestant looks like this:

    @retry_decorator
    def ken(category: str, clue: str) -> str:
        '''PlayerAgent for GPT-4. Calls OpenAI.'''
        
        prompt = jeopardy_question_template.format(**locals())
        chat_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=system_messages + [
                {"role": "user", "content": prompt}
            ]
        )
        content = chat_response.choices[0].message.content
        return content

Most contestants look very similar to this with variations like using a different model name, swapping `client.chat` for `ollama.chat`,
doing a little formatting for Llama3, etc. The one contestant that's slightly more complicated is our RAG agent:

    @retry_decorator
    def mattea(category: str, clue: str) -> str:
        '''PlayerAgent implementing the RAG pattern. It only knows the
        exact answers to questions from before 2011-01-01. It uses llama3:8b,
        a fast but fairly dumb model, so we can see the bump from RAG clearly.
        '''
        # find similar past questions 
        rag_query = f'CATEGORY: {category}\n{clue}'
        embeddings_old, jeopardy_old = old_jeopardy()
        augment_data = brute_force_search(
            embeddings_old, jeopardy_old, query=rag_query, k=10)
        augment_json = json.dumps(augment_data)

        # augment the prompt with retrieved questions
        prompt = jeopardy_question_template.format(**locals())

        # this looks cheesy, but other attempts to embed the RAG context
        # resulted in Llama3 being confused about which question's were historical
        # and which was actually being asked. This prompt fixed that.
        messages = system_messages + [
            {"role": "user", "content": ("Correct! By the way, here are three historical "
                                         "questions that may help you answer future "
                                         "questions: {augment_json}")},
            {"role": "assistant", "content": ("Thank you, I'll be sure to refer back to "
                                              "those if they help with a question in the "
                                              "future!")},
            {"role": "user", "content": prompt}
        ]

        # use a small, fast model for generation
        response = ollama.chat(
            model='llama3:8b',
            messages=messages
        )
        content = response['message']['content']
        return content

In Jeopardy!, the column category is often essential to keep in mind. It can
provide an initial letter, a word length, a time period, or other essential context without which
the answer might be ambiguous. For that reason, we use it as part of the prompt template.

<img src="/post/jeopardy_files/category_matters.png">

In the first prompt, the category "THREES" is a clue pointing to the "Thrice-Great" alchemist,
while "FRENCH" is the crucial clue that tells us Flamel is probably who is meant. Ken
(who you'll recall from above is a wrapper around `gpt-4-turbo`) is smart enough to use that
context.

Arguably the dollar value should be included as well, since in theory knowing
if the question is supposed to be easy or obscure could help with guessing, but
this is tenuous and I haven't done so here.


TODO: Justify prompt engineering for RAG content.



TODO: OpenAI and local ollama.

Sadly, my graphics card "only" has 12 GB of VRAM, so it can't run the 70b
model. (Works great for games though!  You should see it run Cyberpunk 2077.)
Instead, we'll use AWS Bedrock for inference, since they just recently added
the Llama3 models. This in itself introduces a slight wrinkle - the boto3
Bedrock API is model agnostic and accepts a single "prompt" string instead of a
list of messages. You have to format the chat history yourself, and this format
is different for different models (and even different between llama2 and
llama3.) Luckily the format is [simple and well-documented][L3T] and we can
implement it like so:

    def format_llama3_prompt(messages: List[dict]) -> str:
        '''AWS Bedrock accepts only a single string in raw format; we need to format
        messages using their special tags. Llama3 uses a different format from llama2.
        '''
        prompt = '<|begin_of_text|>'
        for message in messages:
            role = message['role']
            content = message['content']
            assert role in ['system', 'user', 'assistant']
            prompt += f'<|start_header_id|>{role}<|end_header_id|>{content}<|eot_id|>'
        prompt += '<|start_header_id|>assistant<|end_header_id|>'
        return prompt

Libraries like [liteLLM][LL] offer these kind of compatability layers out of the box but this suffices
to get us unblocked for this project.


| Service                | Provider    |   Library  |
|:-----------------------|:------------|:-----------|
| gpt-4-turbo            | OpenAI      | openai     |
| gpt-3.5-turbo          | OpenAI      | openai     |
| text-embedding-ada-002 | OpenAI      | openai     |
| llama3:70b             | AWS Bedrock | boto3      |
| llama3:8b              | Local       | ollama     |
| llama2:7b              | Local       | ollama     |
| vector database        | Local       | faiss      |


TODO: Error analysis, Alex's commentary

Fine Tuning
-----------

OpenAI expects [fine tuning training data][OAFT] to be provided in the JSONL format with one
example per line. Each line should be a JSON object containing the messages for
one chat session in the same message format used by the `chat.completions` API.

It's trivial to implement this format. Note that we include the same system
prompt that we will use for the task, and that we provide the Jeopardy!
question in the exact same format we will use for the real task. Finally, note
that we take the opportunity to teach it that every response should be in the
form of a question. (Many contestants such as [Matt Amodio][MA] invariably use
the "What is X?" form instead wasting time thinking about the appropriate
interrogative  and risk making a mistake, so we know this is a valid strategy.)


    def format_for_fine_tuning(
        category: str, 
        question: str, 
        answer: str, 
        **kwargs) -> dict:
        '''formats one question/answer pair as one line in an OpenAI 
        fine-tuning .jsonl file.
        '''
        messages = [
            {
                "role": "system", 
                "content": ("You are a contestant on Jeopardy. Answer in the form of a "
                            "question.")
            },
            {
                "role": "user", 
                "content": f'\nCATEGORY: {category}\n{question}'
            },
            {
                "role": "assistant", 
                "content": f"What is {answer}?"
            }
        ]
        return { "messages": messages }

TODO: link to training data sample.


<img src="/post/jeopardy_files/training_loss_graph_10k.png">


Fine tuning on 1,000 expa
<img src="/post/jeopardy_files/spend.png">

Calling the fine-tuned model is simply a matter of passing a new model ID to the API:

    chat_response = client.chat.completions.create(
        model="ft:gpt-3.5-turbo-1106:personal:jeopardy1k:9MJuormU",
        messages=system_messages + [
            {"role": "user", "content": prompt}
        ]
    )


Vector Database
---------------

    Total chunk size: 38 million character (roughly 10X the complete works of shakespeare)

    `jeopardy_chunks = [ jeopardy_chunk_template.format(**q) for q in jeopardy_data ]`
    jeopardy_database = create_embeddings_database(jeopardy_chunks)
    30 minutes and $1 to embed using text-embedding-ada-002

    %%timeit
    generate_hnsw_index(jeopardy.embeddings, "temp.index")
    About 1 minute to create the FAISS HNSW Index.
    It's about 1.3 GB on disk, basically the same as just storing the embedding vectors.
    Same size in memory.

    about 0.6 seconds to load the index off disk
    %%timeit
    load_jeopardy_index()

    HNSW vs. brute force:
    311 microseconds vs 51.6 milliseconds
    that's about 166X (two orders of magnitude faster)

<img src="/post/jeopardy_files/jeopardy_dataset_metrics.png">



TODO: indexing vector databases

TODO: brute force vs. HNSW

TODO: discuss cross-validation and split date for benchmark.

> If there was any basis to his firmly held belief that the rhythms and
> harmonies of music which he found most satisfying could be found in, or at
> least derived from, the rhythms and harmonies of naturally occurring
> phenomena, then satisfying forms of modality and intonation should emerge
> naturally as well, rather than being forced. For the moment, though, he
> forced it.
> <br>&mdash;Douglas Adams, *Dirk Gently's Holistic Detective Agency*



Conclusions
-----------

| Contestant      | Model              | Successes   |   Failures | Sample Size   | Success Rate   | 95% CI   |
|:----------------|:-------------------|------------:|-----------:|--------------:|---------------:|---------:|
| Ken Jennings    | gpt-4-turbo        | 1,924       |         76 | 2,000         | 96.20%         | ±0.84%   |
| Amy Schneider   | gpt-3.5-fine-tuned | 1,856       |        144 | 2,000         | 92.80%         | ±1.13%   |
| James Holzhauer | gpt-3.5-turbo      | 1,791       |        209 | 2,000         | 89.55%         | ±1.34%   |
| Brad Rutter     | llama3:70b         | 1,790       |        210 | 2,000         | 89.50%         | ±1.34%   |
| Mattea Roach    | llama3:8b + RAG    | 1,748       |        252 | 2,000         | 87.40%         | ±1.46%   |
| Larissa Kelly   | llama3:8b          | 1,257       |        743 | 2,000         | 62.85%         | ±2.12%   |
| David Madden    | llama2:7b          | 1,196       |        804 | 2,000         | 59.80%         | ±2.15%   |

# TODO: stat-sig.


#### Fine-Tuning

Fining tuning works, but it's a "you get what you pay for" kind of deal. OpenAI's rates for fine-tuned
models are midway between GPT-4 and GPT-3.5, but so is performance. Then there's the headache of curating
and maintaining a fine-tuning dataset... unless you actually beat a GPT-4 model with your fine-tuned GPT-3.5
model (which is going to be very use case dependent) its a lot of complexity for a very marginal cost savings. 
It didn't work for the Jeopardy! dataset, but maybe it'll work for yours.

Of course, when OpenAI finally starts offering fine-tuning of GPT-4 models, fine-tuning may allow us to unlock a
whole new level of performance, but that's future state. Right now it's very situational.

One thing that suprised me about the fine-tuning is that the performance gain all came from the first few
hundred records. The training loss curves flattened out pretty quickly and there wasn't any benefit from
fine tuning on a larger 10k dataset. That means we're not teaching the model the answers to specific trivia
questions, *we're teaching it how to be a Jeopardy! contestant.* That's also why the performance bump generalizes
to novel data - it's not about memorization. That tells us that fine-tuning is the tool we should reach for to *steer*
our models:  to improve compliance or to stay on task. It's not a good way to teach them a lot of new information.

#### RAG

RAG gives us a whopping *24 percentage points* over the baseline model, and gets us within spitting
distance of the Llama3 70 billion parameter model while still allowing us to run a fast, cheap, (possibly even local)
LLM. The overhead of RAG itself is fairly minimal. There is an added 0.2 - 0.3 second latency for hitting OpenAI
embeddings API, which eats into the performance gains of running a smaller model. (Latency is the only real downside: cost is very low and throughput
won't be affected.) Vector databases are pretty inexpensive to index and query so unless your operating at
Wikipedia scale the costs will be pretty nominal. 

Of course, you don't have to use RAG with a small model; you could pair it with GPT-4 or other SOTA if you're focused on quality over throughput, latency, or cost.
Unlike fine-tuning, RAG doesn't lock you into a particular LLM choice. I see why there's a lot of hype around it;
it's cheap, it's fast, it scales well, it's easy to implement (you don't have to hand-currate training examples but just chunk whatever useful documents are lying around) 
and it works. 

#### Llama3

Llama3 is fine. LLama3:70b is comparable to ChatGPT 3.5.



[AA]: https://artificialanalysis.ai/
[JKD]: https://www.kaggle.com/datasets/aravindram11/jeopardy-dataset-updated
[LL]: https://github.com/BerriAI/litellm
[L3T]: https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-llama-3/
[OAFT]: https://platform.openai.com/docs/guides/fine-tuning/preparing-your-dataset
[MA]: https://www.jeopardy.com/jbuzz/contestants/matt-amodio-talks-winning-streak-ken-jennings-and-most-stressful-jeopardy-moment
[37]: https://www.youtube.com/watch?v=d6iQrh2TK98
[JPT]: https://github.com/olooney/jpt

