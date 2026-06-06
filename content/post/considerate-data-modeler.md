---
title: "The Considerate Data Modeler"
author: "Oran Looney"
date: 2026-06-04
publishdate: 2026-06-04
tags:
  - Databases
image: /post/considerate-data-modeler_files/lead.jpg
---

What's your hot take on relational databases? Here's mine: Data modeling is
closer to library science than computer science. No one is impressed by a
librarian who gets creative and files cookbooks under "G" for "Gourmand." The
best catalog system is where everything is in an obvious place, where
everything conforms to expectations. The best librarian is considerate of the
patrons. The best library is calm, safe, and boring. And the best database is
exactly the same.

As Alec Baldwin's database consultant explained to a team of application
developers in *[Glengarry Glen Ross][ABC]*, it comes down to three simple
letters, ABC:

* Always
* Be
* Considerate

Always think of your users first. Not just the application users, who are
insulated from your database by an ablative layer of code and really only have
one POV anyway, but also the DBAs who have to do backups, the engineers who
have to build pipelines, the analysts who run queries, and executives who look
at dashboards. Think about what *really* makes a database user happy. Hint:
it's not using all the latest features.

All of these types of users rotate your data 90&deg; and look at it through
their own lenses. That's why relational databases and third normal form are so
successful in practice; they make these conceptual rotations easy and natural.

Remember that the container is not the contents. Your data might live in a
particular RDBMS today, but tomorrow it will be in Spark or Snowflake or SQL
Server. Therefore, always target the lowest common denominator. Even ANSI SQL
isn't the LCD; you want to be targeting the subset of the subset of ANSI SQL
which is truly portable.

Why? Because your data is eventually going to end up in another RDBMS, pumped
over an ETL pipeline to a data warehouse of some kind by a tool like ADF.
Any unique, advanced feature of a database that you use will cause headaches
and make you enemies.

I know this firsthand because at one time or another I've been on every side.
I've been the application developer who used PostGIS spatial types in my
application and had to explain to the data team why spherical coordinate
systems, polygons, and R-trees were absolutely essential and, no, we couldn't
just use:


```sql
    latitude NUMERIC(8,2),
    longitude NUMERIC(8,2)
```

even if that's the standard for their data warehouse. I've also been the data
scientist parachuted into a hostile operational database and given three days
to write a query to extract usable training data for a machine learning model
and wincing over every JSON extraction. And I've been the guy who advocated for
building a single data warehouse from three different databases built by
different people at different companies before they were acquired and merged,
and had to deal with the impedance mismatch that resulted. (If I never hear the
phrase "conformed dimension" again in my life it will be too soon.) So I can
tell you this with great confidence:

Nobody likes a smart alec. Nobody ever says, "wow, you sure leveraged *the
heck* out of that unique, proprietary feature from your vendor of choice! It
was a great business decision to lock us in like that, and we're really
enjoying learning the ins and outs of every quirk of your *very special*
database! And the ETL team, oh, they're just having *great* fun writing custom
mapping logic! They were getting so *bored* using the default copy activity all
the time!" No, they just grit their teeth, smile, and ask how it can be mapped
back to third normal form.


Case Study: Enum
----------------

Let's do an example. MySQL and Postgres have an `enum` type; Oracle, Databricks
Delta, and Snowflake do not. But we're using Postgres, and `enum` seems like it
was designed to model categorical types. Seems like a no-brainer, right?

Except your data won't stay in Postgres, so your data model, in the abstract,
will need to be ported somewhere else, like Databricks Delta Lake.
When that happens, the poor DBA will have to model your `enum` as strings
with a `CHECK` constraint.

Think also of the poor analysts and data scientists who have to actually *use*
your database. SQL is their mother tongue and they think nothing of adding a
couple of `LEFT JOIN` clauses to pick up human-readable columns... at the end
of their query. In the meat of the logic, all the `CTAS` statements and
subqueries, they want to use fast, exact joins on primary keys.

Here's some homework for you:

1) I want to deprecate a value in an `enum`, but it is used in historical data
and still meaningful there. If it were a lookup table we could add a soft delete
flag; how do I do the same thing with `enum`?

2) I need to associate additional information with each code in my `enum`. For
example, I have a State `enum`, but I also need to store the two-letter state
abbreviations, and distinguish between states and territories. How would I do
that with an `enum`?

3) <span id="maintext1">Write</span> a query that returns one row for every
state in the State `enum` and counts the number of orders. To be clear, it
should return a row even for states where the count is zero, like
`('Wisconsin', 0)`. Compare your answer<a href="#footnote1"><sup>*</sup></a> to
this query:

```sql
SELECT state.name, COUNT(orders.id) AS n_orders
FROM state
LEFT JOIN orders ON state.id = orders.state_id
GROUP BY state.name
```

Which one would you prefer?


Keep it Boring
--------------

If the answer to every question about how to handle problems is "use a lookup
table," why not start with that in the first place? 3NF is popular precisely
because it tends to not get in trouble in this way.

You might argue, well, why don't we start with `enum` today, but then migrate
when these cases actually come up in practice. YAGNI! KISS!

The problem there is that the refactoring isn't transparent at all. Relational
databases have an "interface," just like an API; that's why we can swap tables
for views, for example. But the surface area of that interface is quite large:
every table name, column name, and type.

Going from an `enum` to a lookup table is a backward-incompatible change in the
interface to the database. Every single SQL query that ever touched that `enum`
will need to be rewritten. That means the custom maps in ETL pipelines, ORM
models in application code, every snippet of saved SQL the analysts keep inside
of DBeaver to quickly answer *ad hoc* questions from executives.

But let's say you push through the change management nightmare and get the
State `enum` refactored to the `state_id` column, or whatever. Now you have a
data model where some columns use `enum`, some use the lookup table
convention, and everyone has to check every single time they use any column.
Well-designed data models follow clear conventions so that you hardly ever have
to think.

Here is something absolutely key for application developers to understand: *the
database is not for just you.* It is not your private vault to persist a few
objects so your application works. It is an integral part of your interface to
the rest of the organization, the back office in particular. If your
application is successful, executives will want dashboards with metrics,
analysts will want to do reporting, and data scientists will want to extract
training data.

If it's painless to migrate, it's only because *no one was using your data in
the first place.* Your database was *already* a failure. (Obviously this only
applies to data that you intend to share with others. If you're working on a
hobby project you can do as you like.)



Conclusion
----------

What if there were a better way? What if, and hear me out on this, we just...
didn't do it? Any of that complex stuff? What if we just built plain ol' boring
data models in 3NF that used precisely zero advanced features and can therefore
be trivially instantiated on any RDBMS using conventions that everyone in the
industry is familiar with? It would be like coming home to your favorite little
library, where everything is in its proper place be and you can always find
what you're looking for, where all the customers are happily browsing, the
staff is relaxed, and even the cat seems to know in its heart that it's exactly
where it should be.

ABC: Always Be a Considerate data modeler. Design boring databases.

<hr>
Footnotes
---------

<p id="footnote1">
  <sup><a href="#maintext1">*</a></sup>
  Answer to homework question 3 in PostgreSQL:
</p>

```sql
SELECT state.name, COUNT(orders.id) AS n_orders
FROM unnest(enum_range(NULL::state)) AS state(name)
LEFT JOIN orders ON orders.state = state.name
GROUP BY state.name
```

<p>
  <a href="#maintext1">Back</a>
</p>

The lovely cat photo is by [Diane Picchiottino][CA] on [Unsplash][UC].


[ABC]: https://www.youtube.com/watch?v=O6ybfVT9gxA
[CA]: https://unsplash.com/@diane_soko?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
[UC]: https://unsplash.com/photos/a-cat-sleeping-on-top-of-a-book-shelf-3skIILnva1k?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
