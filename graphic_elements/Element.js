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

    //By default, we want to be notified if some event occurs.
    this.isClickable = args.isClickable || true;

    // These are arrays of 2
    this.xOrigin = args.left;
    this.yOrigin = args.top;

    // This is the bounding box. Element has no dimension.
    this.width = args.width;
    this.height = args.height;

    // Element never draws itself by default
    this.drawItself = args.drawItself || false;

    // Element is visible by default
    this.isVisible = args.isVisible || true;

    // These are to be set later
    this.values = {};
    
    // Set this if the element needs to preserve its background.
    this.preserveBg = args.preserveBg || false;

    if (this.preserveBg === true) {
        // Set this if the element has to save the background now.
        this.backgroundSavePending = true;
    }

    // Specific parameters of the object, to be passed to the wrapper
    this.objParms = args.objParms;

    // See if there is a callback to call when the value is set
    if (args !== undefined) {
        if (typeof (args.onValueSet) === "function") {
            this.onValueSet = args.onValueSet;
        }
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

    var temp_value = value;

    if (this.values[slot] === undefined) {
        throw new Error("Slot " + slot + " not present or value undefined");
    }

    if (temp_value === this.values[slot]) {
        // Nothing to do.
        return;
    }

    this.values[slot] = temp_value;

    // If the element needs to be refreshed, refresh it now.
    if (this.drawItself === true) {
        this.refresh();
    }

    // Finally, call the callback if there's one.
    if (typeof (this.onValueSet) === "function") {
        this.onValueSet (slot, this.values[slot], this.ID);
    }

};

//TODO this should be changed in isListening, for example
Element.prototype.setClickable = function (isClickable) {
     if (typeof isClickable === "boolean") {
        this.isClickable = isClickable;
     }
};

Element.prototype.getClickable = function () {
    return this.isClickable;
};

Element.prototype.setDrawsItself = function (drawItself) {
    if (typeof drawItself === "boolean") {
        this.drawItself = drawItself;
    }
};

Element.prototype.setTainted = function (tainted) {
    if (typeof tainted === "boolean") {
        this.backgroundSavePending = tainted;
    }
}

// Refresh. This is the basic action.
Element.prototype.refresh = function (drawPrimitive) {

    if (this.preserveBg === true) {
        if (this.backgroundSavePending === true) {
            drawPrimitive.saveBackground (this.xOrigin, this.yOrigin, this.width, this.height);
            this.backgroundSavePending = false;
        }

        else {
            // We want drawClass to refresh the saved background.
            drawPrimitive.restoreBackground();
        }
    }
};

Element.prototype.getName = function () {
    return this.name;
};

Element.prototype.setDrawClass = function (drawClass) {
    this.drawClass = drawClass;
};

Element.prototype.setVisible = function (isVisible) {
    if (typeof isVisible === "boolean") {
        this.isVisible = isVisible;
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
