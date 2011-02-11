---
layout: post
title: Automatching rails paths in cucumber
categories: [cucumber, rails, ruby, testing, tip]
---
If you're using [cucumber](http://cukes.info/) as part of your testing, you probably have a `paths.rb` file that looks something like this:

{% highlight ruby %}

module NavigationHelpers
  def path_to(page_name)
    case page_name
    
    when /the home page/
      root_path
    when /the new client page/
      new_client_path
    when /the clients page/
      clients_path    
    # Add more page name => path mappings here
    else
      raise "Can't find mapping from \"#{page_name}\" to a path.\n" +
      "Now, go and add a mapping in features/support/paths.rb"
    end
  end
end

World(NavigationHelpers)

{% endhighlight %}

This let's us use nice descriptive names in our scenarios, but it starts to become a pain when we add more and more paths.  So how can we make it better?  

By automatically matching some rails paths.  Here's the code:

{% highlight ruby %}

module NavigationHelpers
  def path_to(page_name)
    case page_name
    
    when /the home page/
      root_path   
    # Add more page name => path mappings here
    else
      if path = match_rails_path_for(page_name) 
        path
      else 
        raise "Can't find mapping from \"#{page_name}\" to a path.\n" +
        "Now, go and add a mapping in features/support/paths.rb"
      end
    end
  end

  def match_rails_path_for(page_name)
    if page_name.match(/the (.*) page/)
      return send "#{$1.gsub(" ", "_")}_path" rescue nil
    end
  end
end

World(NavigationHelpers)

{% endhighlight %}

What it does is pretty simple.  Given a page name `the clients page` (with no other matches defined) it will try and send `clients_path`.  If successful, then it returns the result, otherwise nil.  

Not the biggest improvement in the world, but it's made my cucumber tests just a little bit easier to write.