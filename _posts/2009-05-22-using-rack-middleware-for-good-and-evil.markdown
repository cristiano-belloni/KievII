---
layout: post
title: Using Rack Middleware for good and evil
categories: [ruby, rack, middleware, evil, fun]
---
So we all know that [Rack](http://rack.rubyforge.org/) is awesome, and that we can use Rack::Middleware for all sorts of things: [debugging](http://github.com/brynary/rack-bug/tree/master), [caching](http://tomayko.com/src/rack-cache/) and a [whole host more](http://github.com/rack/rack-contrib/tree/master).

What all these have in common (apart from maybe [Rack::Evil](http://github.com/rack/rack-contrib/blob/8b6323c8eecc8279088987c52b27dda5d4cadf7b/lib/rack/contrib/evil.rb)) is that they're all helpful.  They all make writing Rack applications easier.  Not my Middleware though.

### Introducing Rack::Shuffler ###

{% highlight ruby %}
module Rack
  class Shuffler
    def initialize(app)
      @app = app
      @responses = []
    end
    
    def call(env)
      @responses << @app.call(env)
      @responses[rand(@responses.size)]
    ensure
      @responses.delete_at(rand(@responses.size)) if @responses.size > 100
    end
  end
end
{% endhighlight %}

I suggest you add it to a colleague's app late on a Friday afternoon, and see how long it takes to drive them to insanity.