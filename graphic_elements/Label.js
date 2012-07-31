K2.Label = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(K2.Label, K2.UIElement);

K2.Label.prototype.getready = function(args) {

    // Call the constructor from the superclass.
    K2.Label.superclass.getready.call(this, args);

    this.values = {'labelvalue' : ''};
    this.defaultSlot = 'labelvalue';

    this.setWidth(args.width);
    this.setHeight(args.height);

};

// This methods returns true if the point given belongs to this element.
K2.Label.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

// Setters
K2.Label.prototype.setValue = function(slot, value) {
    K2.Label.superclass.setValue.call(this, slot, value);
};

K2.Label.prototype.refresh = function() {

    var text;
    if (this.drawClass !== undefined) {
        // Draw, if our draw class is already set.

        // Call the superclass.
        K2.Label.superclass.refresh.call(this, this.drawClass.drawText);

        // Draw, if our draw class is already set.
        if (this.isVisible === true) {

            // Maybe the filtering should be done here?
            text = this.values.labelvalue;
            this.drawClass.drawText.draw(text, this.xOrigin, this.yOrigin, this.width, this.height);

        }
    }

};

K2.Label.prototype.setGraphicWrapper = function(wrapper) {

    // Call the superclass.
    K2.Label.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions
    this.drawClass = wrapper.initObject([{objName: 'drawText',
                                           objParms: this.objParms}]);
};
