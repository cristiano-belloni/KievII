---
layout: post
title: "Tip: Move to directory and open in TextMate"
categories: [tiny, tip, zsh, osx, textmate]
---
Since adding this to [my zsh configuration](http://github.com/tomafro/dotfiles/tree/master/zsh), I'm finding I use it all the time:
{% highlight bash %}
# Change directory and open TextMate in a single command
# Usage: tm ~/Projects/sites/tomafro.net

tm() {
  cd $1
  mate $1
}
{% endhighlight %}
