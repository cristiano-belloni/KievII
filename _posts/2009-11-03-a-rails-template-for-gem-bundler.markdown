---
layout: post
title: A rails template for gem bundler
categories: [ruby, rails, gem, bundler]
---
Following Nick Quaranto's article ['Gem Bundler is the Future'](http://litanyagainstfear.com/blog/2009/10/14/gem-bundler-is-the-future/), I was inspired to try out [bundler](http://github.com/wycats/bundler) on my latest rails project.  Previously, I've found rails' own gem management a massive headache.  In contrast, using bundler has been a pleasure.

Getting it set up how I wanted took a fair bit of experimentation, so to make things easier both for me and the wider community, I've  made a rails template to do the hard work.

Give it a try by running the following. You should be up and running in a couple of minutes:

{% highlight bash %}
rails -m http://github.com/tomafro/dotfiles/raw/master/resources/rails/bundler.rb <project>
{% endhighlight %}

That will give you a bundled project, ready for you to add your own gems.  Here's what each step of the template actually does:

Gem bundler is itself a gem.  It can't be used to manage itself, so to ensure that all environments use the same version, the first step is to install it right into the project:

{% highlight ruby %}
inside 'gems/bundler' do  
  run 'git init'
  run 'git pull --depth 1 git://github.com/wycats/bundler.git' 
  run 'rm -rf .git .gitignore'
end
{% endhighlight %}

Just having bundler installed is no good without any way to run it; a script is needed.  Once this is installed the local bundler can be run with `script/bundle <options>`:

{% highlight ruby %}
file 'script/bundle', %{
#!/usr/bin/env ruby
path = File.expand_path(File.join(File.dirname(__FILE__), "..", "gems/bundler/lib"))
$LOAD_PATH.unshift path
require 'rubygems'
require 'rubygems/command'
require 'bundler'
require 'bundler/commands/bundle_command'
Gem::Commands::BundleCommand.new.invoke(*ARGV)
}.strip

run 'chmod +x script/bundle'
{% endhighlight %}

Bundler uses Gemfiles to declare which gems are required in each environment.  This simple `Gemfile` includes rails in all environments, and ruby-debug in all environments other than production:

{% highlight ruby %}
file 'Gemfile', %{
clear_sources
source 'http://gemcutter.org'

disable_system_gems

bundle_path 'gems'

gem 'rails', '#{Rails::VERSION::STRING}'
gem 'ruby-debug', :except => 'production'
}.strip
{% endhighlight %}

Most of the files bundler will place in the `gem` path can be regenerated; they shouldn't be added to the project repository.  The only things that should be added are the `.gem` files themselves, and the local copy of bundler.  All the rest should be ignored:

{% highlight ruby %}
append_file '.gitignore', %{
gems/*
!gems/cache
!gems/bundler}
{% endhighlight %}

The bundle script needs to be run for the first time:

{% highlight ruby %}
run 'script/bundle'
{% endhighlight %}

Finally rails needs to be modified to ensure the bundler environment is loaded.  This is done it two parts.  First, a preinitializer is added to load the bundler's environment file before anything else:

{% highlight ruby %}
append_file '/config/preinitializer.rb', %{
require File.expand_path(File.join(File.dirname(__FILE__), "..", "gems", "environment"))
}
{% endhighlight %}

Second, rails initialization process is hijacked to require the correct bundler environment:

{% highlight ruby %}
gsub_file 'config/environment.rb', "require File.join(File.dirname(__FILE__), 'boot')", %{
require File.join(File.dirname(__FILE__), 'boot')

# Hijack rails initializer to load the bundler gem environment before loading the rails environment.

Rails::Initializer.module_eval do
  alias load_environment_without_bundler load_environment
  
  def load_environment
    Bundler.require_env configuration.environment
    load_environment_without_bundler
  end
end
}
{% endhighlight %}

And that's it.  The project is now fully bundled.  More gems can be added to the `Gemfile` and pulled into the project with `script/bundle`.