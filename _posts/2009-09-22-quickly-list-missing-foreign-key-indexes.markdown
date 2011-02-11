---
layout: post
title: "Quickly list missing foreign key indexes"
categories: [rails, databases, indexes, sql, code]
---
Run this code in a rails console to list foreign keys which aren't indexed.

{% highlight ruby %}
c = ActiveRecord::Base.connection
c.tables.collect do |t|  
  columns = c.columns(t).collect(&:name).select {|x| x.ends_with?("_id" || x.ends_with("_type"))}
  indexed_columns = c.indexes(t).collect(&:columns).flatten.uniq
  unindexed = columns - indexed_columns
  unless unindexed.empty?
    puts "#{t}: #{unindexed.join(", ")}"
  end
end
{% endhighlight %}

This list will look something like this:

{% highlight bash %}
attachments: parent_id, asset_id
domain_names: organisation_id
event_memberships: user_id, event_id
events: editor_id
group_actions: user_id, group_id
groups: user_id
icons: parent_id
invitations: sender_id
legacy_actions: item_upon_id
news_items: author_id
organisations: midas_id
pages: author_id
pending_event_memberships: invitation_id, event_id
resources: user_id, resourceable_id
subscriptions: subscribable_id, user_id
taggings: tag_id, taggable_id, user_id
{% endhighlight %}

For each column in the list, ask yourself why you don't need an index.

_Update:_ Andrew Coleman has [added output in migration format](http://penguincoder.org/pages/A_Slightly_Better_Way_To_Find_Missing_Foreign_Key_Indexes).  If you want to play around with it further, [here's the original code on gist](http://gist.github.com/191181).