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
    this.shifterParams.shiftAmount = 0.333; //about 1, with linear interpolation
    this.shifterParams.osamp = 4;
    this.shifterParams.algo = "RFFT";
    this.filter_shifter = new AudioDataShifterFilter (this.outputDestination, this.shifterParams);
    //source.readAsync(this.filter_shifter);

    // END OF PITCH SHIFTER INIT

    // LOWPASS FILTER INIT

    this.filter_lowpass = new ADLowPassFilter(this.filter_shifter, 2000, 10, 44100);

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

/* KEEP ON */

VORON.keepON = function () {

    this.audioInit();

    // Here Alpha 0.01 is a bit chaotic: something like ui.refresh()
    // would be more appropriate, I guess. This statement refreshes the deck.
    this.gui.refresh();
    
    // Element.refresh() is useless; these elements are autorefreshed when their
    // value is set.
    this.pitchKnob.setValue("knobvalue", 0.333);
    this.freqKnob.setValue("knobvalue", 1);
    this.qKnob.setValue("knobvalue", 0);
    this.volSlider.setValue("slidervalue", 0.5);

    // These buttons have 0 = on and 1 = off.
    this.pitchOnSwitch.setValue ("buttonvalue", 0);
    this.pitchDiscSwitch.setValue ("buttonvalue", 0);
    this.freqSwitch.setValue ("buttonvalue", 0);

    if (this.audioOk !== true) {
        this.label.setValue("labelvalue", "Audio *NOT* supported by browser");
        this.message.innerHTML = "Your browser lacks support for AudioDataSource.";
    }

    else {
        this.label.setValue ("labelvalue", "Audio support OK");
    }

}

/* --END */

/*** CALLBACKS ***/

/* LOADING MANAGER */

VORON.loadingManager = function (elementName) {
    // Closure persistent variables.
    var that = this,
        loadStatus = {
            pitchKnob: false, freqKnob: false, qKnob: false,
            background: false, volSlider: false,
            pitchOnSwitch: false, pitchDiscSwitch : false,
            freqSwitch: false
        };

        // Actual callback
        return function (elementName) {
            console.log (elementName, " called back to say everything is loaded.");

            // Update the element status
            if (loadStatus[elementName] !== undefined) {
                loadStatus[elementName] = true;

            // Update the message bar
            that.message.innerHTML = elementName + " loaded...";
        }

            // Check if every registered element is complete.
            for (var element in loadStatus) {
                if (loadStatus.hasOwnProperty(element)) {
                    if (loadStatus[element] !== true) {
                        console.log ("status of element ", element, " is not true: ", loadStatus[element]);
                        return;
                    }
                }
            }

            // Update the message bar
            that.message.innerHTML = "Everything loaded, ready.";
            that.keepON();
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

VORON.init = function () {

    /* HOISTED VARs */

    var MAX_KNOB_IMAGE_NUM = 60,
        knobImgLocation = "./images/BigKnob/",
        knobImgArray = [],
        knobArgs,
        bgArgs,
        volSliderArgs,
        switchArgs,
        pitchArgs,
        freqArgs,
        qArgs,
        labelArgs,
        switchCallbackManager;

    /* END OF HOISTED VARs */

    /* CONTEXT INIT */
    this.plugin_canvas = document.getElementById("plugin"),
    this.plugin_context = this.plugin_canvas.getContext("2d");
    this.message = document.getElementById("message");
    this.message.innerHTML = "Loading elements...";

    this.ui = new UI (this.plugin_canvas);

    this.imageDisplayer = new CanvasDrawImage (this.plugin_context);
    this.freqKnobImageDisplayer = new CanvasDrawImage (this.plugin_context);
    this.qKnobImageDisplayer = new CanvasDrawImage (this.plugin_context);
    this.pitchKnobImageDisplayer = new CanvasDrawImage (this.plugin_context);
    this.volImageDisplayer = new CanvasDrawImage (this.plugin_context);
    this.switchImageDisplayer = new CanvasDrawImage (this.plugin_context);
    this.labelDisplayer = new CanvasDrawImage (this.plugin_context);
    this.labelDisplayer = new CanvasDrawText (this.plugin_context);

    this.labelDisplayer.setFont ("28px embedded_font");
    this.labelDisplayer.setFillStyle('#3b6038');
    this.labelDisplayer.setTextStyle('#000');

    this.loadCallback = this.loadingManager();
    /* END OF CONTEXT INIT */

    /* BACKGROUND INIT */

    bgArgs = {
        image: "./images/Voron_bg1.png",
        onComplete: this.loadCallback
    };

    this.gui = new Background("background", [0,0], bgArgs);

    /* END OF BACKGROUND INIT */

    /* KNOB INIT */

    // Generate knob image names with an immediate funtion.
    (function () {
        for (var i = 0; i <= MAX_KNOB_IMAGE_NUM; i++) {
            var prefix = "";
            if (i < 10) {
                prefix = "0";
            }
            knobImgArray[i] = knobImgLocation + "BigKnob" + prefix + i + ".png";
        }
    }());


    // Shared arguments to the Knob constructor.
    knobArgs = {
        images : knobImgArray,
        sensivity : 5000,
        onComplete: this.loadCallback,
        preserveBg: true
    };

    // Create the knob objects.

    // PITCH KNOB
    pitchArgs = knobArgs.clone();
    pitchArgs.onValueSet = this.pitchCallback();
    this.pitchKnob = new Knob("pitchKnob", [118, 150], pitchArgs);

    // FREQ KNOB
    freqArgs = knobArgs.clone();
    freqArgs.onValueSet = this.freqCallback();
    this.freqKnob = new Knob("freqKnob", [319, 150], freqArgs);

    // Q KNOB
    qArgs = knobArgs.clone();
    qArgs.onValueSet = this.qCallback();
    this.qKnob = new Knob("qKnob", [472, 150], qArgs);

    /* END OF KNOB INIT */

    /* FADER INIT */

    //VOL FADER
    volSliderArgs = {
        sliderImg:"./images/Fader/slider_slot.png", knobImg:"./images/Fader/slider_handle.png",
        type:"vertical",
        onComplete: this.loadCallback
    };

    volSliderArgs.onValueSet = this.volCallback();
    this.volSlider = new Slider("volSlider", [695, 136], volSliderArgs);

    /* END OF FADER INIT */

    /* SWITCHES INIT */

    // This time, we use an single callback for all switch buttons.
    switchCallbackManager = this.switchCallback();

    // Shared arguments to the Button constructor.
    switchArgs = {
        images : ["./images/Switch/SwitchLeft.png","./images/Switch/SwitchRight.png"],
        onComplete: this.loadCallback,
        onValueSet: switchCallbackManager
    };

    // Create the switch objects.
    this.pitchOnSwitch = new Button("pitchOnSwitch", [140,107], switchArgs);
    this.pitchDiscSwitch = new Button("pitchDiscSwitch", [140,339], switchArgs);
    this.freqSwitch = new Button("freqSwitch", [416,107], switchArgs);

    /* END OF SWITCHES INIT */

    /* LABEL INIT */
    labelArgs = {
            wh : [320,29]
        };

    this.label = new Label("status", [275, 332], labelArgs);
    /* END OF LABEL INIT */

    // Here we add the elements to the UI [optionally we could add
    // connections between them].

    this.ui.addElement(this.gui, this.imageDisplayer);
    this.ui.addElement(this.pitchKnob, this.pitchKnobImageDisplayer);
    this.ui.addElement(this.freqKnob, this.freqKnobImageDisplayer);
    this.ui.addElement(this.qKnob, this.qKnobImageDisplayer);
    this.ui.addElement(this.volSlider, this.volImageDisplayer);
    this.ui.addElement(this.pitchOnSwitch, this.switchImageDisplayer);
    this.ui.addElement(this.pitchDiscSwitch, this.switchImageDisplayer);
    this.ui.addElement(this.freqSwitch, this.switchImageDisplayer);
    this.ui.addElement(this.label, this.labelDisplayer);
    
}