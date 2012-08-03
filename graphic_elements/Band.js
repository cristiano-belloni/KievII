K2.Band = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

K2.extend(K2.Band, K2.UIElement);


K2.Band.prototype.getready = function(args) {

    var valueName, i;

     // Call the constructor from the superclass.
    K2.Band.superclass.getready.call(this, args);

    // A band has its starting point, height, width and color.
    this.values = { 'width'     : 0,
                    'height'    : 0,
                    'selected'  : false,
                    'xOffset'   : 0,
                    'yOffset'   : 0};

    this.defaultSlot = 'height';
    
    this.color = args.color || 'red';
    this.proximity = args.proximity || 10;
    this.borders = args.borders || {top: true, bottom: true, right: true, left: true};
    this.move = args.move || true;
    var height = args.height || 0;
    var width = args.width || 0; 
    this.setWidth(width);
    this.setHeight(height);

};

K2.Band.prototype.isInROI = function(x, y) {
// TODO to reflect the bounding box of the element ?
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
        }
    }

    return false;
};

K2.Band.prototype.tap = K2.Band.prototype.dragstart = K2.Band.prototype.mousedown = function(x, y) {
    
    /*if (this.isInROI(x, y)) {*/
        
        var left_min_prox = this.values.xOffset - this.proximity;
        var left_max_prox = this.values.xOffset + this.proximity;
        var right_min_prox = this.values.xOffset + this.values.width - this.proximity;
        var right_max_prox = this.values.xOffset + this.values.width + this.proximity;
        var bottom_max_prox = this.height - this.values.yOffset + this.proximity;
        var bottom_min_prox = this.height - this.values.yOffset - this.proximity;
        var top_max_prox = this.height - (this.values.yOffset + this.values.height) + this.proximity;
        var top_min_prox = this.height - (this.values.yOffset + this.values.height) - this.proximity;
        
        // Test side proximity
        if ((x > left_min_prox) &&  x < (left_max_prox)) {
            // We're next to the left side
            this.leftSide = true;
            console.log ("Left side click detected");
        }
        if ((x > right_min_prox) &&  x < (right_max_prox)) {
            // We're next to the right side
            this.rightSide = true;
            console.log ("Right side click detected");
        }
        if ((y > bottom_min_prox) &&  y < (bottom_max_prox)) {
            // We're next to the bottom side
            this.bottomSide = true;
            console.log ("Bottom side click detected");
        }
        if ((y > top_min_prox) &&  y < (top_max_prox)) {
            // We're next to the top side
            this.topSide = true;
            console.log ("Top side click detected");
        }
        
        var xInside = false;
        var yInside = false;
        
        if (this.values.width > 0) {
            if ((x > this.values.xOffset) && (x < this.values.xOffset + this.values.width)) {
                xInside = true;
            }
        }
        else {
            if ((x < this.values.xOffset) && (x > this.values.xOffset + this.values.width)) {
                xInside = true;
            }
        }
        
        if (this.values.height > 0) {
            if ((y > this.height - (this.values.yOffset + this.values.height)) && (y < this.height - this.values.yOffset)) {
                yInside = true;
            }
        }
        else {
            if ((y < this.height - (this.values.yOffset + this.values.height)) && (y > this.height - this.values.yOffset)) {
                yInside = true;
            }
        }
        
        if (xInside && yInside) {
            console.log ("clicked inside!");
        }
};

K2.Band.prototype.drag = K2.Curve.prototype.mousemove = function(curr_x, curr_y) {

    var ret = {},
        points;
    
    if (this.leftSide && this.borders.left) {
        return [{slot: 'width', value : this.values.width - (curr_x - this.values.xOffset)}, {slot : 'xOffset', value : curr_x}];
    }
    
    if (this.rightSide && this.borders.right) {
        return {slot : 'width', value : (curr_x - this.values.xOffset)};
    }
    
    if (this.bottomSide && this.borders.bottom) {
        return [{slot: 'height', value : this.values.height + (curr_y - (this.height - this.values.yOffset))}, {slot : 'yOffset', value : this.height - curr_y}];
    }
    
    if (this.topSide && this.borders.top) {
        return {slot : 'height', value : (this.height - curr_y - this.values.yOffset)};
    }
    
    // Action is void, button was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;

};

K2.Band.prototype.release = K2.Curve.prototype.dragend = K2.Curve.prototype.mouseup = function(x, y) {
    // Drag guards are reset to false
    this.leftSide = this.rightSide =  this.bottomSide = this.topSide = false;
    
    // Selection event
    // check if the point is inside the band
    // if the saved guard is true
    // reset the guard and trigger a selected event
    /*if (this.selectStart === true) {
        if (this.isInCurve(x, y)) {
            //Curve is selected
            this.selectStart = false;
            var ret = {'slot' : 'selected', 'value' : [x, y]};
            return ret;
            }
    }*/
};

K2.Band.prototype.setValue = function(slot, value) {
    // Superclass
    K2.Band.superclass.setValue.call(this, slot, value);

};


K2.Band.prototype.refresh_CANVAS2D = function(engine) {


    // Draw, if our draw class is already set.
    if (this.isVisible === true) {
        
        engine.context.save();
        engine.context.fillStyle = this.color;
        engine.context.fillRect (this.xOrigin + this.values.xOffset,
                                 this.height - this.values.height - this.values.yOffset,
                                 this.values.width,
                                 this.values.height);
        engine.context.restore();
    }
};
