---
layout: post
title: dscl - the easy way to add hosts on OS X
categories: [osx, dscl, development, shell, reminder]
---
As a web developer, I often want several host names pointing at my local machine whilst developing and testing applications.  I may want to use Apache virtual hosts to serve multiple apps at once, or use subdomains to distinguish different accounts within a single application.

Previously, to set these host names up, I would manually edit `/etc/hosts`, adding entries like:

{% highlight bash %}
127.0.0.1      twitter-killer.localhost
127.0.0.1      my-url-shortener-is-better-than-yours.localhost
127.0.0.1      yet-another-half-baked-idea.localhost
{% endhighlight %}

This worked well on one level, but on another it just seemed wrong.  It's very manual, prone to error and pretty hard to script.  Recently though, thanks to a hint from Chris Parsons, I've found another way: using `dscl`.

`dscl`, or Directory Service command line utility to give it its full name, has many uses.  For a web developer, the most relevant is probably the ability to add, list and create local directory entries under `/Local/Defaults/Hosts` in the directory (not the file system).  These act like lines in `/etc/hosts` but can be manipulated easily from the command line.

To add an entry (easily the most interesting command) use:

{% highlight bash %}
sudo dscl localhost -create /Local/Default/Hosts/twitter-killer.localhost IPAddress 127.0.0.1
{% endhighlight %}

Once entries have been added, listing them is just as simple:

{% highlight bash %}
sudo dscl localhost -list /Local/Default/Hosts IPAddress
{% endhighlight %}

This produces a list in the form:

{% highlight bash %}
twitter-killer.localhost                         127.0.0.1      
my-url-shortener-is-better-than-yours.localhost  127.0.0.1      
yet-another-half-baked-idea.localhost            127.0.0.1      
{% endhighlight %}

Finally, you can remove entries with:

{% highlight bash %}
sudo dscl localhost -delete /Local/Default/Hosts/twitter-killer.localhost
{% endhighlight %}

Once you've mastered these commands, the possibilities are endless.  Here's a rake task to add all subdomains used in a project:

{% highlight ruby %}
class Application
  def self.subdomains
    Client.all.collect {|client| client.subdomain }
  end
end

namespace :subdomains do
  task :add do
    Application.subdomains.each do |subdomain|
      `sudo dscl localhost -create /Local/Default/Hosts/#{subdomain}.app.localhost IPAddress 127.0.0.1`
    end
  end
  
  task :remove do
    Application.subdomains.each do |subdomain|
      `sudo dscl localhost -delete /Local/Default/Hosts/#{subdomain}.app.localhost`
    end
  end
end
{% endhighlight %}

Or if you're using [passenger](http://www.modrails.com/) for development, you can use a tool like [James Adam's hostess](http://github.com/lazyatom/hostess/tree/master) to automatically set up the host entry and virtual host entry for a site in one simple command.
