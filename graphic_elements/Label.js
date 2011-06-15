function Label(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(Label, Element);

Label.prototype.getready = function (args) {

    // Call the constructor from the superclass.
    Label.superclass.getready.call(this, args);

    this.values = {"labelvalue" : ""};
     
    this.setWidth(args.width);
    this.setHeight(args.height);

};

// This methods returns true if the point given belongs to this element.
Label.prototype.isInROI = function (x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

// Setters
Label.prototype.setValue = function (slot, value, fireCallback) {
    Label.superclass.setValue.call(this, slot, value, fireCallback);
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
