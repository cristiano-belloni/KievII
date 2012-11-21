K2.Background = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Background, K2.UIElement);

K2.Background.prototype.getready = function(args) {

    if (typeof args === 'undefined') {
        throw new Error('Error: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Background.superclass.getready.call(this, args);

    /* TODO implement these */
    this.values = { 'selected'  : [],
                    'held'      : [],
                    'doubletap' : [],
                    'tap'       : []
                  };
                  
    this.defaultSlot = 'selected';

    this.image = args.image;

    this.setWidth(this.image.width);
    this.setHeight(this.image.height);


};

// This method returns the image object.
K2.Background.prototype.GetImage = function() {
    return this.image;
};

// This methods returns true if the point given belongs to this element.
K2.Background.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
        return false;
    }
};

K2.Background.prototype.mousedown = function(x, y) {

    if (this.isInROI(x, y)) {
        this.triggered = true;
    }
    return undefined;
};

K2.Background.prototype.mouseup = function(curr_x, curr_y) {

    var to_set = 0,
        ret = {};

    if (this.triggered) {

        if (this.isInROI(curr_x, curr_y)) {

            ret = {'slot' : 'selected', 'value' : [curr_x, curr_y]};

            // Click on bg is completed.
            this.triggered = false;

            return ret;
        }
    }

    // Action is void, button was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;

};

K2.Background.prototype.refresh_CANVAS2D = function(engine) {

    // Draw, if the element is visible.
    if (this.isVisible === true) {
        engine.context.drawImage(this.image, this.xOrigin, this.yOrigin);
    }

};

