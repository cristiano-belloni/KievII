function Label(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(Label, Element);

Label.prototype.getready = function (args) {

    // Call the constructor from the superclass.
    Label.superclass.getready.call(this, args);

    this.values = {"labelvalue" : 0};

    //By default, a label always draws itself when value is set.
    this.drawItself = args.drawItself || true;

    //By default, a label always refreshes the background.
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

// Setters
Label.prototype.setValue = function (slot, value) {
    Label.superclass.setValue.call(this, slot, value);
};
 
Label.prototype.refresh = function () {
    
    var text;
    if (this.drawClass !== undefined) {
        // Draw, if our draw class is already set.

        // Call the superclass.
        Label.superclass.refresh.call(this, this.drawClass.drawText);

        // Draw, if our draw class is already set.
        if (this.isVisible === true) {

            // Maybe the filtering should be done here?
            text = this.values.labelvalue;
            this.drawClass.drawText.draw(text, this.xOrigin, this.yOrigin, this.width, this.height);

        }
    }

};

Label.prototype.setGraphicWrapper = function (wrapper) {

    // Call the superclass.
    Label.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions
    this.drawClass = wrapper.initObject ([{objName: "drawText",
                                           objParms: this.objParms}]);
}
