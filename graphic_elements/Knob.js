K2.Knob = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Knob, K2.UIElement);

K2.Knob.prototype.getready = function(args) {

    if (args === undefined) {
        throw new Error('Error: specArgs is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Knob.superclass.getready.call(this, args);

    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class

    //Default value is 0
    this.values = {'knobvalue' : 0};
    this.defaultSlot = 'knobvalue';

    this.sensitivity = args.sensitivity || 2000;
    this.imagesArray = args.imagesArray || null;
    
    // Can be 'atan' or 'updown'
    this.knobMethod = args.knobMethod || 'atan';
    
    // In degrees, only important when knobMethod is 'atan'
    this.bottomAngularOffset = args.bottomAngularOffset;
    
    var width = 0,
        height = 0;

    if (this.imagesArray.length < 1) {
        throw new Error('Invalid images array length, ' + this.imagesArray.length);
    }
    
    if (this.imagesArray.length == 1) {
        width = args.tileWidth;
        height = args.tileHeight;
        this.imageNum = args.imageNum;
    }

    else {
        this.imageNum = this.imagesArray.length;
        // Calculate maximum width and height.
        for (var i = 0, len = this.imagesArray.length; i < len; i += 1) {
            if (this.imagesArray[i].width > width) {
                width = this.imagesArray[i].width;
            }
            if (this.imagesArray[i].height > height) {
                height = this.imagesArray[i].height;
            }
        }
    }

    // Set them.
    this.setWidth(width);
    this.setHeight(height);

};


// This method returns an image index given the knob value.
K2.Knob.prototype.getImageNum = function() {
    if ((this.values.knobvalue < 0) || (this.values.knobvalue > 1)) {
        // Do nothing
        return undefined;
    }
    var ret = Math.round(this.values.knobvalue * (this.imageNum - 1));
    return ret;
};

K2.Knob.prototype.getImage = function() {

    var ret = this.getImageNum();
    return this.imagesArray[ret];
};

K2.Knob.prototype.calculateAngle = function (x,y) {
    
    // IMPORTANT: THE FIRST KNOB IMAGE MUST BE THE 0 POSITION
    // 0 POSITION IS THE BOTTOM INTERSECTION WITH THE UNITARY CIRCUMFERENCE
	// TODO MAKE IT PARAMETRIC
	
	var centerX = this.xOrigin + this.width / 2;
	var centerY = this.yOrigin + this.height / 2;
	
	console.log ("Point is: ", x, y, "Center is: ", centerX, centerY);
	
	var radtan = Math.atan2 (x - centerX, y - centerY);
	console.log('radiant atan ', radtan);
	// normalize arctan
	if (radtan < 0) {
        radtan += (2 * Math.PI);
    }
	console.log ('radiant atan, normalized, is ', radtan);
	
	var degreetan = radtan * (180 / Math.PI);
	console.log('degree atan is', degreetan);
	
	// now we have a value from 0 to 360, where 0 is the lowest 
	// intersection with the circumference. degree increases anticlockwise
	// Make it clockwise:
	degreetan = 360 - degreetan;
	
	if (typeof this.bottomAngularOffset !== 'undefined') {
	    // Knob starts and ends with an (angular) symmetrical offset, calculated
	    // from the 0 degrees intersection 
	    // This is quite common in audio knobs
	    degreetan = K2.MathUtils.linearRange(0, 360, -this.bottomAngularOffset, 360 + this.bottomAngularOffset, degreetan);
	    if (degreetan < 0) {
	        degreetan = 0;
	    }
	    if (degreetan > 360) {
	        degreetan = 360;
	    }
	}
	
	var range_val = K2.MathUtils.linearRange(0, 360, 0, 1, Math.floor(degreetan));
	console.log ('value is', range_val);
	return range_val;
	
};

// This method returns true if the point given belongs to this knob.
K2.Knob.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

K2.Knob.prototype.dragstart = K2.Knob.prototype.mousedown = K2.Knob.prototype.touchstart = function(x, y) {

    var inROI = this.isInROI(x, y);
    // Save the starting point if event happened in our ROI.
    if (inROI) {
        this.start_x = x;
        this.start_y = y;
        
        if (this.knobMethod === 'atan') {
            var range_val = this.calculateAngle (x,y);
            var ret = {'slot' : 'knobvalue', 'value' : range_val};
            return ret;
        }
    }
    
    // No value has been changed.
    return undefined;
};

K2.Knob.prototype.dragend = K2.Knob.prototype.mouseup = function(x, y) {

    // Reset the starting point.
    this.start_x = undefined;
    this.start_y = undefined;

    // No value has been changed
    return undefined;

};

K2.Knob.prototype.drag = K2.Knob.prototype.mousemove = function(curr_x, curr_y) {

	var ret;

	if (this.knobMethod === 'updown') {
		// TODO null or typeof
	    if ((this.start_x !== undefined) && (this.start_y !== undefined)) {
	
	        // This means that the mouse is currently down.
	        var deltaY = 0,
	            temp_value,
	            to_set;
	
	        deltaY = curr_y - this.start_y;
	
	        temp_value = this.values.knobvalue;
	
	        // Todo set sensitivity.
	        to_set = temp_value - deltaY / this.sensitivity;
	
	        if (to_set > 1) {
	            to_set = 1;
	        }
	        if (to_set < 0) {
	            to_set = 0;
	        }
	
	        ret = {'slot' : 'knobvalue', 'value' : to_set};
	
	        return ret;
	    }
	}
	
	else if (this.knobMethod === 'atan') {
		if ((this.start_x !== undefined) && (this.start_y !== undefined)) {
			var range_val = this.calculateAngle (curr_x, curr_y);
			ret = {'slot' : 'knobvalue', 'value' : range_val};
			return ret;
		}
	}
	

    // The mouse is currently up; ignore the event notify.
    return undefined;

};

// Setters
K2.Knob.prototype.setValue = function(slot, value) {
    var temp_value = value;

    if ((temp_value < 0) || (temp_value > 1)) {
        // Out of range; do not set
        return;
    }

    // Call the superclass
    K2.Knob.superclass.setValue.call(this, slot, value);

};

K2.Knob.prototype.refresh_CANVAS2D = function(engine) {

    // Draw if visible.
    if (this.isVisible === true) {
        if (this.imagesArray.length > 1) {
            // Get the image to draw
            var imageNum = this.getImageNum();
            // Draw the image on the canvas
            engine.context.drawImage(this.imagesArray[imageNum], this.xOrigin, this.yOrigin);
        }
        else if (this.imagesArray.length == 1) {
            var sx = 0;
            var sy = this.height * this.getImageNum();
            engine.context.drawImage(this.imagesArray[0], sx, sy, this.width, this.height, this.xOrigin, this.yOrigin, this.width, this.height);
        }
    }
    
};