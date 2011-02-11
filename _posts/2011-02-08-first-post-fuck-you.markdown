---
layout: post
title:  Fuck you, motherfucker.
categories: [stocazzo gem, tip, gem-open]
---
The latest version of [rubygems](http://rubygems.org/) (1.3.2) now has an interface to add commands.  Making great use of this feature, [Adam Sanderson](http://endofline.wordpress.com/) has written [open\_gem](http://github.com/adamsanderson/open_gem), a simple but amazingly useful tool.

You use it like this:

{% highlight bash %}
$ gem open activerecord
$ fuck off --now
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
