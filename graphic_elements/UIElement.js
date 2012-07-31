K2.UIElement = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

K2.UIElement.prototype.getready = function(args) {

    this.ID = args.ID;

    // This is true if the UIElement wants to be notified
    this.isListening = args.isListening;

    if (typeof (this.isListening) === 'undefined') {
        this.isListening = true;
    }

    if (typeof (this.isListening) !== 'boolean') {
        throw 'Property isListening for element ' + this.ID + ' is not boolean ' + this.isListening;
    }

    // Element is visible by default
    this.isVisible = args.isVisible;

    if (typeof (this.isVisible) === 'undefined') {
        this.isVisible = true;
    }

    if (typeof (this.isVisible) !== 'boolean') {
        throw 'Property isVisible for element ' + this.ID + ' is not boolean ' + this.isVisible;
    }

    // The element boundaries
    this.xOrigin = args.left;
    this.yOrigin = args.top;

    //set the ROI if defined
    if (args.ROILeft !== undefined) {
        this.ROILeft = args.ROILeft;
    }
    else {
        this.ROILeft = this.xOrigin;
    }

    if (args.ROITop !== undefined) {
        this.ROITop = args.ROITop;
    }
    else {
        this.ROITop = this.yOrigin;
    }

    this.ROIWidth = args.ROIWidth;
    this.ROIHeight = args.ROIHeight;

    // These are to be set later
    this.values = {};

    // Specific parameters of the object, to be passed to the wrapper
    this.objParms = args.objParms;

    // See if there is a callback to call when the value is set
    if (args !== undefined) {
        this.onValueSet = args.onValueSet;
    }

};

// Private function
K2.UIElement.prototype.isInROI = function(x, y) {
    // This is the abstract class.
    return false;
};

K2.UIElement.prototype.getValues = function() {
    var tempArray = [],
        i;
    for (i in this.values) {
        if (this.values.hasOwnProperty(i)) {
            tempArray.push(i);
        }
    }
    // Returns the keys.
    return tempArray;
};

K2.UIElement.prototype.getXCoord = function() {
    return this.xOrigin;
};

K2.UIElement.prototype.getYCoord = function() {
    return this.yOrigin;
};

K2.UIElement.prototype.getWidth = function() {
    return this.width;
};

K2.UIElement.prototype.getHeight = function() {
    return this.height;
};

K2.UIElement.prototype.setHeight = function(height) {
    this.height = height;
    if (this.ROIHeight === undefined) {
        this.ROIHeight = height;
    }
};

K2.UIElement.prototype.setWidth = function(width) {
    this.width = width;
    if (this.ROIWidth === undefined) {
        this.ROIWidth = width;
    }
};

K2.UIElement.prototype.getValue = function(slot) {

    if (this.values[slot] === undefined) {
        throw new Error('Slot ' + slot + ' not present or value undefined');
    }
    else {
        return this.values[slot];
    }
};

// Setters
K2.UIElement.prototype.setValue = function(slot, value) {

    if (this.values[slot] === undefined) {
        throw new Error('Slot ' + slot + ' not present or value undefined');
    }

    if (value === this.values[slot]) {
        // Nothing to do.
        return;
    }

    this.values[slot] = value;


};

K2.UIElement.prototype.setListening = function(isListening) {
     if (typeof isListening === 'boolean') {
        this.isListening = isListening;
     }
     else {
        throw 'Property isListening for element ' + this.ID + ' is not boolean ' + isListening;
    }
};

K2.UIElement.prototype.getListening = function() {
    return this.isListening;
};

K2.UIElement.prototype.refresh = function(drawPrimitive) {
// Nothing to do in the abstract class.
};

K2.UIElement.prototype.getID = function() {
    return this.ID;
};

K2.UIElement.prototype.setDrawClass = function(drawClass) {
    this.drawClass = drawClass;
};

K2.UIElement.prototype.setVisible = function(isVisible) {
    if (typeof isVisible === 'boolean') {
        this.isVisible = isVisible;
    }
    else {
        throw 'Property isVisible for element ' + this.ID + ' is not boolean ' + isVisible;
    }

};

K2.UIElement.prototype.getVisible = function() {
    return this.isVisible;
};

K2.UIElement.prototype.setGraphicWrapper = function(wrapper) {
    this.wrapper = wrapper;
};
