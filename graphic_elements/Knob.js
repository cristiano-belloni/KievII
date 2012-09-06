K2.Knob = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Knob, K2.UIElement);

K2.Knob.prototype.getready = function(args) {

    if (args === undefined) {
        throw new Error('Error: specArgs is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Knob.superclass.getready.call(this, args);

    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class

    //Default value is 0
    this.values = {'knobvalue' : 0};
    this.defaultSlot = 'knobvalue';

    this.sensitivity = args.sensitivity || 2000;
    this.imagesArray = args.imagesArray || null;

    if (this.imagesArray.length < 1) {
        throw new Error('Invalid images array length, ' + this.imagesArray.length);
    }

    var width = 0,
        height = 0;

    // Calculate maximum width and height.
    for (var i = 0, len = this.imagesArray.length; i < len; i += 1) {
        if (this.imagesArray[i].width > width) {
            width = this.imagesArray[i].width;
        }
        if (this.imagesArray[i].height > height) {
            height = this.imagesArray[i].height;
        }
    }

    // Set them.
    this.setWidth(width);
    this.setHeight(height);

};


// This method returns an image index given the knob value.
K2.Knob.prototype.getImageNum = function() {
    if ((this.values.knobvalue < 0) || (this.values.knobvalue > 1)) {
        // Do nothing
        return undefined;
    }
    var ret = Math.round(this.values.knobvalue * (this.imagesArray.length - 1));
    return ret;
};

K2.Knob.prototype.getImage = function() {

    var ret = this.getImageNum();
    return this.imagesArray[ret];
};

// This method returns true if the point given belongs to this knob.
K2.Knob.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

K2.Knob.prototype.dragstart = K2.Knob.prototype.mousedown = function(x, y) {

    var inROI = this.isInROI(x, y);
    // Save the starting point if event happened in our ROI.
    if (inROI) {
        this.start_x = x;
        this.start_y = y;
    }

    // No value has been changed.
    return undefined;
};

K2.Knob.prototype.dragend = K2.Knob.prototype.mouseup = function(x, y) {

    // Reset the starting point.
    this.start_x = undefined;
    this.start_y = undefined;

    // No value has been changed
    return undefined;

};

K2.Knob.prototype.drag = K2.Knob.prototype.mousemove = function(curr_x, curr_y) {

    if ((this.start_x !== undefined) && (this.start_y !== undefined)) {

        // This means that the mouse is currently down.
        var deltaY = 0,
            temp_value,
            to_set,
            ret;

        deltaY = curr_y - this.start_y;

        temp_value = this.values.knobvalue;

        // Todo set sensitivity.
        to_set = temp_value - deltaY / this.sensitivity;

        if (to_set > 1) {
            to_set = 1;
        }
        if (to_set < 0) {
            to_set = 0;
        }

        ret = {'slot' : 'knobvalue', 'value' : to_set};

        return ret;
    }

    // The mouse is currently up; ignore the event notify.
    return undefined;

};

// Setters
K2.Knob.prototype.setValue = function(slot, value) {
    var temp_value = value;

    if ((temp_value < 0) || (temp_value > 1)) {
        // Out of range; do not set
        return;
    }

    // Call the superclass
    K2.Knob.superclass.setValue.call(this, slot, value);

};

K2.Knob.prototype.refresh_CANVAS2D = function(engine) {

    // Draw if visible.
    if (this.isVisible === true) {
        // Get the image to draw
        var imageNum = this.getImageNum();
        // Draw the image on the canvas
        engine.context.drawImage(this.imagesArray[imageNum], this.xOrigin, this.yOrigin);
    }
    
};