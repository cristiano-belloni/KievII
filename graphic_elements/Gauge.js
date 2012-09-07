K2.Gauge = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Gauge, K2.UIElement);

K2.Gauge.prototype.getready = function(args) {

    if (typeof args === 'undefined') {
        throw new Error('Error: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Gauge.superclass.getready.call(this, args);

    this.values = { 'gaugevalue': null,
                    'selected'  : [],
                    'held'      : [],
                    'doubletap' : [],
                    'tap'       : []
                  };
                  
    this.defaultSlot = 'gaugevalue';
    
    this.partialValue = null;
    
    this.setWidth(args.width);
    this.setHeight(args.height);
    
    this.color = args.color || "lightgreen";
    this.bgColor = args.bgColor || "#222";
    this.midColor = args.midColor || "#66A666";
    this.transitionTime = args.transitionTime || null;
    
    this.radius = args.radius || (this.width < this.height) ? Math.floor (this.width / 2) : Math.floor (this.height / 2);
    this.thickness = args.thickness || (this.width < this.height) ? Math.floor (this.width / 3) : Math.floor (this.height / 3);
     
    this.animationInterval = null;

};

// This methods returns true if the point given belongs to this element.
K2.Gauge.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
        return false;
    }
};

K2.Gauge.prototype.mousedown = function(x, y) {

    if (this.isInROI(x, y)) {
        this.triggered = true;
    }
    return undefined;
};

K2.Gauge.prototype.mouseup = function(curr_x, curr_y) {

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

K2.Gauge.prototype.setValue = function(slot, value) {
    
    if (slot === 'gaugevalue') {
        this.partialValue = this.values.gaugevalue;
        clearInterval(this.animationInterval);
    }

    // Call the superclass
    K2.Gauge.superclass.setValue.call(this, slot, value);

};

K2.Gauge.prototype.refresh_CANVAS2D = function(engine) {
    // Draw, if the element is visible.
    if (this.isVisible === true) {
        var ctx = engine.context;
        
        ctx.beginPath();
        
        // Background arc, 360 degrees
        ctx.strokeStyle = this.bgColor;
        ctx.lineWidth = this.thickness;
        ctx.arc (this.xOrigin + this.width / 2, this.yOrigin + this.height / 2, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();
        
        var difference = this.values.gaugevalue - this.partialValue;
        
        if (this.transitionTime && difference) {
                
            // Middle (temporary) arc, degrees [0,360] linearly interpolated from gaugevalue [0,1]
            var degrees = K2.MathUtils.linearRange (0, 1, 0, 360, this.values.gaugevalue);
            var radians = degrees * Math.PI / 180;
        
            ctx.beginPath();
            ctx.strokeStyle = this.midColor;
            ctx.lineWidth = this.thickness;
        
            // Draw the temporary arc
            ctx.arc (this.xOrigin + this.width / 2, this.yOrigin + this.height / 2, this.radius, 0 - 90 * Math.PI / 180, radians - 90 * Math.PI / 180, false); 
            ctx.stroke();
            
            // Translate difference in degrees
            var degDiff = K2.MathUtils.linearRange (0, 1, 0, 360, difference);
            this.animationInterval = setInterval(this.animateGauge(ctx), this.transitionTime * 1000 / degDiff);
                        
        }
        else {
            // No temporary arc. Draw the gauge directly.
            this.drawGauge (ctx, this.values.gaugeValue);
        }
           
    }
};

K2.Gauge.prototype.drawGauge = function(ctx, value, that) {
    // Foreground (gauge) arc, degrees [0,360] linearly interpolated from gaugevalue [0,1]
    var degrees = K2.MathUtils.linearRange (0, 1, 0, 360, value);
    var radians = degrees * Math.PI / 180;
    
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;
    
    //The arc starts from the rightmost end. If we deduct 90 degrees from the angles
    //the arc will start from the topmost end
    ctx.arc (this.xOrigin + this.width / 2, this.yOrigin + this.height / 2, this.radius, 0 - 90 * Math.PI / 180, radians - 90 * Math.PI / 180, false); 
    ctx.stroke(); 
};

K2.Gauge.prototype.animateGauge = function(context) {
    
    var ctx = context;
    var that = this;
    
    return function () {
        // One degree in the range [0,1]
        var degree = K2.MathUtils.linearRange (0, 360, 0, 1, 1);
        that.partialValue += degree;
        
        if (that.partialValue < that.values.gaugevalue) {
            that.drawGauge (ctx, that.partialValue);
            console.log ("Drawing animation partial value ", that.partialValue);
        }
        else {
            that.drawGauge (ctx, that.values.gaugevalue, that);
        }
    };
 
};