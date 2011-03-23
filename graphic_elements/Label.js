function Label(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

//inherit from the Element prototype
Label.prototype = new Element();
//put the correct constructor reference back (not essential)
Label.prototype.constructor = Label;

Label.prototype.getready = function (args) {
    //Reference the getready method from the parent class
    this.tempReady = Element.prototype.getready;
    //and run it as if it were part of this object
    this.tempReady(args);

    /* Get the wrapper primitive functions, unique to label */
    if (args.wrapper.initObject !== undefined) {
        this.drawClass = args.wrapper.initObject ([{objName: "drawText",
                                                    objParms: args.objParms}]);
    }

    this.values = {"labelvalue" : 0};

    //By default, a label always draws itself when value is set.
    this.drawItself = true;

    //By default, a label always refreshes the background. TODO?
    this.preserveBg = args.preserveBg || true;
    this.backgroundSavePending = true;

};

// This methods returns true if the point given belongs to this element.
Label.prototype.isInROI = function (x, y) {
    if ((x > this.xOrigin) && (y > this.yOrigin)) {
        if ((x < (this.xOrigin + this.width)) && (y < (this.yOrigin + this.height))) {
            //console.log(this.name, "point ", x, y, " is in ROI ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);
            return true;
        }
        //console.log(this.name, " ROI Handler: ", x, y, " is NOT in ROI ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);
    }
    return false;
};

// Text filter automatically parses and translates the value.
// This one does nothing. TODO this should be overridden
// and definitely NOT here.
Label.prototype.textFilter = function (value) {
    return value;
};

// Setters
Label.prototype.setValue = function (slot, value) {

    if (this.textFilter !== undefined) {
        var temp_value = this.textFilter(value);
    }

    Element.prototype.setValue.call(this, slot, value);
};
 
Label.prototype.refresh = function () {
    
    var text;

    // Call the superclass.
    Element.prototype.refresh.apply(this, [this.drawClass.drawText]);

    // Draw, if our draw class is already set.
    if (this.drawClass !== undefined) {

        // Maybe the filtering should be done here?
        text = this.values.labelvalue;
        this.drawClass.drawText.draw(text, this.xOrigin, this.yOrigin, this.width, this.height);

    }

};
