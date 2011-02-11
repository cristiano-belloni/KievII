---
layout: post
title: "Tip: Create and move to directory"
categories: [tiny, tip, zsh, peepcode]
---
Before my next post on database indexes, here's a useful little function from the [Advanced Command Line peepcode screencast](http://peepcode.com/products/advanced-command-line) (which I highly recommend).:

{% highlight bash %}
# Create and move to a directory in a single command
# Usage: take ~/Projects/tools/awesometer

take() {
  mkdir -p $1
  cd $1
}
{% endhighlight %}
