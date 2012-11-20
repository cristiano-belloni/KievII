K2.Area = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Area, K2.UIElement);


K2.Area.prototype.getready = function(args) {

    var valueName, i;

     // Call the constructor from the superclass.
    K2.Area.superclass.getready.call(this, args);

    // A Area has its starting point, height, width and color.
    this.values = { 'width'     : 0,
                    'height'    : 0,
                    'selected'  : [],
                    'xOffset'   : 0,
                    'yOffset'   : 0,
                    'doubletap'	: [],
                    'held'		: []
                    };

    this.defaultSlot = 'height';
    
    this.color = args.color || 'black';
    this.borderColor = args.borderColor || 'green';
    
    this.proximity = Math.floor(args.proximity) || 10;
    this.thickness = Math.floor(args.thickness) || this.proximity;
    
    if (args.thickness === 0) {
		this.thickness = 0;
    }
    
    // Can paint the borders
    this.borders = args.borders || {top: true, bottom: true, right: true, left: true};
    // Can drag the borders
    this.dragBorders = args.dragBorders || {top: true, bottom: true, right: true, left: true};
    // Move can be 'none', 'x', 'y', 'all'
    this.move = args.move || 'all';
    
    this.xMonotone = args.xMonotone || false;
    this.yMonotone = args.yMonotone || false;
    
    
    // TODO ROI
    
    var height = args.height || 0;
    var width = args.width || 0;
    
    this.values.width = width;
    this.values.height = height;
    
    var xOffset = args.left || 0;
    var yOffset = args.top || 0;
    
    this.values.xOffset = xOffset;
    this.values.yOffset = yOffset;

};

K2.Area.prototype.isInArea = function (x,y) {
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
        if ((y > this.values.yOffset) && (y < this.values.height + this.values.yOffset)) {
            yInside = true;
        }
    }
    else {
        if ((y < this.values.yOffset) && (y > this.values.height + this.values.yOffset)) {
            yInside = true;
        }
    }
    
    if (xInside && yInside) {
        return true;
    }
    else {
        return false;
    }
    
};

K2.Area.prototype.tap = K2.Area.prototype.dragstart = function(x, y) {
    
    /*if (this.isInROI(x, y)) {*/
        
        var left_min_prox = this.values.xOffset - this.proximity;
        var left_max_prox = this.values.xOffset + this.proximity;
        var right_min_prox = this.values.xOffset + this.values.width - this.proximity;
        var right_max_prox = this.values.xOffset + this.values.width + this.proximity;
        var bottom_max_prox = this.values.height + this.values.yOffset + this.proximity;
        var bottom_min_prox = this.values.height + this.values.yOffset - this.proximity;
        var top_max_prox = this.values.yOffset + this.proximity;
        var top_min_prox = this.values.yOffset - this.proximity;
        
        // Test side proximity
        if ((x > left_min_prox) &&  x < (left_max_prox) && this.dragBorders.left === true) {
            // We're next to the left side
            this.leftSide = true;
            console.log ("Left side click detected");
        }
        if ((x > right_min_prox) &&  x < (right_max_prox) && this.dragBorders.right === true) {
            // We're next to the right side
            this.rightSide = true;
            console.log ("Right side click detected");
        }
        if ((y > bottom_min_prox) &&  y < (bottom_max_prox) && this.dragBorders.bottom === true) {
            // We're next to the bottom side
            this.bottomSide = true;
            console.log ("Bottom side click detected");
        }
        if ((y > top_min_prox) &&  y < (top_max_prox) && this.dragBorders.top === true) {
            // We're next to the top side
            this.topSide = true;
            console.log ("Top side click detected");
        }
        
        if (this.isInArea (x,y)) {
            console.log ("clicked inside!");
            this.inside = true;
            this.startPoint = [x,y];
        }
        else this.inside = false;
};

K2.Area.prototype.drag /*= K2.Area.prototype.mousemove =*/ =  function(curr_x, curr_y) {

    var ret = [];
    var newWidth, newHeight;
       
    if (this.leftSide && this.borders.left) {
        
        newWidth = this.values.width - (curr_x - this.values.xOffset);
        var newX = curr_x;
        
        if ((this.xMonotone) && (newWidth < 0)) {
            newWidth = 0;
            newX = this.values.xOffset;
        }
        
        ret.push ({slot: 'width', value : newWidth});
        ret.push ({slot : 'xOffset', value : newX});
    }
    
    if (this.rightSide && this.borders.right && !this.leftSide) {
        newWidth = curr_x - this.values.xOffset;
        
        if ((this.xMonotone) && (newWidth < 0)) {
            newWidth = 0;
        }
        
        ret.push ({slot : 'width', value : newWidth});
    }
    
    if (this.bottomSide && this.borders.bottom) {
        
        newHeight = (this.values.height + (curr_y - (this.values.yOffset + this.values.height)));
        
        if ((this.yMonotone) && (newHeight < 0)) {
            newHeight = 0;
        }
        
        ret.push ({slot: 'height', value : newHeight});
    }
    
    if (this.topSide && this.borders.top && !this.bottomSide) {
        
        newHeight = this.values.height + (this.values.yOffset - curr_y);
        var newY = curr_y;
        
        if ((this.yMonotone) && (newHeight < 0)) {
            newHeight = 0;
            newY = this.values.yOffset;
        }
        
        ret.push ({slot : 'yOffset', value : newY});
        ret.push ({slot : 'height', value : newHeight});
    }
    
    if (ret.length > 0) {
        // return here, do not move
        return ret;
    }
    
    // Move the element
    if (this.inside) {
        if (this.move !== 'none') {
            
            var xDelta = curr_x - this.startPoint[0];
            var yDelta = curr_y - this.startPoint[1];
            this.startPoint = [curr_x, curr_y];

            if (this.move === 'all') {
                return ([{slot : 'xOffset', value : this.values.xOffset + xDelta}, {slot : 'yOffset', value : this.values.yOffset + yDelta}]);
            }
            else if (this.move === 'x') {
                return ({slot : 'xOffset', value : this.values.xOffset + xDelta});
            }
            else if (this.move === 'y') {
                return ({slot : 'yOffset', value : this.values.yOffset + yDelta});
            } 
        }
    }

};

K2.Area.prototype.release = K2.Area.prototype.dragend = K2.Area.prototype.mouseup = function(x, y) {
    
    var ret;
    
    // Drag guards are reset to false
    this.leftSide = this.rightSide =  this.bottomSide = this.topSide = false;
    
    // Clicked in and out inside the object. the object is selected
    if (this.inside) {
        if (this.isInArea (x,y)) {
           ret = {slot : 'selected', value : [x, y]}; 
        }
    }
    this.inside = false;
    
    return ret; 
    
};

K2.Area.prototype.hold = function(x, y) {
	if (this.isInArea(x, y)) {
		//Area is held
	    var ret = {'slot' : 'held', 'value' : [x, y]};
	    return ret;
   }
};

K2.Area.prototype.doubletap = function(x, y) {
	if (this.isInArea(x, y)) {
		return {'slot' : 'doubletap', 'value' : [x, y]};
	}
};

K2.Area.prototype.setValue = function(slot, value) {
    // Superclass
    K2.Area.superclass.setValue.call(this, slot, value);

};


K2.Area.prototype.refresh_CANVAS2D = function(engine) {

    if (this.isVisible === true) {
        
        engine.context.fillStyle = this.color;
        engine.context.strokeStyle = this.borderColor;
        engine.context.lineWidth = this.thickness;
        var halfThickness = Math.floor (this.thickness / 2);
        engine.context.fillRect (this.xOrigin + this.values.xOffset + halfThickness,
                                 this.values.yOffset + halfThickness,
                                 this.values.width - halfThickness * 2,
                                 this.values.height - halfThickness * 2);
        if (this.thickness > 0) {
			engine.context.strokeRect (	this.xOrigin + this.values.xOffset,
										this.values.yOffset,
										this.values.width,
										this.values.height);
		}
    }
};

K2.Area.prototype.getXCoord = function() {
    return this.values.xOrigin;
};

K2.Area.prototype.getYCoord = function() {
    return this.values.yOrigin;
};

K2.Area.prototype.getWidth = function() {
    return this.values.width;
};

K2.Area.prototype.getHeight = function() {
    return this.values.height;
};

K2.Area.prototype.setHeight = function(height) {
    this.values.height = height;
    if (typeof this.ROIHeight === 'undefined') {
        this.ROIHeight = height;
    }
};

K2.Area.prototype.setWidth = function(width) {
    this.values.width = width;
    if (typeof this.ROIWidth === 'undefined') {
        this.ROIWidth = width;
    }
};
