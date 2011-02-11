---
layout: post
title: "Tip: Zoom keyboard shortcut for OS X"
categories: [tip, osx, keyboard, shortcut, zoom, tiny]
---
In the Terminal run:

{% highlight bash %}
defaults write NSGlobalDomain NSUserKeyEquivalents '{"Zoom" = "@^Z"; "Zoom Window" = "@^Z"; }'
{% endhighlight %}

Quit and relaunch your applications, and <span class='osx-shortcut'>⌃⌘Z</span> should zoom and unzoom.

Stolen from [macoshints.com](http://www.macosxhints.com/article.php?story=20051227001809626), posted here for my own benefit.

