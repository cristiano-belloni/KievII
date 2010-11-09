function Element(name, topleft) {
    if (arguments.length) {
        this.getready(name, topleft);
    }
}

Element.prototype.getready = function (name, topleft) {
    this.drawClass = undefined;
    this.isClickable = false;
    this.name = name;
    // These are arrays of 2
    this.xOrigin = topleft[0];
    this.yOrigin = topleft[1];
    // This is the bounding box. Element has no dimension.
    this.width = 0;
    this.height = 0;
    // Element never draws itself.
    this.drawItself = false;
    // These are to be set later
    this.values = {};
    // Completion
    this.objectsTotal = 0;
    this.objectsLoaded = 0;
    this.completed = false;
};

Element.prototype.IsInROI = function (x, y) {
    // This is the abstract class.
    return false;
};

Element.prototype.onROI = function (start_x, start_y, curr_x, curr_y) {
    // This is the abstract class.
    var ret = {"slot" : undefined, "value" : undefined};
    return ret;
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

    if (this.drawItself === true) {
        this.refresh();
    }

};

Element.prototype.setClickable = function (isClickable) {
    this.isClickable = isClickable;
};

Element.prototype.setDrawsItself = function (value) {
    this.drawItself = value;
};

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

