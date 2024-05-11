---
title: "Jeopardy! Benchmark"
author: "Oran Looney"
date: 2024-05-11
publishdate: 2024-05-11
tags:
  - Python
  - Machine Learning
  - LLM
image: /post/jeopardy_files/lead.jpg
---


I used the [Kaggle Jeopardy!][JKD] to benchmark OpenAI and LLama3 models including some fine-tuning and RAG.
In accordance with the principle of BLUF (bottom-line-up-front,) here are my results:

<img src="/post/jeopardy_files/benchmark7.png">

There you go. You've already gotten 90% of what you're going to get out of this article.
Some rando on the internet used the Jeopardy! dataset to benchmark a scattered handful of LLM models and approaches,
and those results largely match [popular benchmarks][AA] and received wisdom on fine-tuning and RAG.


About
-----

A couple of years ago, I found [this neat dataset of Jeopardy! questions][JKD]
on Kaggle.  It's 200,000+ question/answer pairs, plus the category (column) and
value (row) of the question.  (Just to be clear, this dataset follows the
convention that the "question" is the prompt that Alex reads, and the "answer"
is what the contestant should respond with... in the form a question, of
course.) I never really did anything with it, but recently I dusted and off
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


Inference
---------

No API is 100% reliable. OpenAI has been pretty unreliable over the past year, but in all
fairness was pretty solid for this project. The AWS Bedrock API is less mature and
experienced many random failures during this project. 

    # reusable decorator to implement basic retry logic. We make up to three
    # attempts with exponential backoff. 
    retry_decorator = tenacity.retry(
        wait=tenacity.wait_exponential(min=0.1, max=2),
        stop=tenacity.stop_after_attempt(3), # because 4 is too many and 2 isn't enough.
        after=tenacity.after_log(logger, logging.ERROR),
        reraise=True)


Mini rant: a lot of Python programmers seem to think you have copy-paste decorator config for every
single function, but that's not the case. The expression after the `@` symbol just
needs to evaluate to an object which implements the implicit decorator interface - it
must be a callable that accepts a function and returns a function. That's it. That
means we can configure a decorator once, save it as a global variable, then reuse it
as often as we like. DRY! End rant.


Speaking of DRY, we'll centralize a few other things that will be constant across all contestants,
namely the prompt template and system messages:

    jeopardy_question_template = '''
    CATEGORY: {category}
    {clue}
    '''
    
    system_messages = [
        {"role": "system", "content": "You are a contestant on Jeopardy. Each prompt has both the category (column header) and Jeopardy clue; answer in the form of a question."},
        {"role": "user", "content": "CATEGORY: THE BIG APPLE\nThere's an annual footrace up its 86 flights of stairs"},
        {"role": "assistant", "content": "What is the Empire State Building?"}
    ]

I say "system_messages", but it also includes one example of a correct question/answer pair. Every LLM will
use the exact same prompts so that we have a level playing field for our benchmark.

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
        augment_data = brute_force_search(embeddings_old, jeopardy_old, query=rag_query, k=10)
        augment_json = json.dumps(augment_data)
    
        # augment the prompt with retrieved questions
        prompt = jeopardy_question_template.format(**locals())
    
        # this looks cheesy, but other attempts to embed the RAG context
        # resulted in Llama3 being confused about which question's were historical
        # and which was actually being asked. This prompt fixed that.
        messages = system_messages + [
            {"role": "user", "content": f"Correct! By the way, here are three historical questions that may help you answer future questions: {augment_json}"},
            {"role": "assistant", "content": "Thank you, I'll be sure to refer back to those if they help with a question in the future!"},
            {"role": "user", "content": prompt}
        ]
    
        # use a small, fast model for generation
        response = ollama.chat(
            model='llama3:8b',
            messages=messages
        )
        content = response['message']['content']
        return content

TODO: Justify prompt engineering for RAG content.



TODO: OpenAI and local ollama.

Sadly, my RTX 4070 Ti "only" has 12 GB of VRAM, so it can't run the 70b model. (Works great for games though!
You should see it run Cyberpunk 2077.) Instead, we'll use AWS Bedrock for inference, since they just
recently added the Llama3 models. This in itself introduces a slight wrinkle - the boto3 Bedrock API 
is model agnostic and accepts a single "prompt" string instead of a list of messages. You have to format
the chat history yourself, and this format is different for different models (and even different between
llama2 and llama3.) Luckily the format is [simple and well-documented][L3T] and we can implement it like so:

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
TODO: indexing vector databases
TODO: brute force vs. HNSW

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



### Fine-Tuning

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

### RAG

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

### Llama3

Llama3 is fine.



[AA]: https://artificialanalysis.ai/
[JKD]: https://www.kaggle.com/datasets/aravindram11/jeopardy-dataset-updated
[LL]: https://github.com/BerriAI/litellm
[L3T]: https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-llama-3/



