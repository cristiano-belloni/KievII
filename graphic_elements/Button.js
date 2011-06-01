function Button(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(Button, Element);

Button.prototype.getready = function (args) {

    if (args === undefined) {
        throw new Error("Error: args is undefined!");
    }

    // Call the constructor from the superclass.
    Button.superclass.getready.call(this, args);

    // Now that all required properties have been inherited
    // from the parent class, define extra ones from this class
    // Value 0 by default
    this.values = {"buttonvalue" : 0};

    this.triggered = false;

    //By default, a Button always draws itself when value is set.
    this.drawItself = args.drawItself || true;

    this.imagesArray = args.imagesArray;

    if (this.imagesArray.length < 1) {
        throw new Error("Invalid images array length, " + this.imagesArray.length);
    }

    this.nButtons = this.imagesArray.length;

    for (var i = 0; i < this.nButtons; i += 1) {
        this.setWidth(this.imagesArray[i].width);
        this.setHeight(this.imagesArray[i].height);
    }


};

// This method returns true if the point given belongs to this button.
Button.prototype.isInROI = function (x, y) {
    if ((x >= this.ROILeft) && (y >= this.ROITop)) {
        if ((x <= (this.ROILeft + this.ROIWidth)) && (y <= (this.ROITop + this.ROIHeight))) {
            console.log ("Point ", x, ",", y, " in ROI: ", this.ROILeft, ",", this.ROITop, this.ROIWidth, "x", this.ROIHeight);
            return true;
        }
        /*jsl:pass*/
    }
    console.log ("Point ", x, ",", y, " NOT in ROI: ", this.ROILeft, ",", this.ROITop, this.ROIWidth, "x", this.ROIHeight);
    return false;
};

Button.prototype.onMouseDown = function (x, y) {

    //console.log ("Click down on ", x, y);

    if (this.isInROI(x, y)) {
        this.triggered = true;
    }
    return undefined;
};

Button.prototype.onMouseUp = function (curr_x, curr_y) {

    var to_set = 0,
        ret = {};

    if (this.triggered) {
        // Button is activated when cursor is still in the element ROI, otherwise action is void.
        if (this.isInROI(curr_x, curr_y)) {

            //Simply add 1 to the button value until it rolls back.
            to_set = (this.values.buttonvalue + 1) % this.nButtons;
            ret = {"slot" : "buttonvalue", "value" : to_set};

            // Click on button is completed, the button is no more triggered.
            this.triggered = false;
            
            return ret;
        }
    }
    
    // Action is void, button was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;
    
};

// Setters
Button.prototype.setValue = function (slot, value) {
    var temp_value = value;

    if ((temp_value < 0) || (temp_value > this.nButtons)) {
        return;
    }

    // Now, we call the superclass
    Button.superclass.setValue.call(this, slot, value);

};

Button.prototype.refresh = function () {
    if (this.drawClass !== undefined) {
        // Draw, if our draw class is already set.

        // Call the superclass.
        Button.superclass.refresh.apply(this, [this.drawClass.drawImage]);

        // Draw, if our draw class is already set.
        if (this.isVisible === true) {
            this.drawClass.drawImage.draw(this.imagesArray[this.values.buttonvalue], this.xOrigin, this.yOrigin);
        }
    }
};

Button.prototype.setGraphicWrapper = function (wrapper) {

    // Call the superclass.
    Button.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions
    this.drawClass = wrapper.initObject ([{objName: "drawImage",
                                           objParms: this.objParms}]);

};
