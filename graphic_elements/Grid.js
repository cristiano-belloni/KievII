function Grid(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(Grid, Element);

Grid.prototype.getready = function (args) {

    if (args === undefined) {
        throw new Error("Error: args is undefined!");
    }

    // Call the constructor from the superclass.
    Grid.superclass.getready.call(this, args);
    
    this.setWidth(args.width);
    this.setHeight(args.height);

    // Now that all required properties have been inherited
    // from the parent class, define extra ones from this class
    this.values = {};
    this.defaultSlot = "";

    this.triggered = false;

    this.rows = args.rows || 4;
    this.columns = args.columns || 4;
    this.style = args.style || "dotted";

    if ((this.rows < 0) || (this.columns < 0)) {
        throw new Error("Invalid number of row / columns " + this.rows + ' / ' + this.columns);
    }

};

// This method returns true if the point given belongs to this Grid.
Grid.prototype.isInROI = function (x, y) {
    if ((x >= this.ROILeft) && (y >= this.ROITop)) {
        if ((x <= (this.ROILeft + this.ROIWidth)) && (y <= (this.ROITop + this.ROIHeight))) {
            return true;
        }
        /*jsl:pass*/
    }
    return false;
};

Grid.prototype.onMouseDown = function (x, y) {

    //console.log ("Click down on ", x, y);

    if (this.isInROI(x, y)) {
        this.triggered = true;
    }
    return undefined;
};

Grid.prototype.onMouseUp = function (curr_x, curr_y) {

    var to_set = 0,
        ret = {};

    if (this.triggered) {
        // Grid is activated when cursor is still in the element ROI, otherwise action is void.
        if (this.isInROI(curr_x, curr_y)) {

            // Click on Grid is completed, the Grid is no more triggered.
            this.triggered = false;
            
            return ret;
        }
    }
    
    // Action is void, Grid was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;
    
};

// Setters
Grid.prototype.setValue = function (slot, value) {

	Grid.superclass.setValue.call(this, slot, value);

};

Grid.prototype.refresh = function () {
    if (this.drawClass !== undefined) {
    	debugger;
        // Draw, if our draw class is already set.

        // Call the superclass.
        Grid.superclass.refresh.apply(this, [this.drawClass.drawImage]);

        // Draw, if the element is visible.
        if (this.isVisible === true) {
            
            debugger;
            var context = this.drawClass.drawImage.canvasC;
            
            var rowSpace = Math.floor(this.height / this.rows);
            var columnSpace = Math.floor(this.width / this.columns);
            
            // Draw horizontal lines
            for (var x = this.xOrigin + 0.0; x < this.xOrigin + this.width; x += rowSpace) {
  				context.moveTo(x, this.yOrigin);
  				context.lineTo(x, this.yOrigin + this.height);
			}
 			// Draw vertical lines
			for (var y = this.yOrigin + 0.0; y < this.yOrigin + this.height; y += columnSpace) {
	  			context.moveTo(this.xOrigin, y);
	  			context.lineTo(this.xOrigin + this.width, y);
			}
			
			context.strokeStyle = "#eee";
			context.stroke();
        }
    }
};

Grid.prototype.setGraphicWrapper = function (wrapper) {

    // Call the superclass.
    Grid.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions
    this.drawClass = wrapper.initObject ([{objName: "drawImage",
                                           objParms: this.objParms}]);

};