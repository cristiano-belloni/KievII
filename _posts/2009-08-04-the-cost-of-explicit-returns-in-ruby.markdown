---
layout: post
title: The cost of explicit returns in ruby
categories: [ruby, micro-benchmark, return]
---
Yesterday [Pratik Naik wrote a post](http://m.onkey.org/2009/8/3/ruby-i-don-t-like-1-explicit-return) on one of his pet hates - explicit returns in ruby.  I agree 100% with Pratik, I can't stand them either.  

In one of the comments, Chris Wanstrath posted [this microbenchmark](http://gist.github.com/160718) showing that using explicit returns incurs a surprising performance hit.  It seemed crazy to me, so I thought I'd investigate further, running the benchmark on jruby and ruby 1.9 for comparison.

### ruby 1.8.7 (2008-08-11 patchlevel 72) 

<pre>
               user     system      total        real
explicit   3.420000   0.020000   3.440000 (  3.478501)
implicit   2.220000   0.000000   2.220000 (  2.236413)
</pre>

### jruby 1.1.6 (ruby 1.8.6 patchlevel 114)

<pre>
               user     system      total        real
explicit   2.611000   0.000000   2.611000 (  2.611001)
implicit   2.541000   0.000000   2.541000 (  2.541385)
</pre>

### ruby 1.9.1p0 (2009-01-30 revision 21907)

<pre>
               user     system      total        real
explicit   1.580000   0.010000   1.590000 (  1.614273)
implicit   1.520000   0.000000   1.520000 (  1.537492)
</pre>

So neither jruby nor ruby 1.9 incur this penalty.  

Is this good news or not?  If, like me, you consider explicit returns a code smell, I guess it doesn't matter either way.