![KievII Logo][kieviilogo]

KievII
------

KievII is a Javascript library that gives you all the tools to build audio apps for the Web.

KievII has a collection of GUI elements (ie labels, knobs, multiknobs, sliders, buttons, wave display, multi-band displays) and uses HTML5 canvas to render them (but you can extend it to use whatever you want). Advanced control of these elements (recursive chaining, event-driven handling of events) is provided  through the UI object. GUI elements are cross-browser compatible on all browser that support HTML5.

Audio is compatible with Mozilla Audio API + audiodata.js. When HTML5 real-time audio handling will be standardized, KievII Audio objects will support every browser. 
KievII provides its homebrew DSP algorithms (for example, pitchshifting and time-stretching) standalone or on top of [dsp.js][dsp.js_address]

Look at a working demo -- works with Mozilla Firefox 4 (audio and GUI) and Mozilla Firefox 3.6 and Google Chrome (GUI Only) [here](http://bitterspring.net/KievII_site/demos/voron/index.html).

You can find a discussion group for developers [here][group_address].

![Demo screenshot][dscreen]

[dscreen]: http://dl.dropbox.com/u/6767816/PublicStuff/voron_ff4.png
[kieviilogo]: http://bitterspring.net/images/globals/kievii_logo_little.png
[dsp.js_address]: http://github.com/corbanbrook/dsp.js/
[emscripten_address]: https://github.com/janesconference/KievII/tree/master/dsp/emscripten_compiled
[group_address]: http://groups.google.com/group/kievii