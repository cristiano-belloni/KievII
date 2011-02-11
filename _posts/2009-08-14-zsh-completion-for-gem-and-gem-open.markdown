---
layout: post
title: ZSH Completion for gem and gem open
categories: [zsh, completion, gem, gem-open]
---
I've been trying to get my head around the ZSH completion system.  It's not easy, but I'm slowly making progress.

Here's my first semi-successful attempt.  It provides command completion for `gem` (including installed commands) and gem name completion for specific gem commands (`update`, and `open` from [Adam Sanderson](http://tomafro.net/2009/05/adam-sandersons-open-gem)).

So typing `gem <tab>` gives a list of possible commands, whilst `gem open <tab>` will complete with the names of the currently installed gems.

{% highlight bash %}
#compdef gem

_gem_commands () {
  if [[ -z $gem_commands ]] ; then
    gem_commands=$(gem help commands | grep '^    [a-z]' | cut -d " " -f 5)
  fi
  
  # This seems unnecessary, but if I try to set gem_commands to an array, it falls over.
 
  typeset -a gem_command_array
  gem_command_array=($(echo $gem_commands))
  compadd $gem_command_array
}
 
_installed_gems () {
  if [[ -z $installed_gems ]] ; then
    installed_gems=($(gem list | grep '^[A-Za-z]' | cut -d " " -f 1))
  fi
  
  typeset -a installed_gem_array
  installed_gem_array=($(echo $installed_gems))
  compadd $installed_gem_array
}
 
if (( CURRENT == 2 )); then
  _gem_commands
else
  if [[ $words[2] == open || $words[2] == update ]] ; then
    _installed_gems
  fi
fi
{% endhighlight %}

As it's a first attempt, it's a long way from perfect.  I've [put it on gist](http://gist.github.com/167309), for other people to play with, and I'd appreciate any advice or improvements.  Specifically I'd like to know how to avoid the use of both `gem_command_array` and `gem_commands`.  I'd also like to know a better way to check if the given command is in the list `[open, update]`.  

Please fork the gist, or [tweet me](http://twitter.com/tomafro) with your suggestions.