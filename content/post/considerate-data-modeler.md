---
title: "The Considerate Data Modeler"
author: "Oran Looney"
date: 2026-06-04
publishdate: 2026-06-04
tags:
  - databases
image: /post/considerate-data-modeler_files/lead.jpg
---

Database modeling is closer to library science than computer science. No one is
impressed by a librarian who gets creative and files cook books under "G" for "Gourmand."
The best catalog system is where everything is in an obvious place, where everything
confirms to expectations.

As Alec Baldwin's database consultant explained to a team of application developers
he was brought in for the day to train, it comes down to three simple letters: L. C. D.

* Lowest
* Common
* Denominator

Always target the lowest common denominator. ANSI SQL isn't the LCD; you want to be
targeting the subset of the subset of ANSI SQL which is truly portable.

Your data is eventually going to end up in another RDBMS, pumped over an ETL pipeline
to a data warehouse of some kind by a tool like dbt or ADF. Any unique, advanced feature
of a database that you use will cause headaches and make you enemies.

I know this
first hand because at one time or another I've played each role. I've been the application
developer using PostGIS spatial types in my application and explaining to data team about
spherical coordinate systems, polygons, and R-trees and why we absolutely needed them and
couldn't just use `latitude NUMERIC(8,2), longitude NUMERIC(8,2)`, even if that's
their coding standard for their data warehouse.
I've been the data scientist parachuted into a hostile operational database and given three days
to write a query to flatten it down into usable training data and wincing over every JSON extraction.
And I've been the guy
advocating building a single data warehouse from three different databases built by different
people at different companies before they where acquired and merged, dealing
with the impedance mismatch that resulted. (If I never hear the phrase "conformed dimension"
again in my life it will be too soon.) So I can tell you with great confidence and breadth
of experience:

Nobody likes a smart ass. Nobody every says, "wow, you leveraged *the shit* out that
unique, proprietary feature from your vendor of choice! You must be really be on the
cutting edge! It was a great business decision to lock us in like that, and we're
really enjoying learning the ins-and-outs of every quirk of your *very special* database!
And the ETL team, oh, there just having *great* fun writing custom mapping logic! They
were getting so *bored* using the default copy activity all the time!" No, they just grit
their teeth, smile, and ask how it can be mapped back to third normal form.

Case Study: Enum
----------------

MySQL and Postgres have an Enum type; Oracle, Databricks Delta, Snowflake do not.

The poor DBA will probably grit their teeth and model your Enum as a
CHECK constraint on a string, which is wildly inefficient.

Think also of the poor analysts and data scientists who have to use your document.
SQL is their mother tongue and they think nothing of LEFT JOINing to a few reference
tables to pick up human readable columns... at the end of their query. In the meat
of the logic, all the CTAS statements and subqueries, they want to use fast, exact
joins on primary keys.

Here are some other puzzles for you:

I want to deprecate a code in an Enum, but it is used in historical data and still
meaningful there. If it was a ref table we would add a soft delete flag; how do I
do the same thing with Enum?

I need to associate additional information to each code in my Enum. For example,
I have a State Enum, but I also need to store the two letter state abbreviations,
distinguish between states and territories. How would I do that with an Enum.

Write a query that returns one row for every state and counts the number orders
in that state in 2025. To be clear, it should return a row even for states where
the count is zero, like `('Wisconsin', 0)`. Compare your answer to this query:

    SELECT state.name, count(*) as orders
    FROM state
    LEFT JOIN order on state.id = order.state_id

And then ask which an analyst would prefer. Note also exactly what happened: in
order to make it work, it flattened the Enum back to the relational view on the
fly.

If the answer to literally every question about how to do some slightly advanced
thing is "use a lookup table," why not start with that in the first place?

You might argue, well, we could start there, but then migrate when these super
advanced cases actually come up in practice. YAGNI! KISS!

The problem there is that the refactoring isn't transparent at all. Relational
databases have an "interface", just like an API - that's why we can swap tables
for views, for example. But the surface area of that interface is quite large:
every table name, column name, and type.

Going from
an Enum to a lookup table is a backwards incompatible change in the interface
to the database. Every single SQL query that every touched that Enum will need to be
rewritten. That means the custom maps in ETL pipelines, ORM models in application
code, every snippet of saved SQL the analysts keep inside of DBeaver to quickly
answer *ad hoc* questions from executives.

Here is something absolutely key for application developers to understand: *the
database is not for just you.* It is not your private place to persist a few
objects so your application works. It is an integral part of your interface to
the rest of the organization, the back office in particular. If your application
is successful, then executives will want dashboards with metrics, analysts will
want to do reporting, and data scientists will want to extract training data.

If its painless to migrate, it's only because *no one was using your database in
the first place.* Your database was *already* a failure.

But lets say you push through the change management nightmare, and get the State
Enum refactored to the `state` column, or whatever. Now you have a data model
where some columns are Enums, some use the lookup table convention, and everyone
has to check every single time they use any column.

Conclusion
----------

What if there was a better way? What if, and hear me out on that, we just...
didn't do that? Any of that? Just built, plain ol' boring data models that
could be trivially instantiated on any RDBMS using conventions that everyone
in the industry is familiar with? It would be like coming back to your favorite
little bookstore, where everything is where it should be and you can always
find what you're looking for, where all the customers are happy, the staff
is unstressed, and even the cat seems to be in exactly the right spot.

Be a considerate data modeler. Design boring databases.

<small>
The lovely cat photo is by <a href="https://unsplash.com/@diane_soko?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Diane Picchiottino</a> on <a href="https://unsplash.com/photos/a-cat-sleeping-on-top-of-a-book-shelf-3skIILnva1k?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>.
</small>
      