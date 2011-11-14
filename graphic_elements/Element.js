function extend(subClass, superClass) {
    var F = function() {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    subClass.superclass = superClass.prototype;
    if(superClass.prototype.constructor == Object.prototype.constructor) {
        superClass.prototype.constructor = superClass;
    }
}

function Element(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

Element.prototype.getready = function (args) {

    this.ID = args.ID;

    // By default, we want to be notified if some event occurs.
    this.isClickable = args.isClickable;
    
    if (typeof (this.isClickable) === 'undefined') {
        this.isClickable = true;
    }
    
    if (typeof (this.isClickable) !== 'boolean') {
        throw "Property isClickable for element " + this.ID + " is not boolean " + this.isClickable;
    }

    // Element is visible by default
    this.isVisible = args.isVisible;

    if (typeof (this.isVisible) === 'undefined') {
        this.isVisible = true;
    }

    if (typeof (this.isVisible) !== 'boolean') {
        throw "Property isVisible for element " + this.ID + " is not boolean " + this.isVisible;
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
Element.prototype.isInROI = function (x, y) {
    // This is the abstract class.
    return false;
};

Element.prototype.getValues = function () {
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

Element.prototype.getXCoord = function () {
    return this.xOrigin;
};

Element.prototype.getYCoord = function () {
    return this.yOrigin;
};

Element.prototype.getWidth = function () {
    return this.width;
};

Element.prototype.getHeight = function () {
    return this.height;
};

Element.prototype.setHeight = function (height) {
    this.height = height;
    if (this.ROIHeight === undefined) {
        this.ROIHeight = height;
    }
}

Element.prototype.setWidth = function (width) {
    this.width = width;
    if (this.ROIWidth === undefined) {
        this.ROIWidth = width;
    }
}

Element.prototype.getValue = function (slot) {
    
    if (this.values[slot] === undefined) {
        throw new Error("Slot " + slot + " not present or value undefined");
    }
    else {
        return this.values[slot];
    }
};

// Setters
Element.prototype.setValue = function (slot, value) {

    if (this.values[slot] === undefined) {
        throw new Error("Slot " + slot + " not present or value undefined");
    }

    if (value === this.values[slot]) {
        // Nothing to do.
        return;
    }

    this.values[slot] = value;
    

};

//TODO this should be changed in isListening, for example
Element.prototype.setClickable = function (isClickable) {
     if (typeof isClickable === "boolean") {
        this.isClickable = isClickable;
     }
     else {
        throw "Property isClickable for element " + this.ID + " is not boolean " + isClickable;
    }
};

Element.prototype.getClickable = function () {
    return this.isClickable;
};

// Refresh. This is the basic action.
Element.prototype.refresh = function (drawPrimitive) {
// Nothing to do in the abstract class.
};

Element.prototype.getID = function () {
    return this.ID;
};

Element.prototype.setDrawClass = function (drawClass) {
    this.drawClass = drawClass;
};

Element.prototype.setVisible = function (isVisible) {
    if (typeof isVisible === "boolean") {
        this.isVisible = isVisible;
    }
    else {
        throw "Property isVisible for element " + this.ID + " is not boolean " + isVisible;
    }

}

Element.prototype.getVisible = function () {
    return this.isVisible;
}

Element.prototype.onMouseMove = function (x,y) {
    return undefined;
};

Element.prototype.onMouseDown = function (x,y) {
    return undefined;
};

Element.prototype.onMouseUp = function (x,y) {
    return undefined;
};

Element.prototype.setGraphicWrapper = function (wrapper) {
    this.wrapper = wrapper;
}
