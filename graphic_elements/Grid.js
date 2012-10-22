K2.Grid = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Grid, K2.UIElement);

K2.Grid.prototype.getready = function(args) {

    if (args === undefined) {
        throw new Error('Error: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Grid.superclass.getready.call(this, args);

    this.setWidth(args.width);
    this.setHeight(args.height);

    // Now that all required properties have been inherited
    // from the parent class, define extra ones from this class
    this.values = {'selected' : []};
    this.defaultSlot = '';

    this.triggered = false;

    this.rows = args.rows || 4;
    this.columns = args.columns || 4;
    // line or dashed
    this.style = args.style || 'line';
    // line color
    this.lineColor = args.lineColor || "#eee";
    // bg color
    this.bgColor = args.bgColor || "white";
    // Dashed array
    this.dashArray = args.dashArray;
    // line width
    this.lineWidth = args.lineWidth || 0.1; 

    if ((this.rows < 0) || (this.columns < 0)) {
        throw new Error('Invalid number of row / columns ' + this.rows + ' / ' + this.columns);
    }

};

// This method returns true if the point given belongs to this Grid.
K2.Grid.prototype.isInROI = function(x, y) {
    if ((x >= this.ROILeft) && (y >= this.ROITop)) {
        if ((x <= (this.ROILeft + this.ROIWidth)) && (y <= (this.ROITop + this.ROIHeight))) {
            return true;
        }
        /*jsl:pass*/
    }
    return false;
};

K2.Grid.prototype.mousedown = function(x, y) {

    //console.log ("Click down on ", x, y);

    if (this.isInROI(x, y)) {
        this.triggered = true;
    }
    return undefined;
};

K2.Grid.prototype.mouseup = function(curr_x, curr_y) {

    if (this.triggered) {
        // Grid is activated when cursor is still in the element ROI, otherwise action is void.
        if (this.isInROI(curr_x, curr_y)) {

            // Click on Grid is completed, the Grid is no more triggered.
            this.triggered = false;

            return {slot: 'selected', value: [curr_x, curr_y]};
        }
    }

    // Action is void, Grid was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;

};

// Setters
K2.Grid.prototype.setValue = function(slot, value) {

	K2.Grid.superclass.setValue.call(this, slot, value);

};

K2.Grid.prototype.refresh_CANVAS2D = function(engine) {
    
    if (this.isVisible === true) {

        var context = engine.context;

        var rowSpace = Math.floor(this.height / this.rows);
        var columnSpace = Math.floor(this.width / this.columns);
        
        // Draw background
        context.fillStyle = this.bgColor;
        context.fillRect(this.xOrigin, this.yOrigin, this.width, this.height);

		context.beginPath();
		// Draw grid lines
		context.lineWidth = this.lineWidth;
		
        // Draw horizontal lines
        for (var x = this.xOrigin + 0.0; x < this.xOrigin + this.width; x += columnSpace) {
			
			if (this.style === 'line') {
				context.moveTo(x, this.yOrigin);
				context.lineTo(x, this.yOrigin + this.height);
			}
			else if (this.style === 'dashed') {
				context.dashedLine(x, this.yOrigin, x, this.yOrigin + this.height, this.dashArray);
			}
		}
		// Draw vertical lines
		for (var y = this.yOrigin + 0.0; y < this.yOrigin + this.height; y += rowSpace) {

            if (this.style === 'line') {
                context.moveTo(this.xOrigin, y);
                context.lineTo(this.xOrigin + this.width, y);
            }
            else if (this.style === 'dashed') {
                context.dashedLine(this.xOrigin, y, this.xOrigin + this.width, y, this.dashArray);
            }
		}

		context.strokeStyle = this.lineColor;
		context.stroke();
		context.closePath();
    }
    
};