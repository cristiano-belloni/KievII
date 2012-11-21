var AreaEditor = function(parameters) {

    this.reorganizeElements = function() {
        var filter_func = function(value, connDetails) {
            // last point of the receiver is first point of the sender
            var recvPoints = K2.GenericUtils.clone(connDetails.ui.getProp(connDetails.recv, 'values').points);
            var sendPoints = K2.GenericUtils.clone(connDetails.ui.getProp(connDetails.sender, 'values').points);
            recvPoints[recvPoints.length - 1] = sendPoints[0];
            return recvPoints;
        };
        // Reset the connections
        this.ui.resetSlots();

        // Set the z-Indexes & the connections
        for (var i = 0; i < this.status.areaArray.length; i += 1) {
            this.ui.setZIndex(this.status.areaArray[i], i + this.Z_OFFSET);
            // If it's not the last area, connect the next area to this one
            if (i < this.status.areaArray.length - 1) {
                this.ui.connectSlots(this.status.areaArray[i + 1], 'points', this.status.areaArray[i], 'points', {
                    'callback' : filter_func, 'cascade': false
                });
            }
        }
        
        if (this.xMonotone) {
            // If xMonotone, set the elements' ROI
            for (i = 0; i < this.status.areaArray.length - 1; i += 1) {
                // The current element: ROI width 'til the next element starts
                var currElement = this.ui.getElement(this.status.areaArray[i]);
                var nextElement = this.ui.getElement(this.status.areaArray[i+1]);
                currElement.ROIWidth = nextElement.values.points[0][0] - currElement.ROILeft;
                // The next element: ROI left 'til the current element starts
                nextElement.ROILeft = currElement.values.points[0][0];
            }
        }
    };

    // One callback for all
    this.callback = function() {
        var that = this;
        return function(slot, value, element) {
            console.log("Element: ", element, ". onValueSet callback: slot is ", slot, " and value is ", value, " while that is ", that);
            
            // Call the optional callback
            if (typeof that.externalCallback === 'function') {
				that.externalCallback(slot, value, element);
            }
            
            if (slot === 'selected') {
                // See which element are we selecting
                for (var i = 0; i < that.status.areaArray.length; i += 1) {
                    if (that.status.areaArray[i] === element) {
                        that.ui.setProp(element, 'color', that.selectedAreaColor);
                        that.status.selected = i;
                    } else {
                        that.ui.setProp(that.status.areaArray[i], 'color', that.areaArgsTemplate.color);
                    }
                }
            }
            if (slot === 'held') {
                /* TODO maybe a context menu or something */
            }
            if (slot === 'doubletap') {
                
                // Split the area                
                var currentElement = that.ui.getElement(element);
                var currentxOffset = currentElement.values.xOffset;
                var currentWidth = currentElement.values.width;

                // Get a deep copy of the template object
                var newAreaArgs = K2.GenericUtils.clone(that.areaArgsTemplate);

                newAreaArgs.ID = 'area' + that.status.nextNumber++;
                    
                // new area offset and width
                newAreaArgs.xOffset = value [0];
                newAreaArgs.width = currentWidth - (value [0] - currentxOffset);
                //newAreaArgs.height = that.height - value [1];
                //newAreaArgs.yOffset = currentElement.values.yOffset - (currentElement.values.height - newAreaArgs.height);
                newAreaArgs.height = currentElement.height;
                newAreaArgs.yOffset = currentElement.values.yOffset;
                
                // selected area offset and width
                currentElement.values.width = value [0] - currentxOffset;
                //currentHeight = value [1];

                var areaElement = new K2.Area(newAreaArgs);
                that.ui.addElement(areaElement);
                
                // Insert the element into the status array
                that.status.areaArray.splice(that.status.selected + 1, 0, newAreaArgs.ID);
            }
            //console.log("Reorganizing elements");
            //that.reorganizeElements();
            that.ui.refresh();
        };
    };

    this.clearAreas = function() {
        for (var i = 0; i < this.status.areaArray.length; i += 1) {
            // Remove the element from the UI
            this.ui.removeElement(this.status.areaArray[i]);
        }
        // Remove the element from the array
        this.status.areaArray = [];
        this.status.selected = null;
        this.ui.refresh();
    };

    this.addArea = function(width, height) {
        console.log("Adding an area");
        var lastElement;

        // Get a deep copy of the template object
        var newAreaArgs = K2.GenericUtils.clone(this.areaArgsTemplate);
        
        newAreaArgs.width = width || newAreaArgs.width;
        newAreaArgs.height = height || newAreaArgs.height; 
	
        newAreaArgs.ID = 'area' + this.status.nextNumber++;
        
        // Create the Area element and refresh.
        var areaElement = new K2.Area(newAreaArgs);
        
        if (this.status.areaArray.length !== 0) {
            // Not the first area; calculate x placement
            lastElement = this.ui.getElement(this.status.areaArray[this.status.areaArray.length - 1]);
            // Get xOffset from the previous element
            var prev_xOffset = lastElement.values.xOffset;
            var prev_width = lastElement.values.width;
            areaElement.values.xOffset = prev_xOffset + prev_width;
        }
        
        this.ui.addElement(areaElement);
        this.status.areaArray.push(newAreaArgs.ID);
        //this.reorganizeElements();
        this.ui.refresh();
       
    };

    this.removeArea = function() {
        var prevID;
        
        if (this.status.selected !== null) {
        }
            
    };

    
    this.ui = parameters.ui;
    this.plugin_canvas = parameters.canvas;

    this.status = {
        areaArray : [],
        selected : null,
        nextNumber : 0
    };

    this.Z_OFFSET = parameters.zOffset || 0;

    this.width = parameters.width || parameters.canvas.width;
    this.height = parameters.height || parameters.canvas.height;

    this.lastCalculatedPoint = [];
    
    this.selectedAreaColor = parameters.selectedAreaColor || 'red';
    this.externalCallback = parameters.callback;

    // area template
    this.areaArgsTemplate = {
        ID : '',
        top : Math.floor(this.height / 2),
        left : 0,
        width : parameters.defaultWidth || Math.floor(this.height / 10),
        height : parameters.defaultHeight || Math.floor(this.height / 2),
        thickness : parameters.thickness || 5,
        color : parameters.color || "black",
        borders: parameters.borders || {top: true, bottom: true, right: true, left: true},
        move: parameters.move || 'x',
        dragBorders: {top: true, bottom: false, right: true, left: true},
        xMonotone: true,
        yMonotone: true,
        isListening : parameters.isListening || true,
        transparency : parameters.transparency || 0.8,
        onValueSet : this.callback()
    };

};