function Wavebox(name, topleft, specArgs) {
    if (arguments.length) {
        this.getready(name, topleft, specArgs);
    }
}

//inherit from the Element prototype
Wavebox.prototype = new Element();
//put the correct constructor reference back (not essential)
Wavebox.prototype.constructor = Wavebox;

Wavebox.prototype.getready = function (name, topleft, specArgs) {
    //Reference the getready method from the parent class
    this.tempReady = Element.prototype.getready;
    //and run it as if it were part of this object
    this.tempReady(name, topleft);

    this.values = {"waveboxposition" : 0,
                   "waveboxsignal:": []
               };

    //By default, a Wavebox always draws itself when value is set.
    this.drawItself = true;

    this.width = specArgs.wh[0];
    this.height = specArgs.wh[1];

    this.completed = false;

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

Wavebox.prototype.onROI = function (start_x, start_y, curr_x, curr_y) {
    var ret = {"slot" : "waveboxposition", "value" : this.values.waveboxposition};
    return ret;
};

//This has to go, it makes no sense at all.
Wavebox.prototype.getDefaultValue = function () {
    return this.values.waveboxposition;
};

// Setters
Wavebox.prototype.setValue = function (slot, value) {

    //this.tempsetValue = Element.prototype.setValue;
    //this.tempsetValue(slot, value);
    
    this[slot] = value;

    if (this.drawItself === true) {
        this.refresh();
    }
};

Wavebox.prototype.refresh = function () {
    if (this.drawClass === undefined) {
        throw new Error("Error: drawClass is undefined!");
    }
    else {
        // this is where the Wavebox draws itself.
        // console.log (this.name, "'s drawClass is drawing itself!");
        var oldpoint = 0;

        for (var i = 0; i < this.width; i += 1) {
            var point = this.calculateSampleCoord(i);
            if (point !== oldpoint) {
                console.log ("Drawing a point, x is ", point.x, " y is ", point.y);
                this.drawClass.draw (point.x, point.y);
            }
            oldpoint = point;
        }
        this.drawClass.endDraw();
        
    }
};

//Non-interface functions

Wavebox.prototype.sampleindexToY = function (samplenum) {
    //Check boundaries
    if ((samplenum >= this.waveboxsignal.length) || (this.waveboxsignal[samplenum] === undefined) || (this.waveboxsignal[samplenum] === NaN)) {
        throw new Error("Error: problem with sample index: ", samplenum, " or sample value: ", this.waveboxsignal[samplenum]);
    }

    //We got a sample number, and we want to know where it should be drawn.
    //Sample values go from -1 to 1.
    //NewValue = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
    var range01 = (this.waveboxsignal[samplenum] + 1) / 2;
    console.log ("signal that was ", this.waveboxsignal[samplenum], " is now transformed in ", range01);
    var temp = ((1 - range01) *  this.height);
    console.log ("Adding to origin ", temp);
    var y = this.yOrigin + temp;
    return parseInt (y, 10);

}

Wavebox.prototype.sampleXToIndex = function (xcoord) {

    var factor = (this.waveboxsignal.length / this.width);
    var x = xcoord * factor;
    var ret = parseInt (x, 10);
    //if (( x % 100) == 0 ) {
        console.log ("xcoord is ", xcoord , " of ", this.width , " factor is ", factor, " and corresponding sample number is ", ret , " of ", this.waveboxsignal.length);
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