function Wavebox(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(Wavebox, Element);

Wavebox.prototype.getready = function (args) {

    // Call the constructor from the superclass.
    Wavebox.superclass.getready.call(this, args);

    this.values = {"waveboxposition" : 0,
                   "startsample" : 0,
                   "endsample" : null,
                   "waveboxsignal" : undefined
               };

    //By default, a Wavebox always draws itself when a value is set.
    this.drawItself = args.drawItself || true;

    /* Get the wrapper primitive functions */
    this.drawClass = args.wrapper.initObject ([{objName: "drawPath",
                                           objParms: args.objParms}]);

    this.width = args.width;
    this.height = args.height;

    //By default, a wavebox always refreshes the background.
    this.preserveBg = args.preserveBg || true;

    if (this.preserveBg === true) {
        // As soon as we can, we want to save our background.
        this.backgroundSavePending = true;
    }

};

// This methods returns true if the point given belongs to this element.
Wavebox.prototype.isInROI = function (x, y) {
    if ((x > this.xOrigin) && (y > this.yOrigin)) {
        if ((x < (this.xOrigin + this.width)) && (y < (this.yOrigin + this.height))) {
            //console.log(this.name, "point ", x, y, " is in ROI ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);
            return true;
        }
        //console.log(this.name, " ROI Handler: ", x, y, " is NOT in ROI ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);
    }
    return false;
};

Wavebox.prototype.setValue = function (slot, value) {

    // Won't call the parent: this element has a custom way to set values.

    if (this.values[slot] === value) {
        //Nothing changed, don't redraw.
        return;
    }

    // Check some boundaries.

    if ((slot === "startsample") || (slot === "endsample")) {
        if (value < 0) {
            throw new Error("Error: Trying to set ", slot, " less than 0: ", value);
        }
        if (this.values["waveboxsignal"] !== undefined) {
            if (value > this.values["waveboxsignal"].length) {
                throw new Error("Error: Trying to set ", slot, " bigger than signal length: ", value, " > ", this.values["waveboxsignal"].length);
            }
        }
    }

    if (slot === "startsample") {
        if (value > this.values["endsample"]) {
                throw new Error("Error: Trying to set startsample > endsample: ", value, " > ", this.values["endsample"]);
            }
    }

    if (slot === "endsample") {
        if (value < this.values["startample"]) {
                throw new Error("Error: Trying to set endsample < startsample: ", value, " < ", this.values["startsample"]);
            }
    }
    
    this.values[slot] = value;
    console.log ("set value for slot ", slot);

    // When we change the signal, we know we must reset the whole thing.
    if (slot === "waveboxsignal") {
        //Take the whole waveform
        console.log ("inside!");
        this.values["endsample"] = this.values["waveboxsignal"].length;
        this.values["startsample"] = 0;
    }

    if (this.drawItself === true) {
        this.refresh();
    }
};

Wavebox.prototype.refresh = function () {
    // Call the superclass.
    Wavebox.superclass.refresh.apply(this);

    // Draw, if our draw class is already set.
    if ((this.drawClass !== undefined) && (this.isVisible === true)) {

        var oldpoint = 0;
        this.drawClass.drawPath.beginDraw();

        for (var i = 0; i < this.width; i += 1) {
            var point = this.calculateSampleCoord(i);
            if (point !== oldpoint) {
                //console.log ("Drawing a point, x is ", point.x, " y is ", point.y);
                //this.drawClass.drawImage.draw(this.imagesArray[imageNum], this.xOrigin, this.yOrigin);
                this.drawClass.drawPath.draw(point.x, point.y);
            }
            oldpoint = point;
        }
        this.drawClass.drawPath.endDraw();
        
    }
};

//Non-interface functions

Wavebox.prototype.sampleindexToY = function (samplenum) {
    //Check boundaries
    if ((samplenum >= this.values.endsample) || (this.values.waveboxsignal[samplenum] === undefined) || (this.values.waveboxsignal[samplenum] === null)) {
        throw new Error("Error: problem with sample index: ", samplenum, " or sample value: ", this.values.waveboxsignal[samplenum]);
    }

    //We got a sample number, and we want to know where it should be drawn.
    //Sample values go from -1 to 1.
    //NewValue = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
    var range01 = (this.values.waveboxsignal[samplenum] + 1) / 2;
    //console.log ("signal that was ", this.values.waveboxsignal[samplenum], " is now transformed in ", range01);
    var temp = ((1 - range01) *  this.height);
    //console.log ("Adding to origin ", temp);
    var y = this.yOrigin + temp;
    return parseInt (y, 10);

}

Wavebox.prototype.sampleXToIndex = function (xcoord) {

    var factor = ((this.values.endsample - this.values.startsample) / this.width);
    var x = xcoord * factor;
    var ret = parseInt (x, 10);
    //if (( x % 100) == 0 ) {
        //console.log ("xcoord is ", xcoord , " of ", this.width , " factor is ", factor, " and corresponding sample number is ", ret , " finishing at ", this.values.endsample);
    //}
    return ret;

}

Wavebox.prototype.calculateSampleCoord = function (xcoord) {
    // this returns the absolute x,y coordinates from the sample in x position, relative to the x-origin of the box
    var ret = {};
    ret.x = xcoord + this.xOrigin;
    ret.y = this.sampleindexToY(this.sampleXToIndex(xcoord));
    return ret;
}