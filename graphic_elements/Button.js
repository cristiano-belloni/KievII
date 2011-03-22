function Button(name, topleft, specArgs) {
    if (arguments.length) {
        this.getready(name, topleft, specArgs);
    }
}

//inherit from the Element prototype
Button.prototype = new Element();
//put the correct constructor reference back (not essential)
Button.prototype.constructor = Button;

Button.prototype.getready = function (name, topleft, specArgs) {

    if (specArgs === undefined) {
        throw new Error("Error: specArgs is undefined!");
    }

    //reference the getready method from the parent class
    this.tempReady = Element.prototype.getready;
    //and run it as if it were part of this object
    this.tempReady(name, topleft, specArgs);

    // Now that all required properties have been inherited
    // from the parent class, define extra ones from this class
    this.values = {"buttonvalue" : null};

    this.triggered = false;

    //By default, a Button always draws itself when value is set.
    this.drawItself = true;

    this.imagesArray = specArgs.imagesArray;
    this.nButtons = this.imagesArray.length;

    // Calculate width and height
    this.width = 0;
    this.height = 0;

    for (var i = 0; i < this.nButtons; i += 1) {
        if (this.imagesArray[i].width > this.width) {
            this.width = this.imagesArray[i].width;
        }
        if (this.imagesArray[i].height > this.height) {
            this.height = this.imagesArray[i].height;
        }
    }


};

// This method returns true if the point given belongs to this button.
Button.prototype.isInROI = function (x, y) {
    if ((x >= this.xOrigin) && (y >= this.yOrigin)) {
        if ((x <= (this.xOrigin + this.width)) && (y <= (this.yOrigin + this.height))) {
            //console.log(this.name, " point ", x, y, " is in ROI ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);
            return true;
        }
        /*jsl:pass*/
    }
    // console.log ("Button: ", this.name, " ROI Handler: ", x, y, " is NOT in ROI ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);
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
        //Just do nothing.
        //console.log("Button.prototype.setValue: VALUE INCORRECT!!");
        return;
    }

    // Now, we call the superclass
    Element.prototype.setValue.call(this, slot, value);

};

Button.prototype.refresh = function () {
    // Call the superclass.
    Element.prototype.refresh.apply(this);

    // Draw, if our draw class is already set.
    if (this.drawClass !== undefined) {
        this.drawClass.draw(this.imagesArray[this.values.buttonvalue], this.xOrigin, this.yOrigin);
    }
};
