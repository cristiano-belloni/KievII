function Element(name, topleft) {
    if (arguments.length) {
        this.getready(name, topleft);
    }
}

Element.prototype.getready = function (name, topleft, specArgs) {

    if (specArgs.isClickable !== true) {
        this.isClickable = false;
    }

    this.name = name;

    //By default, we want to be notified if some event occurs.
    this.isClickable = specArgs.isClickable || true;

    // These are arrays of 2
    this.xOrigin = topleft[0];
    this.yOrigin = topleft[1];

    // This is the bounding box. Element has no dimension.
    this.width = 0;
    this.height = 0;

    // Element never draws itself by default
    this.drawItself = specArgs.drawItself || false;

    // These are to be set later
    this.values = {};

    // Completion
    this.objectsTotal = 0;
    this.objectsLoaded = 0;
    this.completed = false;

    // Set this if the element needs to preserve its background.
    this.preserveBg = false;

    // See if there is a callback to call when the value is set
    if (specArgs !== undefined) {
        if (typeof (specArgs.onValueSet) === "function") {
            this.onValueSet = specArgs.onValueSet;
        }
    }
    // See if there is a callback on load completion
    if (specArgs !== undefined) {
        if (typeof (specArgs.onComplete) === "function") {
            this.onComplete = specArgs.onComplete;
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

Element.prototype.getStatus = function () {
    return {"objectsTotal" : this.objectsTotal, "objectsLoaded" : this.objectsLoaded};
};

Element.prototype.isComplete = function () {
    return this.completed;
};

Element.prototype.onCompletion = function () {

    // Call the callback if there's one.
    if (typeof (this.onComplete) === "function") {
        this.onComplete (this.name);
    }

    return;
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
        this.onValueSet (slot, this.values[slot], this.name);
    }

};

//TODO this should be changed in isListening, for example
Element.prototype.setClickable = function (isClickable) {
    this.isClickable = isClickable;
};

Element.prototype.getClickable = function () {
    return this.isClickable;
};

Element.prototype.setDrawsItself = function (value) {
    this.drawItself = value;
};

Element.prototype.setPreserveBg = function (value) {
    this.preserveBg = value;
}

// Refresh. This is the basic action.
Element.prototype.refresh = function () {
    this.drawFunc();
};

Element.prototype.getName = function () {
    return this.name;
};

Element.prototype.setDrawClass = function (drawClass) {
    this.drawClass = drawClass;
};

Element.prototype.onMouseMove = function (x,y) {
    return undefined;
};

Element.prototype.onMouseDown = function (x,y) {
    return undefined;
};

Element.prototype.onMouseUp = function (x,y) {
    return undefined;
};
