---
layout: post
title: KievII Home Page
description: KievII - Javascript library for Web audio apps
---
<h2>KievII</h2>


KievII is a Javascript library to build audio apps for the Web, [hosted](https://github.com/janesconference/KievII) on [github.com](http://github.com). Go to the blog [here](blog.html) for the latest news.

KievII implements some GUI elements (ie labels, knobs, multiknobs, sliders, buttons, multi-band displays) and uses HTML5 canvas to render them (but you can extend it to use whatever you want).
Elements chaining is supported through the UI object (i.e. one element can automatically change the value of one or more other elements).

Audio is work in progress. Demos in KievII aim to be compatible with Mozilla Audio API + audiodata.js and to provide homebrew DSP algorithms (for example, pitchshifting) on top of [dsp.js](http://github.com/corbanbrook/dsp.js/).
KievII uses [Emscripten](https://github.com/janesconference/KievII/tree/master/dsp/emscripten_compiled) to automatically  translate C/C++ DSP algorithms in javascript.

You can find a Google discussion group for developers [here][group_address].

You can clone the project with [Git](http://git-scm.com):

{% highlight bash %}
git clone git://github.com/janesconference/KievII
{% endhighlight %}

or download it in either [ZIP](http://github.com/janesconference/KievII/zipball/master) or [TAR](http://github.com/janesconference/KievII/tarball/master) format.

<h3>About the author</h3>
KievII is a project started by Jane's Conference (Cristiano Belloni), a developer based in [Bologna](http://en.wikipedia.org/wiki/Bologna).  

If you're interested in contacting me, my email is <a href="mailto:janesconference@bittespring.net">janesconference@bitterspring.net</a>.

This site is built using [Jekyll](http://github.com/mojombo/jekyll/tree/master), the 'blog-aware, static site generator'.  The theme was heavily inspired from tomafro.net [GitHub Project] (https://github.com/tomafro/tomafro.net). Date archives and tag pages are generated using a rake task.

[kieviilogo]: http://bitterspring.net/images/globals/kievii_logo_little.png
[dsp.js_address]: 
[emscripten_address]: 
[group_address]: http://groups.google.com/group/kievii
