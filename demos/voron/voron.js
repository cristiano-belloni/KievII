var VORON = {};

/* AUDIO INIT FUNCTION */
VORON.audioInit = function() {

    // This is initialized here for the first time.
    this.audioOk = false;

    // AUDIO SOURCE INIT
    this.audio = document.getElementById("a1");
    try {
        this.source = new AudioDataSource(this.audio);
    }
    catch (err) {
        console.log ("Catched an exception: ", err, " Audio could be not loaded: ", err.description);
        return;
    }
    this.shifterParams = {};
    this.outputDestination = new AudioDataDestination();

    //Set auto latency.
    this.outputDestination.autoLatency = true;

    //The original signal must not be played back.
    this.audio.volume = 0;

    // END OF AUDIO SOURCE INIT

    // PITCH SHIFTER INIT

    this.shifterParams.fftFrameSize = 2048;
    // This member will be set again when shifter knob's setValue is called.
    // We need to initialize it to something, though.
    this.shifterParams.shiftAmount = 1;
    this.shifterParams.osamp = 4;
    this.shifterParams.algo = "RFFT";
    this.filter_shifter = new AudioDataShifterFilter (this.outputDestination, this.shifterParams);
    this.filter_shifter.setOnOff(false);
    //source.readAsync(this.filter_shifter);

    // END OF PITCH SHIFTER INIT

    // LOWPASS FILTER INIT

    this.filter_lowpass = new ADLowPassFilter(this.filter_shifter, 2000, 10, 44100);
    this.filter_lowpass.setOnOff(false);

    // END OF LOWPASS FILTER INIT

    // VOLUME FILTER INIT

    // Lowpass filter is chained after the pitch filter, and so on.
    this.filter_volume = new ADSimpleVolume (this.filter_lowpass, 0.5);

    // END OF VOLUME FILTER INIT

    this.audioOk = true;

    // This sets the chain end.
    this.source.readAsync(this.filter_volume);

}

/* END OF AUDIO INIT FUNCTION */


/*** CALLBACKS ***/

VORON.imageLoaded = function () {
    var that = this;
    // Actual callback
    return function (loaderStatus) {
        if (that.errState !== true) {
            var ls = loaderStatus;
            that.message.innerHTML =  ls.status.id  + " loaded image " + ls.status.loaded + " of " + ls.status.total;
        }
    }
}

VORON.imageError = function () {
    var that = this;
    // Actual callback
    return function (loaderStatus) {
        var ls = loaderStatus;
        that.errState = true;
        that.message.innerHTML =  ls.status.id  + ": ERROR loading images " /* + ls.obj.src */;
    }
}

VORON.singleLoaded = function () {
    var that = this;
    // Actual callback
    return function (loaderStatus) {
        if (that.errState !== true) {
            var ls = loaderStatus;
            that.message.innerHTML = ls.status.id + " loaded...";
        }
    }
}

/* END OF LOADING MANAGER */

/* ELEMENT CALLBACKS */

VORON.pitchCallback = function () {
    var that = this;
    return function (slot, value) {

        // Interpolation is linear here. Maybe this could be enhanced with a
        // more sophisticated kind of interpolation.
        
        // LINEAR INTERPOLATION: x := (c - a) * (z - y) / (b - a) + y
        // c = value; a = 0; b = 1; y = 0.5; z = 2
        var shift_value = value * (1.5) + 0.5;

        if (that.discretePitch === true) {
            shift_value = parseFloat(shift_value.toFixed(1));
        }

        if (that.audioOk === true) {
            that.filter_shifter.setShift(shift_value);
            console.log ("pitch callback finished: slot is ", slot, " and value is ", value, " while shifting ratio is ", shift_value);
        }

        else {
            console.log ("No moz-audio, just skipping");
        }

        that.label.setValue("labelvalue", "Pitch Ratio_ " + shift_value.toFixed(3));
    };
}

VORON.freqCallback = function () {
    var that = this;
    return function (slot, value) {

        // LINEAR INTERPOLATION: x := (c - a) * (z - y) / (b - a) + y
        // c = value; a = 0; b = 1; y = 20; z = 2000
        var cutoff_value = value  * (2000 - 20) + 20;

        if (that.audioOk === true) {
            that.filter_lowpass.setCutoff(cutoff_value);
            console.log ("freq callback finished: slot is ", slot, " and value is ", value, " while cutoff is ", cutoff_value);
        }

        else {
            console.log ("No moz-audio, just skipping");
        }
        that.label.setValue("labelvalue", "LPF Cutoff_ " + cutoff_value.toFixed() + " Hz");
    };
}

VORON.qCallback = function () {
    // Closure: callbacks return a function. One could use bind() alternatively.
    var that = this;
    return function (slot, value) {

        // LINEAR INTERPOLATION: x := (c - a) * (z - y) / (b - a) + y
        // c = value; a = 0; b = 1; y = 1; z = 50
        var q_value = value  * (50 - 1) + 1;

        if (that.audioOk === true) {
            that.filter_lowpass.setResonance(q_value);
            console.log ("q callback finished: slot is ", slot, " and value is ", value, " while res is ", q_value);
        }

        else {
            console.log ("No moz-audio, just skipping");
        }
        that.label.setValue("labelvalue", "LPF Resonance_ " + q_value.toFixed());
    };
}

VORON.volCallback = function () {
    var that = this;
    return function (slot, value) {
        var vol_value = 1 - value;

        if (that.audioOk === true) {
            that.filter_volume.setVolume (vol_value);
            console.log ("vol callback finished: slot is ", slot, " and value is ", value, " while volume is ", vol_value);
        }

        else {
            console.log ("No moz-audio, just skipping");
        }
        that.label.setValue("labelvalue", "Volume_ " + vol_value.toFixed(3));
    };
}

VORON.switchCallback = function () {
    var that = this;
    return function (slot, value, elName) {

            console.log ("switch callback called: element is ", elName, " slot is ", slot, " and value is ", value, " while that is ", that);
            switch (elName) {
                case "pitchOnSwitch":
                    if (value === 1) {

                        if (that.audioOk === true) {
                            console.log ("Setting pitch off: ", value);
                            that.filter_shifter.setOnOff(false);
                        }

                        that.label.setValue("labelvalue", "Pitch_ OFF" );

                        break;
                    }
                    if (value === 0) {

                        if (that.audioOk === true) {
                            console.log ("Setting pitch on: ", value);
                            that.filter_shifter.setOnOff(true);
                        }

                        that.label.setValue("labelvalue", "Pitch_ ON" );

                        break;
                    }
                    console.log ("pitchswitch has a strange value: ", value);
                break;

                case "freqSwitch":
                    if (value === 1) {

                        if (that.audioOk === true) {
                            console.log ("Setting freq off: ", value);
                            that.filter_lowpass.setOnOff(false);
                        }

                        that.label.setValue("labelvalue", "LP Filter_ OFF" );

                        break;
                    }
                    if (value === 0) {

                        if (that.audioOk === true) {
                            console.log ("Setting freq on: ", value);
                            that.filter_lowpass.setOnOff(true);
                        }

                        that.label.setValue("labelvalue", "LP Filter_ ON" );

                        break;
                    }
                    console.log ("pitchswitch has a strange value: ", value);
                break;

                case "pitchDiscSwitch":
                    if (value === 1) {

                        console.log ("Setting pitch Discrete off: ", value);
                        that.discretePitch = false;
                        that.label.setValue("labelvalue", "Pitch Disc_ OFF" );

                        break;
                    }
                    if (value === 0) {

                        console.log ("Setting pitch Discrete on: ", value);
                        that.discretePitch = true;
                        that.label.setValue("labelvalue", "Pitch Disc_ ON" );

                        break;
                    }
                    console.log ("pitchDiscSwitch has a strange value: ", value);
                break;

                default:
                //nothing to be done
            }
    };
}

/* END OF ELEMENT CALLBACKS */

/* LOADING MANAGER */

VORON.loadingManager = function () {
    // Closure: persistent variables.
    var that = this;

        // Actual callback
        return function (loaders) {

            if (that.errState === true) {
                return;
            }
            
            console.log ("Big Callback, loaded everything");
                that.message.innerHTML = "Everything loaded, ready.";

            var knobArgs,
                volSliderArgs,
                switchArgs,
                switchCallbackManager;

            /* BACKGROUND INIT */

            that.gui = new Background({
                ID: 'background',
                image: loaders["bgImageLoader"].images[0],
                top: 0,
                left: 0
            });

            that.ui.addElement(that.gui, {zIndex: 0});

            /* END OF BACKGROUND INIT */

            /* LABEL INIT */

            // Every element calls label's setValue in the callback, so let's make sure
            // that label is declared first.
            that.label = new Label({
                    ID: 'status',
                    width : 320,
                    height : 29,
                    top : 336,
                    left : 278,
                    objParms: {
                        font: "28px embedded_font",
                        textColor: "#000",
                        textBaseline: "top",
                        textAlignment: "left"
                    }
                });

            /* END OF LABEL INIT */

            /* KNOB INIT */


            // Shared arguments to the Knob constructor.
            knobArgs = {
                imagesArray: loaders["knobImageLoader"].images,
                sensivity : 5000,
                preserveBg: true
            };

            // Create the knob objects.

            // PITCH KNOB
            knobArgs.onValueSet = that.pitchCallback();
            knobArgs.ID = "pitchKnob";
            knobArgs.top = 150;
            knobArgs.left = 118;
            that.pitchKnob = new Knob(knobArgs);
            that.pitchKnob.setValue("knobvalue", 0.333);
            that.ui.addElement(that.pitchKnob, {zIndex: 5});

            // FREQ KNOB
            knobArgs.onValueSet = that.freqCallback();
            knobArgs.ID = "freqKnob";
            knobArgs.top = 150;
            knobArgs.left = 319;
            that.freqKnob = new Knob(knobArgs);
            that.freqKnob.setValue("knobvalue", 1);
            that.ui.addElement(that.freqKnob, {zIndex: 5});

            // Q KNOB
            knobArgs.onValueSet = that.qCallback();
            knobArgs.ID = "qKnob";
            knobArgs.top = 150;
            knobArgs.left = 472;
            that.qKnob = new Knob(knobArgs);
            that.qKnob.setValue("knobvalue", 0);
            that.ui.addElement(that.qKnob, {zIndex: 5});

            /* END OF KNOB INIT */

            /* FADER INIT */

            //VOL FADER
            volSliderArgs = {
                ID: "volSlider",
                top: 136,
                left: 695,
                sliderImg: loaders["sliderImageLoader"].images[0],
                knobImg: loaders["sliderImageLoader"].images[1],
                type: "vertical",
                onValueSet: that.volCallback()
            };

            volSliderArgs.onValueSet = that.volCallback();
            that.volSlider = new Slider(volSliderArgs);
            that.volSlider.setValue("slidervalue", 0.5);
            that.ui.addElement(that.volSlider, {zIndex: 5});

            /* END OF FADER INIT */

            /* SWITCHES INIT */

            // This time, we use an single callback for all switch buttons.
            switchCallbackManager = that.switchCallback();

            // Shared arguments to the Button constructor.
            switchArgs = {
                imagesArray : loaders["switchImageLoader"].images,
                onValueSet: switchCallbackManager
            };

            // Create the switch objects.
            switchArgs.ID = "pitchOnSwitch";
            switchArgs.top = 107;
            switchArgs.left = 140;
            that.pitchOnSwitch = new Button(switchArgs);

            switchArgs.ID = "pitchDiscSwitch";
            switchArgs.top = 339;
            switchArgs.left = 140;
            that.pitchDiscSwitch = new Button(switchArgs);

            switchArgs.ID = "freqSwitch";
            switchArgs.top = 107;
            switchArgs.left = 416;
            that.freqSwitch = new Button(switchArgs);

            // These buttons have 0 = on and 1 = off.
            that.pitchOnSwitch.setValue ("buttonvalue", 1);
            that.pitchDiscSwitch.setValue ("buttonvalue", 1);
            that.freqSwitch.setValue ("buttonvalue", 1);

            that.ui.addElement(that.pitchOnSwitch, {zIndex: 5});
            that.ui.addElement(that.pitchDiscSwitch, {zIndex: 5});
            that.ui.addElement(that.freqSwitch, {zIndex: 5});

            /* END OF SWITCHES INIT */

            // Label is added at the end, because otherwise it displays garbage when
            // its value is set.
            that.ui.addElement(that.label, {zIndex: 5});

            that.audioInit();

            that.ui.refresh();

            if (that.audioOk !== true) {
                that.label.setValue("labelvalue", "Audio *NOT* supported by browser");
                that.message.innerHTML = "Your browser lacks support for AudioDataSource.";
            }

            else {
                that.label.setValue ("labelvalue", "Audio support OK");
            }
    }
}

VORON.init = function () {

    /* HOISTED VARs */

    var MAX_KNOB_IMAGE_NUM = 60,
        knobImgLocation = "./images/BigKnob/",
        knobImgArray = [];

    /* END OF HOISTED VARs */

    /* CONTEXT INIT */
    var plugin_canvas = document.getElementById("plugin");

    var CWrapper = K2WRAPPER.createWrapper("CANVAS_WRAPPER",
                                               {canvas: plugin_canvas}
                                               );

    this.message = document.getElementById("message");
    this.message.innerHTML = "Loading elements...";

    this.ui = new UI (plugin_canvas, CWrapper);

    this.loadCallback = this.loadingManager();
    /* END OF CONTEXT INIT */

    /* LOAD IMAGES */

    // Generate knob image names with an immediate function.
    (function () {
        for (var i = 0; i <= MAX_KNOB_IMAGE_NUM; i++) {
            var prefix = "";
            if (i < 10) {
                prefix = "0";
            }
            knobImgArray[i] = knobImgLocation + "BigKnob" + prefix + i + ".png";
        }
    }());


    var mulArgs = { multipleImages:
                            [
                                {ID: "knobImageLoader", imageNames: knobImgArray},
                                {ID: "bgImageLoader", imageNames: ["images/Voron_bg1.png"]},
                                {ID: "sliderImageLoader", imageNames: ["images/Fader/slider_slot.png", "images/Fader/slider_handle.png"]},
                                {ID: "switchImageLoader", imageNames: ["./images/Switch/SwitchLeft.png","./images/Switch/SwitchRight.png"]}
                            ],
                         onComplete: this.loadCallback,
                         onError: this.imageError(),
                         onSingle: this.imageLoaded(),
                         onSingleArray: this.singleLoaded()
                     }

    this.errState = false;

    this.mImageLoader = new loadMultipleImages (mulArgs);

     /* END OF LOAD IMAGES */

    }
    