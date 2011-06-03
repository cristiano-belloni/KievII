function RotKnob(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

// TODO should it extend Knob? Or maybe we should make a GenericKnob class?
extend(RotKnob, Element);

RotKnob.prototype.getready = function (args) {

    if (args === undefined) {
        throw new Error("Error: specArgs is undefined!");
    }

    // Call the constructor from the superclass.
    RotKnob.superclass.getready.call(this, args);

    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class

    //Default value is 0
    this.values = {"knobvalue" : 0};

    //By default, a RotKnob always draws itself when value is set.
    this.drawItself = args.drawItself || true;
    this.sensivity = args.sensivity || 2000;
    this.image = args.image;
    
    this.setWidth(this.image.width);
    this.setHeight(this.image.height);

    this.preserveBg = args.preserveBg || true;
    if (this.preserveBg) {
        this.backgroundSavePending = true;
    }
    

};


// This method returns an image index given the RotKnob value.
/*jslint nomen: false*/
RotKnob.prototype._getRotateAmount = function () {
/*jslint nomen: true*/
    if ((this.values.knobvalue < 0) || (this.values.knobvalue > 1)) {
        // Do nothing
        return undefined;
    }
    
    var ret = this.values.knobvalue * 360 * Math.PI / 180;
    return ret;
};

// This method returns an image object given the RotKnob value.
/*jslint nomen: false*/
RotKnob.prototype._getImage = function () {
/*jslint nomen: true*/

    /*jslint nomen: false*/
    var ret = this._getImageNum();
    /*jslint nomen: true*/
    return this.imagesArray[ret];
};

// This method returns true if the point given belongs to this RotKnob.
RotKnob.prototype.isInROI = function (x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            console.log ("Point ", x, ",", y, " in ROI: ", this.ROILeft, ",", this.ROITop, this.ROIWidth, "x", this.ROIHeight);
            return true;
        }
        /*jsl:pass*/
    }
    console.log ("Point ", x, ",", y, " NOT in ROI: ", this.ROILeft, ",", this.ROITop, this.ROIWidth, "x", this.ROIHeight);
    return false;
};

RotKnob.prototype.onMouseDown = function (x, y) {

    var inROI = this.isInROI(x, y);
    // Save the starting point if event happened in our ROI.
    if (inROI) {
        this.start_x = x;
        this.start_y = y;
    }

    // No value has been changed.
    return undefined;
};

RotKnob.prototype.onMouseUp = function (x, y) {

    // Reset the starting point.
    this.start_x = undefined;
    this.start_y = undefined;

    // No value has been changed
    return undefined;

};

RotKnob.prototype.onMouseMove = function (curr_x, curr_y) {

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
RotKnob.prototype.setValue = function (slot, value, fireCallback) {
    var temp_value = value;

    if ((temp_value < 0) || (temp_value > 1)) {
        //Just do nothing.
        //console.log("RotKnob.prototype.setValue: VALUE INCORRECT!!");
        return;
    }

    // Now, we call the superclass
    RotKnob.superclass.setValue.call(this, slot, value, fireCallback);

};

RotKnob.prototype.refresh = function () {

    if (this.drawClass !== undefined) {
        // Draw, if our draw class is already set.

        // Call the superclass.
        RotKnob.superclass.refresh.call(this, this.drawClass.drawImage);

        // Draw if visible.
        if (this.isVisible === true) {
            /*jslint nomen: false*/
            var rot = this._getRotateAmount();
            /*jslint nomen: true*/

            this.drawClass.drawImage.drawRotate(this.image, this.xOrigin, this.yOrigin, rot);

        }
    }
};

RotKnob.prototype.setGraphicWrapper = function (wrapper) {

    // Call the superclass.
    RotKnob.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions
    this.drawClass = wrapper.initObject ([{objName: "drawImage",
                                           objParms: this.objParms}]);

};
