---
layout: post
title: "Tip: Open new tab in OS X Terminal"
categories: [tiny, tip, zsh, osx, terminal]
---
Another simple shell function, this time just for OS X.  

Usage is simple: `tab <command>` opens a new tab in Terminal, and runs the given command in the current working directory.  For example `tab script/server` would open a new tab and run `script/server`.
{% highlight bash %}
tab () {
  osascript 2>/dev/null <<EOF
    tell application "System Events"
      tell process "Terminal" to keystroke "t" using command down
  	end
  	tell application "Terminal"
      activate
      do script with command "cd $PWD; $*" in window 1
    end tell
  EOF
}
{% endhighlight %}
