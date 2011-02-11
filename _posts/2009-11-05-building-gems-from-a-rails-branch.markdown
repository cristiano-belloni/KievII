---
layout: post
title: Building rails gems from the 2-3-stable branch
categories: [ruby, rails, gem, bundler]
---
For the latest application I've been working on, I wanted to use [Michael Koziarski's rails_xss plugin](http://github.com/NZKoz/rails_xss/), to turn default escaping on in my erb templates.  I'm also using [wycats gem bundler](http://github.com/wycats/bundler/) to manage gems and their dependencies, including rails.

This posed a problem: xss_rails requires changes made in rails 2-3-stable branch, but not yet released in a gem (though they will be included in 2.3.5).

The solution was obvious: build my own gems, and get bundler to use them.  Luckily, rails makes this an easy process.

First, clone rails from github, and change to the 2-3-stable branch:

{% highlight bash %}
git clone git://github.com/rails/rails.git
cd rails
git co -b 2-3-stable origin/2-3-stable
{% endhighlight %}

Next, we need to build the gems.  Rails currently doesn't seem to have a Raketask to build all its constituent projects (though I'm planning a patch to include one), so you have to build each one in turn:

{% highlight bash %}
cd actionmailer
rake gem PKG_BUILD=1
cd ../actionpack
rake gem PKG_BUILD=1
cd ../activerecord
rake gem PKG_BUILD=1
cd ../activeresource
rake gem PKG_BUILD=1
cd ../activesupport
rake gem PKG_BUILD=1
cd ../railties
rake gem PKG_BUILD=1
cd ..
{% endhighlight %}

The key is the `PKG_BUILD` variable.  It appends a suffix to the rails version, so rather than building 2.3.4 (the version I checked out), it will build 2.3.4.1.  If I decided to update my gems, I'd use PKG_BUILD=2, then 3 and so on.

Finally, once all these gems are built, it's simply a case of finding them and using them.  For gem bundler, this means placing them in the cache and updating the Gemfile to look for rails '2.3.4.1'.  The gems are all built in pkg folders in their respective subprojects, so to copy them all somewhere else you can run:

{% highlight bash %}
cp **/pkg/*.gem <project-folder>/gems/cache
{% endhighlight %}
