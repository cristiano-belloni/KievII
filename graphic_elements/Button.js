K2.Button = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Button, K2.UIElement);

K2.Button.prototype.getready = function(args) {

    if (args === undefined) {
        throw new Error('Error: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Button.superclass.getready.call(this, args);

    // Now that all required properties have been inherited
    // from the parent class, define extra ones from this class
    // Value 0 by default
    this.values = {'buttonvalue' : 0};
    this.defaultSlot = 'buttonvalue';

    this.triggered = false;

    this.mode = args.mode || 'persistent';
    this.imagesArray = args.imagesArray;

    if (this.imagesArray.length < 1) {
        throw new Error('Invalid images array length, ' + this.imagesArray.length);
    }

    this.nButtons = this.imagesArray.length;

    for (var i = 0; i < this.nButtons; i += 1) {
        this.setWidth(this.imagesArray[i].width);
        this.setHeight(this.imagesArray[i].height);
    }


};

// This method returns true if the point given belongs to this button.
K2.Button.prototype.isInROI = function(x, y) {
    if ((x >= this.ROILeft) && (y >= this.ROITop)) {
        if ((x <= (this.ROILeft + this.ROIWidth)) && (y <= (this.ROITop + this.ROIHeight))) {
            //console.log ("Point ", x, ",", y, " in ROI: ", this.ROILeft, ",", this.ROITop, this.ROIWidth, "x", this.ROIHeight);
            return true;
        }
        /*jsl:pass*/
    }
    //console.log ("Point ", x, ",", y, " NOT in ROI: ", this.ROILeft, ",", this.ROITop, this.ROIWidth, "x", this.ROIHeight);
    return false;
};

K2.Button.prototype.mousedown = K2.Button.prototype.touchstart = function(x, y) {

    //console.log ("Click down on ", x, y);

    if (this.isInROI(x, y)) {
        this.triggered = true;
        if (this.mode === 'persistent') {
            return undefined;
        }
        else if (this.mode === 'immediate') {
            //Simply add 1 to the button value until it rolls back.
            to_set = (this.values.buttonvalue + 1) % this.nButtons;
            ret = {'slot' : 'buttonvalue', 'value' : to_set};
            return ret;
        } 
    }
    
};

/*K2.Button.prototype.touchstart = function(x, y) {

    //console.log ("Click down on ", x, y);

    if (this.isInROI(x, y)) {
        
    //Simply add 1 to the button value until it rolls back.
    to_set = (this.values.buttonvalue + 1) % this.nButtons;
    ret = {'slot' : 'buttonvalue', 'value' : to_set};
    
    return ret;
    }
};*/

K2.Button.prototype.mouseup = K2.Button.prototype.touchend = function(curr_x, curr_y) {

    var to_set = 0,
        ret = {};

    if (this.mode === 'persistent') {
        if (this.triggered) {
            // Button is activated when cursor is still in the element ROI, otherwise action is void.
            if (this.isInROI(curr_x, curr_y)) {
    
                //Simply add 1 to the button value until it rolls back.
                to_set = (this.values.buttonvalue + 1) % this.nButtons;
                ret = {'slot' : 'buttonvalue', 'value' : to_set};
    
                // Click on button is completed, the button is no more triggered.
                this.triggered = false;
    
                return ret;
            }
        }
    }
    
    else if (this.mode === 'immediate') {
        if (this.triggered) {
            to_set = (this.values.buttonvalue - 1) % this.nButtons;
            ret = {'slot' : 'buttonvalue', 'value' : to_set};
            // Click on button is completed, the button is no more triggered.
            this.triggered = false;
            return ret;
        }
    } 

    // Action is void, button was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;

};

K2.Button.prototype.mouseout = function (curr_x, curr_y) {
    // On immediate, this count as a mouseup (undo)
    // On persistent, this counts as nothing (undo)
    if (this.mode === 'immediate') {
        return this.mouseup (curr_x, curr_y);
    }
};

// Setters
K2.Button.prototype.setValue = function(slot, value) {

    if ((value < 0) || (value > this.nButtons)) {
        return;
    }

    // Now, we call the superclass
    K2.Button.superclass.setValue.call(this, slot, value);

};

K2.Button.prototype.refresh_CANVAS2D = function(engine) {
    // Draw, if the element is visible.
    if (this.isVisible === true) {
        engine.context.drawImage(this.imagesArray[this.values.buttonvalue], this.xOrigin, this.yOrigin);
    }
    
};

K2.Button.prototype.setStatesNumber = function(number) {
    this.nButtons = number;
};

K2.Button.prototype.getStatesNumber = function() {
    return this.nButtons;
};
