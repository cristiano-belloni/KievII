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
    this.values = {"buttonvalue" : NaN};
    this.objectsLoaded = 0;

    this.triggered = false;

    //By default, a Button always draws itself when value is set.
    this.drawItself = true;

    this.width = 0;
    this.height = 0;

    this.nButtons = specArgs.images.length;

    //This is a simple 2-state button
    if (this.nButtons != 2) {
        throw new Error("Invalid images array length, " + this.nButtons);
    }

    // Set the status progress.
    this.objectsTotal = this.nButtons;

    this.imagesArray = new Array (this.nButtons);

    // Load images from names
    for (var i = 0; i < this.nButtons; i += 1) {
        this.imagesArray[i] = new Image();
        this.imagesArray[i].onload = this.onLoad(this);
        this.imagesArray[i].src = specArgs.images[i];
    }

    console.log ("Origin is ", this.xOrigin, this.yOrigin);

};

Button.prototype.onLoad = function (that) {
    return function () {
        that.objectsLoaded += 1;
        if (that.objectsLoaded === that.objectsTotal) {
            that.onCompletion();
            that.completed = true;
        }
        console.log("Button: name = ", that.name, " Objects loaded = ", that.objectsLoaded, " of ", that.objectsTotal);
    };
};

// This method returns an image index given the value.
/*jslint nomen: false*/
Button.prototype._getImageNum = function () {
/*jslint nomen: true*/
    if ((this.values.buttonvalue < 0) || (this.values.buttonvalue > 1)) {
        // Do nothing
        return undefined;
    }
    // values from 0 to 0.5 are button OFF, values from 0.5 to 1 are button ON.
    var ret = Math.round(this.values.buttonvalue * (this.nButtons - 1));
    return ret;
};

// This method returns an image object given the value.
/*jslint nomen: false*/
Button.prototype._getImage = function () {
/*jslint nomen: true*/

    /*jslint nomen: false*/
    var ret = this._getImageNum();
    /*jslint nomen: true*/

    return this.imagesArray[ret];
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

    console.log ("Click down on ", x, y);

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
            // This holds for the simple 2-value button, while we need to do some
            // more calculation for n-valued buttons. TODO.
            to_set = 1 - this.values.buttonvalue;
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

    if ((temp_value < 0) || (temp_value > 1)) {
        //Just do nothing.
        //console.log("Button.prototype.setValue: VALUE INCORRECT!!");
        return;
    }

    // Now, we call the superclass
    this.tempsetValue = Element.prototype.setValue;
    this.tempsetValue(slot, value);

};

Button.prototype.refresh = function () {
    if (this.drawClass === undefined) {
        throw new Error("Error: drawClass is undefined!");
    }
    else {
        /*jslint nomen: false*/
        var imageNum = this._getImageNum();
        /*jslint nomen: true*/
        this.drawClass.draw(this.imagesArray[imageNum], this.xOrigin, this.yOrigin);
    }
};

Button.prototype.onCompletion = function () {
    // Now, we've loaded every image. We can calculate max width and height now.
    var i;
    for (i = 0; i < this.imagesArray.length; i += 1) {
        if (this.imagesArray[i].width > this.width) {
            this.width = this.imagesArray[i].width;
        }
        if (this.imagesArray[i].height > this.height) {
            this.height = this.imagesArray[i].height;
        }
    }
    console.log ("Image starts at ", this.xOrigin, this.yOrigin, " width and height are ", this.width, this.height);

    // Now, we call the superclass
    this.tempCompletion = Element.prototype.onCompletion;
    this.tempCompletion();
};
