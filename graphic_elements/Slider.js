// Ok, this Slider is an horizontal one. Must implement the vertical one as well.
function Slider(name, topleft, sliderImg, knobImg) {
    if (arguments.length) {
        this.getready(name, topleft, sliderImg, knobImg);
    }
}

//inherit from the Element prototype
Slider.prototype = new Element();
//put the correct constructor reference back (not essential)
Slider.prototype.constructor = Slider;

Slider.prototype.getready = function (name, topleft, sliderImg, knobImg) {
    //reference the getready method from the parent class
    this.tempReady = Element.prototype.getready;
    //and run it as if it were part of this object
    this.tempReady(name, topleft);
    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class
    this.values = {"Slidervalue" : 0};
    this.objectsLoaded = 0;

    //By default, a Slider always draws itself when value is set.
    this.drawItself = true;

    this.width = 0;
    this.height = 0;

    // Set the status progress.
    this.objectsTotal = 2;

    this.sliderImage = new Image();
    this.sliderImage.onload = this.onLoad(this);
    this.sliderImage.src = sliderImg;

    this.knobImage = new Image();
    this.knobImage.onload = this.onLoad(this);
    this.knobImage.src = knobImg;

};

Slider.prototype.onLoad = function (that) {
    return function () {
        that.objectsLoaded += 1;
        if (that.objectsLoaded === that.objectsTotal) {
            that.onCompletion();
            that.completed = true;
        }
    };
};

// This method returns an x position given the Slider value.
/*jslint nomen: false*/
Slider.prototype._getKnobPosition = function () {
/*jslint nomen: true*/
    if ((this.values.Slidervalue < 0) || (this.values.Slidervalue > 1)) {
        // Do nothing
        return undefined;
    }
    var ret = Math.round(this.values.Slidervalue * this.width) + this.xOrigin;
    return ret;
};

// This method returns true if the point given belongs to this Slider.
Slider.prototype.isInROI = function (x, y) {
    if ((x > this.xOrigin) && (y > this.yOrigin)) {
        if ((x < (this.xOrigin + this.width)) && (y < (this.yOrigin + this.height))) {
            return true;
        }
        /*jsl:pass*/
    }
    return false;
};

Slider.prototype.onROI = function (start_x, start_y, curr_x, curr_y) {

    var to_set,
        ret;

    to_set = (curr_x - this.xOrigin) / (this.width);

    if (to_set > 1) {
        to_set = 1;
    }
    if (to_set < 0) {
        to_set = 0;
    }

    ret = {"slot" : "Slidervalue", "value" : to_set};

    return ret;
};

Slider.prototype.getDefaultValue = function () {
    return this.values.Slidervalue;
};

// Setters
Slider.prototype.setValue = function (slot, value) {

    if (this.values[slot] === value) {
        // Don't update and refresh, just return!
        return;
    }

    if ((value < 0) || (value > 1)) {
        // Can happen if the user drags too much.
        return;
    }

    // Now, we call the superclass
    this.tempsetValue = Element.prototype.setValue;
    this.tempsetValue(slot, value);

};

Slider.prototype.refresh = function () {
    if (this.drawClass === undefined) {
        throw new Error("Error: drawClass is undefined!");
    }
    else {
        this.drawClass.draw(this.sliderImage, this.xOrigin, this.yOrigin);
        /*jslint nomen: false*/
        this.drawClass.draw(this.knobImage, this._getKnobPosition(), this.yOrigin);
        /*jslint nomen: true*/
    }
};

Slider.prototype.onCompletion = function () {
    // Images were loaded, we can take their width and height.
    this.width = this.sliderImage.width;
    this.height = this.sliderImage.height;
};
