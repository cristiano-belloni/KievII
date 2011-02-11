---
layout: post
title: Kernel specific ZSH dotfiles
categories: [zsh, osx, linux, tip]
---
I work on a number of different machines, OS X based for development and Linux based for hosting.  I've added various aliases and other commands to my shell, and use [a github repository](http://github.com/tomafro/dotfiles) to share this configuration between these machines.

This works well, but while most commands work commonly across Linux and OS X, there are some nasty differences.  One example is `ls` which takes different arguments on both systems; the default `ls` alias I use on OS X doesn't work on Linux.  So how can we accommodate these differences, without removing all the shared configuration?

The answer is really simple.  Create kernel specific configuration files, and use a case statement to load the correct one.  The main obstacle was finding a way to distinguish between each kernel.  In the end I found the `$system_name` environment variable, which is set on both OS X and the servers I use.  

Here's the code:

{% highlight bash %}
case $system_name in
  Darwin*)
    source ~/.houseshare/zsh/kernel/darwin.zsh
    ;;
  *)
    source ~/.houseshare/zsh/kernel/linux.zsh
    ;;;
esac
{% endhighlight %}

As I said, simple.