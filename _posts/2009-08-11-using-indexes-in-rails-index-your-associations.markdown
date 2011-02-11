---
layout: post
title: "Using indexes in rails: Index your associations"
categories: [rails, databases, indexes, sql, using-indexes-in-rails]
---
Many rails developers are great at building applications but have limited experience in database design.  As a consequence, projects often have half-baked indexing strategies, and as a result suffer bad performance.

To try and improve this I've planned a series of posts on indexes, targetted at rails developers.  In this first post I'll [introduce indexes and how to index your associations]({{ page.url }}), then I'll write about choosing additional indexes to improve query performance, and finally how to avoid redundant and duplicate indexes.

### A brief overview of database indexes 

[Wikipedia states that][1] 'a database index is a data structure that improves the speed of operations on a database table'.  Unfortunately, this improvement comes at a cost.  

For every index on a table, there is a penalty both when inserting and updating rows.  Indexes also take up space on disk and in memory, which can affect the efficiency of queries.  Finally, having too many indexes can cause databases to choose between them poorly, actually harming performance rather than improving it.

So while indexing is important, we shouldn't just throw indexes at our slow queries: we need to choose carefully how to index our data.

### Indexing simple associations
 
By far the most common performance problem I've encountered in rails projects is a lack of indexes on foreign keys.  There's no real excuse for this - not indexing foreign keys can cripple your app. 

Take the following schema:

{% highlight ruby %}
create_table users do |table|
  table.string :login
end

create_table conversations do |table|
  table.string  :subject, :null => false
  table.integer :user_id, :null => false
end
{% endhighlight %}

We can use this to map a one-to-many relationship between users and conversations, where `user_id` as the foreign key.

Here are the models to do that:

{% highlight ruby %}
class User < ActiveRecord::Base
  has_many :conversations
end

class Conversation < ActiveRecord::Base
  belongs_to :user
end
{% endhighlight %}

With these models, to find all conversations for a particular user we'd use `user.conversations`, which in turns uses sql like this:

{% highlight sql %}
SELECT * FROM conversations WHERE user_id = 41;
{% endhighlight %}

I can run this query on a test database which I've randomly populated with 1,000,000 rows, to see how long it takes.  Note, I've cut out the actual results as they are unimportant:

<pre>
mysql> SELECT * FROM conversations WHERE user_id = 41;
12 rows in set (1.42 sec)

mysql> EXPLAIN SELECT * FROM conversations WHERE user_id = 41;
+-------------+------+---------------+---------+-------+---------+-------------+
| select_type | type | key           | key_len | ref   | rows    | Extra       |
+-------------+------+---------------+---------+-------+---------+-------------+
| SIMPLE      | ALL  | NULL          | NULL    | NULL  | 1001111 | Using where | 
+-------------+------+---------------+---------+-------+---------+-------------+
1 row in set (0.00 sec)
</pre>

Although the query is simple, it took 1.42 seconds.  The `key` column show the key or index that MySQL decided to use, in this case `NULL` as there are no indexes.  The `rows` column is also relevant.  It shows that MySQL will need to look at around 1,000,000 rows; that's a lot of data being loaded and compared.

### What a difference just an index makes

If we then add an index on `user_id`:

{% highlight ruby %}
add_index :conversations, :user_id, :name => 'user_id_ix'
{% endhighlight %}

And do the same select:

<pre>
mysql> SELECT * FROM conversations WHERE user_id = 41;
12 rows in set (0.01 sec)

mysql> EXPLAIN SELECT * FROM conversations WHERE user_id = 41;
+-------------+------+---------------+---------+-------+---------+-------------+
| select_type | type | key           | key_len | ref   | rows    | Extra       |
+-------------+------+---------------+---------+-------+---------+-------------+
| SIMPLE      | ref  | used_id_ix    | 5       | const |  108    | Using where | 
+-------------+------+---------------+---------+-------+---------+-------------+
1 row in set (0.00 sec)
</pre>

The difference is remarkable.  From over 1.4 seconds to about 1 hundredth.  Unless you have a cast-iron reason not to, index your foreign keys.

### Indexing polymorphic associations

So for simple associations, we can add an index on the foreign_key column.  For polymorphic associations the foreign key is made up of two columns, one for the `id` and one for the `type`.  Let's add another association to our models to illustrate this.

{% highlight ruby %}
add_column :conversations, :subject_id, :integer
add_column :conversations, :subject_type, :string

create_table :artworks do |table|
  table.string :title
end

class Artwork < ActiveRecord::Base
  has_one :conversation, :as => :subject
end

class Conversation < ActiveRecord::Base
  belongs_to :subject, :polymorphic => true
end
{% endhighlight %}

Here we've added an association between Artwork and Conversation, where an artwork can be the subject of a conversation.  From an artwork, we can find the related conversation (if any) with `artwork.conversation` which will use the following SQL:

{% highlight sql %}
SELECT * FROM conversations WHERE subject_id = 196 and subject_type = 'Artwork';
{% endhighlight %}

Again the query takes around 1.4 seconds without any indexes.  Now though, we have a choice on what to index.  We can index either `subject_type` on its own, `subject_id` on its own, or both together.

Let's try each in turn, and measure the performance.

First, an index on just `subject_type`:

<pre>  
mysql> SELECT * FROM conversations WHERE subject_id = 196 and subject_type = 'Artwork';
12 rows in set (0.31 sec)

mysql> EXPLAIN SELECT * FROM conversations WHERE subject_id = 196 and subject_type = 'Artwork'
+-------------+------+---------------+---------+-------+---------+-------------+
| select_type | type | key           | key_len | ref   | rows    | Extra       |
+-------------+------+---------------+---------+-------+---------+-------------+
| SIMPLE      | ref  | sub_type_ix   | 5       | const | 89511   | Using where | 
+-------------+------+---------------+---------+-------+---------+-------------+
1 row in set (0.00 sec)
</pre>

An index on just `subject_id`:

<pre>  
mysql> SELECT * FROM conversations WHERE subject_id = 196 and subject_type = 'Artwork';
12 rows in set (0.01 sec)

mysql> EXPLAIN SELECT * FROM conversations WHERE subject_id = 196 and subject_type = 'Artwork'
+-------------+------+---------------+---------+-------+---------+-------------+
| select_type | type | key           | key_len | ref   | rows    | Extra       |
+-------------+------+---------------+---------+-------+---------+-------------+
| SIMPLE      | ref  | sub_id_ix     | 5       | const | 204     | Using where | 
+-------------+------+---------------+---------+-------+---------+-------------+
1 row in set (0.00 sec)
</pre>

An index on `subject_id, subject_type`:
  
<pre>
mysql> SELECT * FROM conversations WHERE subject_id = 196 and subject_type = 'Artwork';
12 rows in set (0.01 sec)

mysql> EXPLAIN SELECT * FROM conversations WHERE subject_id = 196 and subject_type = 'Artwork'
+-------------+------+--------------------+---------+-------+---------+-------------+
| select_type | type | key                | key_len | ref   | rows    | Extra       |
+-------------+------+--------------------+---------+-------+---------+-------------+
| SIMPLE      | ref  | sub_id_and_type_ix | 5       | const | 5       | Using where | 
+-------------+------+--------------------+---------+-------+---------+-------------+
1 row in set (0.00 sec)
</pre>

So `subject_type` compared ~90,000 rows in 0.31 seconds, `subject_id` compared ~200 rows in 0.01 seconds and `subject_id, subject_type` compared 4 rows also in 0.01 seconds.  We should add an index to `subject_id, subject_type` as so:

{% highlight ruby %}
add_index :conversations, [:subject_id, :subject_type]
{% endhighlight %}

### Wrapping up

This should give a basic overview of indexes and the performance improvements they can give.  Hopefully I've shown that **foreign_keys should always be indexed**, and how to index them.  The next article (which I hope to publish later this week) will explain more about how to reason about indexes, and how to identify additional indexes (beyond those on foreign keys) to add.

[1]: http://en.wikipedia.org/wiki/Index_(database)