![KievII Logo][kieviilogo]

KievII
------

KievII is a Javascript library you can use to build audio apps for the Web.
For now, KievII implements some GUI element (ie labels, knobs, multiknobs, multi-band displays) and uses HTML5 canvas to draw them (but you can extend it to use whatever you want).

Graphic elements chaining is supported in a seminal way (i.e. one element can change the value of one or more elements).

Audio is work in progress. For now, KievII aims to be compatible with Mozilla Audio API + audiodata.js and to provide some audio algorithm (for example, pitchshifting) on top of [dsp.js][dsp.js_address]

Look at a working demo (very early demo - ONLY GUI) [here][demoaddress]

![Demo screenshot][dscreen]



[dscreen]: http://bitterspring.net/images/globals/webshifter_screenshot.png
[demoaddress]: http://bitterspring.net/webshifter/
[kieviilogo]: http://bitterspring.net/images/globals/kievii_logo_little.png
[dsp.js_address]: http://github.com/corbanbrook/dsp.js/
