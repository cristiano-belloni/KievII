K2.Label = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Label, K2.UIElement);

K2.Label.prototype.getready = function(args) {

    // Call the constructor from the superclass.
    K2.Label.superclass.getready.call(this, args);

    this.values = {'labelvalue' : ''};
    this.defaultSlot = 'labelvalue';

    this.textColor = args.textColor || 'black';
    
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

K2.Label.prototype.refresh_CANVAS2D = function(engine) {

    var text;

    if (this.isVisible === true) {

        if (typeof this.objParms !== 'undefined') {
            
            if (typeof this.objParms.textBaseline !== 'undefined') {
                engine.context.textBaseline =  this.objParms.textBaseline;
            }
            if (typeof this.objParms.textAlign !== 'undefined') {
                engine.context.textAlign =  this.objParms.textAlign;
            }
            if (typeof this.objParms.font !== 'undefined') {
                engine.context.font =  this.objParms.font;
            }
            
        }
        engine.context.fillStyle = this.textColor;
        engine.context.fillText(this.values.labelvalue, this.xOrigin, this.yOrigin);
    }
};