---
layout: post
title: Adam Sanderson's open_gem
categories: [ruby, gem, tip, gem-open]
---
The latest version of [rubygems](http://rubygems.org/) (1.3.2) now has an interface to add commands.  Making great use of this feature, [Adam Sanderson](http://endofline.wordpress.com/) has written [open\_gem](http://github.com/adamsanderson/open_gem), a simple but amazingly useful tool.

You use it like this:

{% highlight bash %}
$ gem open activerecord
{% endhighlight %}

This opens the activerecord gem in your favourite editor (taken from either `$GEM_OPEN_EDITOR` or `$EDITOR` environment variables).  If there are multiple versions of the gem installed, it will show a menu, letting you choose which version you require.

{% highlight bash %}
$ gem open activerecord
Open which gem?
 1. activerecord 2.1.0
 2. activerecord 2.3.2
> 
{% endhighlight %}


open\_gem itself is a gem, and can be installed with:

{% highlight bash %}
$ gem install open_gem
{% endhighlight %}

To get it working, you need to have `$EDITOR` set to something sensible:

{% highlight bash %}
$ export EDITOR=mate
{% endhighlight %}

If you're running on OS X and use TextMate, you may have already set `$EDITOR` to `mate -w`, which let's you use TextMate as the editor for git commit messages and much more.  However, the `-w` flag doesn't work with open\_gem, so set the `$GEM_OPEN_EDITOR` variable, and open\_gem will use that instead:

{% highlight bash %}
$ export GEM_OPEN_EDITOR=mate
{% endhighlight %}

You should now be good to go.  If you want to see how it works, just use it on itself!

{% highlight bash %}
$ gem open open_gem
{% endhighlight %}
