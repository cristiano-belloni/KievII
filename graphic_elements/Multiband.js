function Multiband(name, topleft, nBands, wh, color_range) {
    if (arguments.length) {
        this.getready(name, topleft, nBands, wh, color_range);
    }
}

//inherit from the Element prototype
Multiband.prototype = new Element();
//put the correct constructor reference back (not essential)
Multiband.prototype.constructor = Multiband;


Multiband.prototype.getready = function (name, topleft, nBands, wh, color_range) {

    var valueName,
        i;

    //reference the getready method from the parent class
    this.tempReady = Element.prototype.getready;
    //and run it as if it were part of this object
    this.tempReady(name, topleft);
    
    this.nBands = nBands;
    this.sideBands = new Array (this.nBands);

    // The values. Every band has its starting point, height, width, hight and color.
    // TODO they should be Nan.
    this.values = {};

    for (i = 0; i < nBands; i += 1) {
        valueName = i + "sp";
        this.values[valueName] = 0;
        valueName = i + "ep";
        this.values[valueName] = 0;
        valueName = i + "height";
        this.values[valueName] = 0;
        valueName = i + "height";
        this.values[valueName] = 0;
        valueName = i + "color";
        this.values[valueName] = 0;
    }

    this.values.color_range = color_range;

    // The multiband display has a fixed width and height.
    this.width = wh[0];
    this.height = wh[1];

    this.drawClass = undefined;

    //By default, a Multiband always draws itself when value is set.
    this.drawItself = true;

    this.completed = true;

};

Multiband.prototype.calculateSidebands = function () {

    var startValue,
        endValue,
        heightValue,
        startXPoint,
        endXPoint,
        yPoint,
        i;

    for (i = 0; i < this.nBands; i += 1) {

        startValue = this.values[i + "sp"];
        endValue = this.values[i + "ep"];
        heightValue = this.values[i + "height"];

        startXPoint = this.xOrigin + (this.width * startValue);
        endXPoint = this.xOrigin + (this.width * endValue);
        yPoint = this.yOrigin + (1 - this.height * heightValue);

        this.sideBands[i] = {"startXPoint": startXPoint, "endXPoint": endXPoint, "yPoint": yPoint};
    }

};

Multiband.prototype.isInROI = function (x, y) {
    var proximity,
        i,
        curSB;

    /* DOES NOT WORK */
    if ((x > this.xOrigin) && (y > this.yOrigin)) {
        if ((x < (this.xOrigin + this.width)) && (y < (this.yOrigin + this.height))) {

            //console.log(this.name, " ROI Handler: ", x, y, " is in band bounding box ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);

            // It's in the multiband's real estate on the screen. Now we got to find if it's on the proximity of a sideband.
            // TODO set this somewhere else
            proximity = 3;
            this.calculateSidebands();
            for (i = 0; i < this.nBands; i += 1) {

                curSB = this.sideBands[i];

                if (y < curSB.yPoint) {
                    //Too high!
                    //console.log("Too high! (", y, " vs ", curSB["yPoint"]);
                    continue;
                }
                // Check for the start side band
                if ((x > curSB.startXPoint - proximity) && (x < curSB.startXPoint + proximity)) {
                    //console.log(this.name, " ROI Handler: ", x, y, " is in ROI for starting point of sideband ", i);
                    // We got it!
                    this.sideBand = [0, i];
                    return true;
                }
                if ((x > curSB.endXPoint - proximity) && (x < curSB.endXPoint + proximity)) {
                    // We got it!
                    //console.log(this.name, " ROI Handler: ", x, y, " is in ROI for ending point of sideband ", i);
                    this.sideBand = [1, i];
                    return true;
                }
            }
        }
    }
    //console.log(this.name, " ROI Handler: ", x, y, " is NOT in sideband ROI ");
    //console.log ("Returning false");
    return false;
};

Multiband.prototype.onROI = function (start_x, start_y, curr_x, curr_y) {

    var temp_value,
            to_set,
            ret,
            startSlot,
            endSlot,
            prevEndSlot,
            nextStartSlot,
            deltaX;
            
    deltaX = curr_x - start_x;

    if (this.sideBand[0] === 0) {

        //Moving the start sideband
        if (this.sideBand[1] === 0) {
            //Moving the first starting sideband: this is affected by the endband.
            temp_value = this.values.band0sp;

            to_set = temp_value - deltaX / 2000;

            if (to_set >= this.values["0ep"]) {
                to_set = this.values["0ep"];
            }
            if (to_set < 0) {
                to_set = 0;
            }

            ret = {"slot" : "0sp", "value" : to_set};

            return ret;
        }
        // Moving a middle start sideband; this is affected by the endband.
        startSlot = this.sideBand[1] + "sp";
        endSlot = this.sideBand[1] + "ep";
        prevEndSlot = (this.sideBand[1] - 1) + "ep";

        temp_value = this.values[startSlot];

        to_set = temp_value - deltaX / 2000;

        if (to_set >= this.values[endSlot]) {
            to_set = this.values[endSlot];
        }

        if (to_set <= this.values[prevEndSlot]) {
            to_set = this.values[prevEndSlot];
        }

        ret = {"slot" : startSlot, "value" : to_set};
        return ret;

    }

    else if (this.sideBand[0] === 1) {
        //Moving the end sideband
        if (this.sideBand[1] === 0) {
            //Moving the last ending sideband: This is affected only by the hard limit.
            startSlot = this.sideBand[this.nBands] + "sp";
            endSlot = this.sideBand[this.nBands] + "ep";

            temp_value = this.values[endSlot];

            to_set = temp_value - deltaX / 2000;

            if (to_set < this.values[startSlot]) {
                to_set = this.values[startSlot];
            }
            if (to_set > 1) {
                to_set = 1;
            }

            ret = {"slot" : endSlot, "value" : to_set};

            return ret;
        }

        // Moving a middle end sideband; this is affected by other bands
        startSlot = this.sideBand[1] + "sp";
        endSlot = this.sideBand[1] + "ep";
        nextStartSlot = (this.sideBand[1] + 1) + "sp";

        temp_value = this.values[endSlot];

        to_set = temp_value - deltaX / 2000;

        if (to_set < this.values[startSlot]) {
            to_set = this.values[startSlot];
        }

        if (to_set > this.values[nextStartSlot]) {
            to_set = this.values[nextStartSlot];
        }

        ret = {"slot" : endSlot, "value" : to_set};
        return ret;

    }
    else {
        //Shouldn't be here.
        throw new Error("Error: sideband is neither start not end.");
    }

};

Multiband.prototype.setValue = function (slot, value) {

    var bandn,
        bandtype,
        previous,
        next;
    
    bandn = parseInt(slot, 10);
    bandtype = slot.substring(slot.length - 2);

    // Bad hack. It catches the end or start points. TODO write it better.
    if ((bandtype === "sp") || (bandtype === "ep")) {

        // If it's a start or end point, don't make them overlap.
        previous = undefined;
        next = undefined;

        if ((bandtype === "sp") && (bandn === 0)) {
            if (value > this.values["0ep"]) {
                value = this.values["0ep"];
            }
        }

        else if ((bandtype === "ep") && (bandn === this.nBands - 1)) {
            previous = bandn + "sp";
            if (value < this.values[previous]) {
                value = this.values[previous];
            }
        }

        else {

            if (bandtype === "sp") {
                previous = (bandn - 1) + "ep";
                next = bandn + "ep";
            }
            else if (bandtype === "ep") {
                previous = bandn + "sp";
                next = (bandn + 1) + "sp";
            }

            if (value < this.values[previous]) {
                value = this.values[previous];
            }

            if (value > this.values[next]) {
                value = this.values[next];
            }

        }
    }

    //Can't call the superclass; we need to clear the old band, so we need a
    //special behaviour. TODO this is no more needed.

    if (this.values[slot] === undefined) {
        throw new Error("Slot " + slot + " not present or value undefined");
    }

    if (value === this.values[slot]) {
        // Nothing to do.
        return;
    }

    //Must refresh / clear here. TODO we MUST insert this behaviour in the
    //canvasDraw class and call the superclass.
    if (this.drawItself === true) {
        // Refreshes the background
        this.refresh(true);
    }

    this.values[slot] = value;

    if (this.drawItself === true) {
        // Paints the bands
        this.refresh();
    }

};


Multiband.prototype.refresh = function (clear) {

    var height,
        range,
        colValue,
        color_shade,
        i;

    if (this.drawClass === undefined) {
        throw new Error("Error: drawClass is undefined!");
    }
    // Draw yourself! This is per-class behaviour.
    //console.log (this.name, "'s drawClass is drawing itself!");

    //If we clear, we clear the whole background.
    if (clear === true) {
        this.drawClass.clear(this.xOrigin,
                             this.yOrigin,
                             this.width,
                             this.height);
        return;
    }

    // Here we do the math and draw ourselves
    this.calculateSidebands();

    for (i = 0; i < this.nBands; i += 1) {

        height = (1 - this.values[i + "height"]) * this.height;
        range = this.values.color_range;
        colValue = this.values[i + "color"];
        color_shade = (colValue - 0.5) * range;
        this.drawClass.draw(this.sideBands[i].startXPoint,
                        this.yOrigin + height,
                        this.sideBands[i].endXPoint - this.sideBands[i].startXPoint,
                        this.height - height,
                        color_shade);
    }
};
                    


