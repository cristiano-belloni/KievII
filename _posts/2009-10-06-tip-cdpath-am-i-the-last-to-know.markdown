---
layout: post
title: "Tip: cdpath - Am I the last to know?"
categories: [tiny, tip, zsh, terminal, cdpath]
---
This one is just so simple, I can't believe I didn't know about it earlier.

First, setup the cdpath or CDPATH variable:

{% highlight bash %}
cdpath=(~ ~/Projects/apps ~/Projects/tools ~/Projects/plugins ~/Projects/sites)
{% endhighlight %}

Now, changing directory in the shell becomes a whole world easier:

<div class='highlight'><pre><span class="s1">tomw@fellini:~<span class='nv'>$ </span></span><span class='nb'>cd </span>super-secret-app
~/Projects/apps/super-secret-app
<span class="s1">tomw@fellini:~/Projects/apps/super-secret-app<span class='nv'>$ </span></span><span class='nb'>cd </span>Documents
~/Documents
<span class="s1">tomw@fellini:~/Documents<span class='nv'>$ </span></span><span class='nb'>cd </span>tomafro.net
~/Projects/sites/tomafro.net
<span class="s1">tomw@fellini:~/Projects/sites/tomafro.net <span class='err'>$</span></span>
</pre>
</div>

I've already added this to [my dotfiles](http://github.com/tomafro/dotfiles).