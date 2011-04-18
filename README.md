![KievII Logo][kieviilogo]

KievII
------

KievII is a JavaScript Library that simplifies audio web-apps building, from the GUI to the underlying audio details.
KievII supports [HTML5 Canvas](https://developer.mozilla.org/en/HTML/Canvas) and [MozAudio](https://developer.mozilla.org/en/Introducing_the_Audio_API_Extension), but it aims to be completely agnostic to graphical and audio implementations.

KievII has a collection of GUI elements (ie labels, knobs, multiknobs, sliders, buttons, wave display, multi-band displays).  
Advanced control of these elements (recursive chaining, event-driven handling of events) is provided  through the UI object. GUI elements are cross-browser compatible on all browser that support HTML5.

Audio is compatible with Mozilla Audio API + audiodata.js. When HTML5 real-time audio will be standardized, KievII Audio objects will support every browser.  
KievII provides its homebrew DSP algorithms (for example, pitchshifting and time-stretching) standalone or on top of [dsp.js][dsp.js_address]

Look at a [working demo](https://developer.mozilla.org/en-US/demos/detail/voron)  
[It works with Mozilla Firefox 4 (audio and GUI), Opera 11+, Mozilla Firefox 3.6+ and Google Chrome 9+ (GUI Only)]

Look at the documentation [here](https://github.com/janesconference/KievII/wiki).  
You can find a discussion group for developers [here][group_address].

Follow [KievII](https://twitter.com/kievii_library) or [its author](https://twitter.com/janesconference) on Twitter

If you are so cool to contribute to KievII with money (open donation), here's a [Paypal link](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=GVLGLRWSQU9F8&lc=GB&item_name=KievII&item_number=KievII%20Donation&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)  and a [Pledgie link](http://www.pledgie.com/campaigns/14967) for that.

![Demo screenshot][dscreen]

[dscreen]: http://dl.dropbox.com/u/6767816/PublicStuff/voron_ff4.png
[kieviilogo]: http://bitterspring.net/images/globals/kievii_logo_little.png
[dsp.js_address]: http://github.com/corbanbrook/dsp.js/
[emscripten_address]: https://github.com/janesconference/KievII/tree/master/dsp/emscripten_compiled
[group_address]: http://groups.google.com/group/kievii