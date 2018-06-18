---
title: "Semantic Code"
author: "Oran Looney"
date: 2008-04-30
image: /post/semantic-code_files/15717226618_ecbcdbca50_b.jpg
---

> [se-man-tic][SD] (si-man'tik) adj. <br> &nbsp; &nbsp;
> 1. Of or relating to meaning, especially meaning in language.
[SD]: http://www.answers.com/topic/semantic

Programming destroys meaning.  When we program, we first replace concepts with symbols and then replace those symbols with arbitrary codes &mdash; that's why it's called coding.

At its worst programming is  *write-only*: the program accomplishes a task, but is incomprehensible to humans.  See, for example, [the story of Mel.][TSOM]  Such a program is correct, yet at the same time meaningless.

[TSOM]: http://www.pbm.com/~lindahl/mel.html

Semantic Functions
------------------
The opposite of write-only programming is *semantic programming*: writing code that has meaning encoded into it.  Let's take an example from C: `strcpy()`.  Instead of calling `strcpy()`, you could write this:

        while( *p++ = *q++ );

A good programmer will be able to puzzle out what you *meant* if he or she is familiar with pointers and null-terminated strings.  If instead we call `strcpy()`, equivalent code is executed but we've also made in clear that we *mean* to copy a string.  `strcpy()` is more than just a block of code to execute; it is also a symbol with meaning, and when we use it we add meaning to the program.

This becomes important when the implementation is not perfect, as it never is.  Consider this alternative code snippet:

        while( *q ) *p++ = *q++;

Which behaves identically to the above snippet for *almost* all inputs.  Which one is correct?  What did the programmer intend?  Did he or she do it on purpose?  There's no way to know from the code; all semantic meaning is gone.

Functions like `strcpy()` are semantic symbols, and as such allow you to inject meaning directly into your code&mdash;not into the comments or even the variable names, but the structure of the code itself.

Likewise, you can create new semantic symbols by writing functions that do one &mdash; and only one &mdash; thing and giving them a descriptive names.

> Functions should be short and sweet, and do just one thing.<br/>
> - Linus Torvalds

The [Linux Coding Style][LCS] guide contains [good, practical advice][LCS] on how to write meaningful functions.  A program built out of such semantic functions will be more meaningful, hence more readable and understandable.

[LCS]: http://lxr.linux.no/linux/Documentation/CodingStyle#L342


Semantic Methods
----------------
In the object-oriented world, semantic programing means providing methods with good semantics.  An Array class doesn't *need* to provide a method for accessing the last element, because programmers could simply write:

        myArray[myArray.length-1]

and still be guaranteed constant-time access.  But this isn't semantic; you're saying *how* to do something, instead of *what* you want to do, programming procedurally instead of declaratively.  It would be better to be able to write:

        myArray.last()

*How* is it better, you may ask?  Well, how should this code behave for an empty array?  With the `last()` method that decision is encapsulated in the Array class.  Even functions "too simple to screw up" can have edge cases anyone can miss when slamming out "just one line of code."

The client is busy trying to solve their own problem.  Having to write a even a simple algorithm (take the length, subtract one, get the element at that index) to get the last element is a distraction.    That shoud be [SEP][SEP]: Somebody Else's Problem.  (Specifically, Array's implementer.)

[SEP]: http://everything2.com/e2node/Somebody%2520Else%2527s%2520Problem%2520Field

Another example is the `.empty()` method provided for containers in the C++ STL.  Why not simply compare `.length()` to 0?  Because not all containers can compute their length in constant time.  `list<>`, which is implemented as a bi-directionally linked-list, must walk from the start node to the end code in to determine its own length.  However, to determine if it contains at least one node takes only constant time.

The principle is the same: let the client define *what* to do, and let the object figure out *how* to do it.  The "how" might be different between different implementations of the interface, and it might change over time; therefore it should be encapsulated in the object.  By providing the semantic `.empty()` method, STL contains encapsulate that behavior and provide practical performance and maintainence advantages.

To enable the client to declare *what* needs to be done without any *how*, we need to write semantic methods, like `.last()` and `.empty()`, that have clear, meaningful responsibilities.  Doing so makes it easier for programmers to learn the object's API, makes the client code simplier and more declarative, and improves encapsulation.

Implementing Semantic Objects
----------------------------
So, semantic methods are useful to the object's client, because they don't have to think about implementations, but can simply say what they want and let the object provide it.  That's useful to the client, but doesn't it impose a burden on the classes implementor?

No.  The reverse is the case; providing semantic methods gives the implementor great freedom to change the underlying implementation and prevents the object from being pushed into a passive, "data" role.

Suppose a class provides various "get" methods &mdash; `getName()`, `getAge()`, `getGender()`, and so on &mdash; but no `getDescription()`  method.  The client can certainly construct a string representation of the object, but the class has no control over it... in particular it has no way to update those cobbled-together descriptions when the class changes and new fields are added.  In general, we *never* want the client to have to write procedural code acting on our object, and should provide semantic methods they can call instead.

(C++ programmers may be familar with the idea of writing non-method, non-friend functions to provide convenience functionality that can be implemented in terms of the classes public interface.  That's fine; the important thing is to provide the semantics along with the object, so what I've said about methods applies here too.)

Programming destroys meaning.  However, this destruction does not need  to be wholesale.  With a little thought we can preserve much of the meaning.  Such "semantic code" can be understood, re-used, debugged, and modified far more easily than "write-only code."
