function Knob(name, topleft, specArgs) {
    if (arguments.length) {
        this.getready(name, topleft, specArgs);
    }
}

//inherit from the Element prototype
Knob.prototype = new Element();
//put the correct constructor reference back (not essential)
Knob.prototype.constructor = Knob;

Knob.prototype.getready = function (name, topleft, specArgs) {

    if (specArgs === undefined) {
        throw new Error("Error: specArgs is undefined!");
    }
    
    //reference the getready method from the parent class
    this.tempReady = Element.prototype.getready;
    //and run it as if it were part of this object
    this.tempReady(name, topleft, specArgs);
    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class
    this.values = {"knobvalue" : NaN};

    //By default, a knob always draws itself when value is set.
    this.drawItself = true;

    this.sensivity = specArgs.sensivity || 2000;

    //Images & width and height.

    this.imagesArray = specArgs.imagesArray;
    
    if (this.imagesArray.length < 1) {
        throw new Error("Invalid images array length, " + this.imagesArray.length);
    }

    this.width = 0;
    this.height = 0;

    for (var i = 0, len = this.imagesArray.length; i < len; i += 1) {
        if (this.imagesArray[i].width > this.width) {
            this.width = this.imagesArray[i].width;
        }
        if (this.imagesArray[i].height > this.height) {
            this.height = this.imagesArray[i].height;
        }
    }

    // Background saving is optional.
    if (specArgs.preserveBg !== undefined) {
        this.preserveBg = true;
        // As soon as we can, we want to save our background.
        this.backgroundSavePending = true;
    }

};


// This method returns an image index given the knob value.
/*jslint nomen: false*/
Knob.prototype._getImageNum = function () {
/*jslint nomen: true*/
    if ((this.values.knobvalue < 0) || (this.values.knobvalue > 1)) {
        // Do nothing
        return undefined;
    }
    var ret = Math.round(this.values.knobvalue * (this.imagesArray.length - 1));
    return ret;
};

// This method returns an image object given the knob value.
/*jslint nomen: false*/
Knob.prototype._getImage = function () {
/*jslint nomen: true*/

    /*jslint nomen: false*/
    var ret = this._getImageNum();
    /*jslint nomen: true*/
    return this.imagesArray[ret];
};

// This method returns true if the point given belongs to this knob.
Knob.prototype.isInROI = function (x, y) {
    if ((x > this.xOrigin) && (y > this.yOrigin)) {
        if ((x < (this.xOrigin + this.width)) && (y < (this.yOrigin + this.height))) {
            //console.log("Knob: ", this.name, " point ", x, y, " is in ROI ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);
            return true;
        }
        /*jsl:pass*/
    }
    //console.log ("Knob: ", this.name, " ROI Handler: ", x, y, " is NOT in ROI ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);
    return false;
};

Knob.prototype.onMouseDown = function (x, y) {

    var inROI = this.isInROI(x, y);
    // Save the starting point if event happened in our ROI.
    if (inROI) {
        this.start_x = x;
        this.start_y = y;
    }

    // No value has been changed.
    return undefined;
};

Knob.prototype.onMouseUp = function (x, y) {

    // Reset the starting point.
    this.start_x = undefined;
    this.start_y = undefined;

    // No value has been changed
    return undefined;

};

Knob.prototype.onMouseMove = function (curr_x, curr_y) {

    if ((this.start_x !== undefined) && (this.start_y !== undefined)) {

        // This means that the mouse is currently down.
        var deltaY = 0,
            temp_value,
            to_set,
            ret;

        deltaY = curr_y - this.start_y;

        temp_value = this.values.knobvalue;

        // Todo set sensivity.
        to_set = temp_value - deltaY / this.sensivity;

        if (to_set > 1) {
            to_set = 1;
        }
        if (to_set < 0) {
            to_set = 0;
        }

        ret = {"slot" : "knobvalue", "value" : to_set};

        return ret;
    }

    // The mouse is currently up; ignore the event notify.
    return undefined;

};

// Setters
Knob.prototype.setValue = function (slot, value) {
    var temp_value = value;

    if ((temp_value < 0) || (temp_value > 1)) {
        //Just do nothing.
        //console.log("Knob.prototype.setValue: VALUE INCORRECT!!");
        return;
    }

    // Now, we call the superclass
    Element.prototype.setValue.call(this, slot, value);

};
        
Knob.prototype.refresh = function () {

    // Call the superclass.
    Element.prototype.refresh.apply(this);

    // Draw, if our draw class is already set.
    if (this.drawClass !== undefined) {
        /*jslint nomen: false*/
        var imageNum = this._getImageNum();
        /*jslint nomen: true*/
        this.drawClass.draw(this.imagesArray[imageNum], this.xOrigin, this.yOrigin);
        
    }

    
};
