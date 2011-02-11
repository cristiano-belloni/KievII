---
layout: post
title: Pimp my script/console
categories: [ruby, rails, irb, tip]
---
For a long time I've had [an .irbrc file](http://github.com/tomafro/dotfiles/blob/master/dotfiles/irbrc) and a [.railsrc file](http://github.com/tomafro/dotfiles/blob/master/dotfiles/railsrc), setting up some simple helpers methods in my `irb` and `script/console` sessions.  Today though, I wanted to add some more helpers specific to the project I'm working on.  Specifically, I wanted to be able to use my [machinist](http://github.com/notahat/machinist/tree/master) blueprints, to help me play around with some models.

Adding [machinist](http://github.com/notahat/machinist/tree/master) isn't as simple as just requiring my blueprints though -- they require my ActiveRecord models, which aren't available when `.irbrc` is loaded.  Luckily the solution is simple -- just add a couple of lines to the configuration in environment.rb:

{% highlight ruby %}Rails::Initializer.run do |config|
  if defined?(IRB)
    config.gem 'faker'
    config.gem 'notahat-machinist', :lib => 'machinist', :source => "http://gems.github.com"
    IRB.conf[:IRB_RC] = Proc.new { require File.join(RAILS_ROOT, "config", "console") }
  end
end
{% endhighlight %}

The key part is the line starting `IRB.conf[:IRB_RC]`, which tells `irb` to run the given when the session starts.  Luckily, this happens after rails has finished initializing.  I've set it to require `config/console.rb`, to which I can add all sorts of configuration and helpers, knowing it will only get loaded in `script/console` sessions where I want these shortcuts, not in my general code.  Here it is:

{% highlight ruby %}
require File.expand_path(File.dirname(__FILE__) + "/../spec/blueprints.rb")

def tomafro
  Account.find_by_login("tomafro")
end

def bbi
  Client.find_by_name("Big Bad Industries")
end

{% endhighlight %}