---
layout: post
title: "Tip: The case for from_param"
categories: [tip, ruby, rails, active-record, from-param]
---
There's one small method I add to every new rails project I work on:

{% highlight ruby %}
module Tomafro::FromParam
  def from_param(param)
    self.first :conditions => { primary_key => param }
  end
end

ActiveRecord::Base.extend(Tomafro::FromParam)
{% endhighlight %}

In my controllers, where you might use `Model.find(params[:id])` or `Model.find_by_id(params[:id)`, I use `Model.from_param(params[:id])` instead.

All three methods have almost the same behaviour, the only difference being the handling of missing records.  `find` throws a RecordNotFound, while `find_by_id` and `from_param` return nil.  So why use `from_param` over the others?

The answer comes when you want to change `to_param`, the method rails uses to turn a record into a parameter.  It's a good principal (though often broken) not to expose database ids in urls.  An example might be to use a users nickname rather than their id in user urls, so `/users/12452` becomes `/users/tomafro`.  In rails this is easy to achieve, by overriding the `to_param` method:

{% highlight ruby %}
class User < ActiveRecord::Base
  def to_param
    self.nickname
  end
end
{% endhighlight %}

Rails will automatically use this method when generating routes, so `users_path(@user)` will return `/users/tomafro` as we'd like.  If I was using `find` or `find_by_id` in my controllers, I'd then have to go through each one and change it to `find_by_nickname`.  Luckily though, I've used `from_param`, so whenever I override `to_param` I just have to remember to provide an equivalent implementation for `from_param`, and my controllers will work without modification:

{% highlight ruby %}
class User < ActiveRecord::Base
  def self.from_param(param)
    self.first :conditions => {:nickname => param}
  end
  
  def to_param
    self.nickname
  end
end
{% endhighlight %}

I've been doing this for years, but it's hardly a new principle, to provide a `from` method for every `to` method.  There's [even an old ticket on trac](http://dev.rubyonrails.org/ticket/11505) asking for it, but it's been considered too trivial to add.  

I disagree - for me the value comes from having the method from the start, not when you need it.  Luckily it's easy to add to my own projects. 
