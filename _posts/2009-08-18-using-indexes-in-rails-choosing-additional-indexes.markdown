---
layout: post
title: "Using indexes in rails: Choosing additional indexes"
categories: [rails, databases, indexes, sql, using-indexes-in-rails]
---
[The first part in this series of posts](http://tomafro.net/2009/08/using-indexes-in-rails-index-your-associations) looked at adding indexes to foreign keys, to improve the performance when navigating rails associations.  But many queries involve data other than just foreign keys.  With the judicious use of indexes, we can improve these too. 

Let's take the `conversations` table used in the first article, and add a column to hold the language, and some timestamps.  Here's the full schema:

{% highlight ruby %}
create_table conversations do |table|
  table.string   :subject, :null => false
  table.integer  :user_id, :null => false
  table.integer  :subject_id
  table.string   :subject_type
  table.string   :language_code
  table.datetime :created_at
  table.datetime :updated_at
end
{% endhighlight %}

We want to split conversations by their languages, so we'll add a `named_scope` to the Conversation class:

{% highlight ruby %}
class Conversation
  belongs_to :user
  belongs_to :subject, :polymorphic => true
  
  named_scope :in_language, lambda {|language| 
    { :conditions => {:language_code => language}}
  }
end
{% endhighlight %}

Using `Conversation.in_language 'en'` will now get us all conversations in English.  Like we did for foreign keys, we can see how long the query takes and read the explain plan.

<pre>mysql> SELECT * FROM conversations WHERE language_code = 'en';
90791 rows in set (3.94 sec)

mysql> EXPLAIN SELECT * FROM conversations WHERE language_code = 'en';
+-------------+------+---------------+---------+-------+---------+-------------+
| select_type | type | key           | key_len | ref   | rows    | Extra       |
+-------------+------+---------------+---------+-------+---------+-------------+
| SIMPLE      | ref  | NULL          | NULL    | NULL  | 1000111 | Using where | 
+-------------+------+---------------+---------+-------+---------+-------------+
1 row in set (0.00 sec)
</pre>

Adding an index to the `language_code` column should improve the query performance, so let's do that and see the effect on our query:

<pre>mysql> SELECT * FROM conversations WHERE language_code = 'en';
90791 rows in set (3.02 sec)

mysql> EXPLAIN SELECT * FROM conversations WHERE language_code = 'en';
+-------------+------+---------------+---------+-------+---------+-------------+
| select_type | type | key           | key_len | ref   | rows    | Extra       |
+-------------+------+---------------+---------+-------+---------+-------------+
| SIMPLE      | ref  | lang_code_ix  | 3       | const |   98345 | Using where | 
+-------------+------+---------------+---------+-------+---------+-------------+
1 row in set (0.00 sec)
</pre>

So the query now uses the index, and the time taken has gone from almost 4 seconds to just over 3.  That's not nearly as big a performance gain as before, but why?  The answer is in the number of rows returned: 90791.  The index helps the database find the relevant rows quickly.  However, it still has to read those rows, and reading over 90,000 rows will always take a significant amount of time.

In a real app we're unlikely to want to read all these rows at once, so let's do another quick comparison limiting the query to the first 100 rows:

<pre>Without the index:  

mysql> SELECT * FROM conversations WHERE language_code = 'en' LIMIT 100;
100 rows in set (1.32 sec)

And with the index:

mysql> SELECT * FROM conversations WHERE language_code = 'en' LIMIT 100;
100 rows in set (0.01 sec)
</pre>

Much better.

### Choosing between indexes

We've seen that by using an index and limiting the number of results we can quickly get the 'first' 100 English conversations.  But in this case 'first' doesn't really mean anything.  When no order clause is specified, MySQL may appear to order its results by id, but this is just a coincidence and shouldn't be relied on.  Let's instead order our results by `created_at` to get the 100 most recent conversations.

<pre>mysql> SELECT * FROM conversations WHERE language_code = 'en' ORDER BY created_at DESC;
100 rows in set (4.42 sec)

mysql> EXPLAIN SELECT * FROM conversations WHERE language_code = 'en' ORDER BY created_at DESC;
+-------------+------+---------------+---------+-------+---------+-----------------------------+
| select_type | type | key           | key_len | ref   | rows    | Extra                       |
+-------------+------+---------------+---------+-------+---------+-----------------------------+
| SIMPLE      | ref  | lang_code_ix  | 3       | const |   98345 | Using where; using filesort | 
+-------------+------+---------------+---------+-------+---------+-----------------------------+
1 row in set (0.00 sec)
</pre>

Even though this query uses our index and only returns 100 rows, it has still taken almost 4.5 seconds!  The reason for this terrible performance is hinted in the extra information in the explain plan: `using filesort`.  The database is reading all rows that match the condition (all 90791 of them), then using a filesort to order them before returning the first 100.

If we add an index on `created_at` and do the query again we get:

<pre>mysql> SELECT * FROM conversations WHERE language_code = 'en' ORDER BY created_at DESC;
100 rows in set (4.39 sec)

mysql> EXPLAIN SELECT * FROM conversations WHERE language_code = 'en' ORDER BY created_at DESC;
+-------------+------+---------------+---------+-------+---------+-----------------------------+
| select_type | type | key           | key_len | ref   | rows    | Extra                       |
+-------------+------+---------------+---------+-------+---------+-----------------------------+
| SIMPLE      | ref  | lang_code_ix  | 3       | const |   98345 | Using where; using filesort | 
+-------------+------+---------------+---------+-------+---------+-----------------------------+
1 row in set (0.00 sec)
</pre>

It's pretty much exactly the same - still almost 4.5 seconds.  This is because MySQL can only use one index per table in a query.  It has to choose between the index on `language_code` and the one on `created_at`, and in this case chooses the language code index.  We can force it to use our other index for comparison:

<pre>mysql> SELECT * FROM conversations 
       USE INDEX(created_ix) WHERE language_code = 'en' 
       ORDER BY created_at DESC LIMIT 100;
100 rows in set (0.02 sec)

mysql> EXPLAIN SELECT * FROM conversations 
       USE INDEX(created_ix) WHERE language_code = 'en' 
       ORDER BY created_at DESC LIMIT 100;
+-------------+------+---------------+---------+-------+---------+-----------------------------+
| select_type | type | key           | key_len | ref   | rows    | Extra                       |
+-------------+------+---------------+---------+-------+---------+-----------------------------+
| SIMPLE      | ref  | created_ix    | 8       | const | 9903411 | Using where                 | 
+-------------+------+---------------+---------+-------+---------+-----------------------------+
1 row in set (0.00 sec)
</pre>

Using a trick stolen from [Pratik Naik (in the comments of his article)](http://m.onkey.org/2009/8/6/use-index-with-active-record-finders) we can force the use of a particular index in rails with a special named scope, and perform our query:

{% highlight ruby %}
Conversation.named_scope :use_index, lambda {|index| 
  {:from => "#{quoted_table_name} USE INDEX(#{index})"}
}

Conversation.in_language('en').use_index('created_ix').all(:order => 'created_at desc')
{% endhighlight %}

But there is also another way - using indexing multiple columns.

### Using compound indexes

A compound index indexes across two or more columns.  When defining a compound index, the order of the columns is significant, as the database reduces the set of candidate rows by comparing the columns in turn.  So an index created with `add_index :conversations, [language_code, created_at]` will compare `created_at` first, then `language_code`.

Because of this, we need to take some care in choosing the order of our columns.  In general, the rule is to specify the most selective column first.  That is, the column with the most unique values.  So for our query, we'll add the following:

{% highlight ruby %}
add_index :conversations, [created_at, language_code]
{% endhighlight %}

If we explain the query without forcing the index we find it is still efficient:

<pre>mysql> EXPLAIN SELECT * FROM conversations 
       WHERE language_code = 'en' 
       ORDER BY created_at DESC LIMIT 100;
+-------------+------+----------------+---------+-------+---------+-----------------------------+
| select_type | type | key            | key_len | ref   | rows    | Extra                       |
+-------------+------+----------------+---------+-------+---------+-----------------------------+
| SIMPLE      | ref  | lang_and_ca_ix |      48 | const |  640231 | Using where                 | 
+-------------+------+----------------+---------+-------+---------+-----------------------------+
1 row in set (0.00 sec)
</pre>

### A technique for choosing index column order

Sometimes it's hard to know which order your columns should be in an index, but there's an easy way to get a rough idea.  Rewrite the query, removing all conditions, and selecting `count(distinct column_to_index)` for each column.  So for our query, we'd do the following:

<pre>mysql> SELECT count(distinct language_code), count(distinct created_at)
       FROM conversations;
+-------------------------------+----------------------------+
| count(distinct language_code) | count(distinct created_at) |
+-------------------------------+----------------------------+
|                            21 |                     584089 | 
+-------------------------------+----------------------------+
1 row in set (1.90 sec)
</pre>

From this it's clear that there are more distinct created_at values, so we probably want to index this column first.  Note though that I said probably.  When deciding on indexes, there are no hard and fast rules.  Instead, we need to measure and analyse the queries used in our particular app, to ensure we are using the best indexes.

The next (and last) article in the series will go through some more advanced techniques, including when not to add an index, and how to spot redundant indexes.  