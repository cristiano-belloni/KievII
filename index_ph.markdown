---
layout: default
title: KievII Home Page
description: KievII - Javascript library for Web audio apps
---
<h2>KievII</h2>


KievII is a Javascript library to build audio apps for the Web, [hosted](https://github.com/janesconference/KievII) on [github.com](http://github.com).

KievII implements some GUI elements (ie labels, knobs, multiknobs, sliders, buttons, multi-band displays) and uses HTML5 canvas to render them (but you can extend it to use whatever you want).
Elements chaining is supported through the UI object (i.e. one element can automatically change the value of one or more elements).

Audio is work in progress. Demos in KievII aim to be compatible with Mozilla Audio API + audiodata.js and to provide homebrew DSP algorithms (for example, pitchshifting) on top of [dsp.js][dsp.js_address].
KievII uses [Emscripten][emscripten_address] to automatically  translate C/C++ DSP algorithms in javascript.

You can find a Google discussion group for developers [here][group_address].

You can clone the project with [Git](http://git-scm.com):

{% highlight bash %}
git clone git://github.com/janesconference/KievII
{% endhighlight %}

or download it in either [ZIP](http://github.com/janesconference/KievII/zipball/master) or [TAR](http://github.com/janesconference/KievII/tarball/master) format.

[kieviilogo]: http://bitterspring.net/images/globals/kievii_logo_little.png
[dsp.js_address]: http://github.com/corbanbrook/dsp.js/
[emscripten_address]: https://github.com/janesconference/KievII/tree/master/dsp/emscripten_compiled
[group_address]: http://groups.google.com/group/kievii