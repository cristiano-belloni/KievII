K2.ClickBar = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.ClickBar, K2.UIElement);


K2.ClickBar.prototype.getready = function(args) {

    var valueName, i;

     // Call the constructor from the superclass.
    K2.ClickBar.superclass.getready.call(this, args);

    // A ClickBar has its starting point, height, width and color.
    this.values = { 'barvalue': null
                  };

    this.defaultSlot = 'barvalue';
    
    this.color = args.color || 'black';
    this.diffColor = args.diffColor || 'LightGray';
    this.prevColor = args.prevColor || 'DarkGray';
    this.landingHeight = args.landingHeight || 20;

    var height = args.height || 0;
    var width = args.width || 0;
    this.maxValue = args.maxValue || 1;
    this.minValue = args.minValue || 0;
     
    this.setWidth(width);
    this.setHeight(height);

};

K2.ClickBar.prototype.isInROI = function(x, y) {

    console.log ('y = ', y, "roitop = ", this.ROITop);
    if ((x >= this.ROILeft) && (y >= this.ROITop - this.landingHeight)) {
            console.log ("1st");
        if ((x <= (this.ROILeft + this.ROIWidth)) && (y <= (this.ROITop + this.ROIHeight + this.landingHeight))) {
            console.log ("In ROI!");
            return true;
        }
    }

    return false;
};

K2.ClickBar.prototype.calculateValue = function (x,y) {
    
    var clickedHeigth = y - this.yOrigin;
    console.log ("heigth on click is ", clickedHeigth, " pixels"); 
    var clickedValue = 1 - (clickedHeigth / this.height);
    console.log ("for a value of ", clickedValue, " (", clickedHeigth, " / ", this.height, ")");
        
    if (clickedValue > this.maxValue) {
        clickedValue = this.maxValue;
    }
        
    if (clickedValue < this.minValue) {
        clickedValue = this.minValue;
    }
    return clickedValue;
    
};


K2.ClickBar.prototype.tap = K2.ClickBar.prototype.dragstart = K2.ClickBar.prototype.mousedown = function(x, y) {
    
        if (this.isInROI (x,y)) {
            var clickedValue = this.calculateValue (x,y);
            
            if (clickedValue === this.values.barvalue) {
                return;
            }            
            this.triggered = true;
            return {slot : 'barvalue', value : clickedValue};
       }
        
        
};

K2.ClickBar.prototype.drag = K2.Curve.prototype.mousemove = function(x, y) {

        if (this.isInROI (x,y)) {
            var clickedValue = this.calculateValue (x, y);
            
            if (clickedValue === this.values.barvalue) {
                return;
            }
            
            return {slot : 'barvalue', value : clickedValue};
        }

};

K2.ClickBar.prototype.release = K2.Curve.prototype.dragend = K2.Curve.prototype.mouseup = function(x, y) {
    
    this.triggered = false;
    
};


K2.ClickBar.prototype.setValue = function(slot, value) {
    // Superclass
    K2.ClickBar.superclass.setValue.call(this, slot, value);

};


K2.ClickBar.prototype.refresh_CANVAS2D = function(engine) {

    if (this.isVisible === true) {
        
        engine.context.fillStyle = this.color;
        //engine.context.strokeStyle = this.borderColor;
        //engine.context.lineWidth = this.thickness;
        //var halfThickness = Math.floor (this.thickness / 2);
        if (this.triggered) {
            engine.context.fillRect (this.xOrigin, this.yOrigin + (1 - this.values.barvalue) * this.height,
                                 this.width,
                                 this.values.barvalue * this.height);
        }
        
        else {
            engine.context.fillRect (this.xOrigin, this.yOrigin + (1 - this.values.barvalue) * this.height,
                                 this.width,
                                 this.values.barvalue * this.height);
                             }
        /*engine.context.strokeRect (this.xOrigin + this.values.xOffset,
                                 this.height - this.values.height - this.values.yOffset,
                                 this.values.width,
                                 this.values.height); */
    }
};
