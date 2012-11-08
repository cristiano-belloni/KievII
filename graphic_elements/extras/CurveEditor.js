var CurveEditor = function(parameters) {
    
    this.setVisible = function (value) {
        
        for (var i = 0; i < this.status.curveArray.length; i += 1) {
            this.ui.setVisible(this.status.curveArray[i], value);
        }
        
    };
    
    this.setzIndex = function (value) {
        
        this.Z_OFFSET = value;
        this.reorganizeElements();
        
        this.ui.refresh();
        
    };
    
    this.setTransparency = function (value) {
        
        for (var i = 0; i < this.status.curveArray.length; i += 1) {
            var element = this.ui.getElement (this.status.curveArray[i]);
            element.transparency = value;
        }
        this.ui.refresh();
    };
    
    this.setListening = function (value) {
        for (var i = 0; i < this.status.curveArray.length; i += 1) {
            this.ui.setListening (this.status.curveArray[i], value);
        }
    };
    
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
        for (var i = 0; i < this.status.curveArray.length; i += 1) {
            this.ui.setZIndex(this.status.curveArray[i], i + this.Z_OFFSET);
            // If it's not the last curve, connect the next curve to this one
            if (i < this.status.curveArray.length - 1) {
                this.ui.connectSlots(this.status.curveArray[i + 1], 'points', this.status.curveArray[i], 'points', {
                    'callback' : filter_func, 'cascade': false
                });
            }
        }
        
        if (this.xMonotone) {
            // If xMonotone, set the elements' ROI
            for (i = 0; i < this.status.curveArray.length - 1; i += 1) {
                // The current element: ROI width 'til the next element starts
                var currElement = this.ui.getElement(this.status.curveArray[i]);
                var nextElement = this.ui.getElement(this.status.curveArray[i+1]);
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
                for (var i = 0; i < that.status.curveArray.length; i += 1) {
                    if (that.status.curveArray[i] === element) {
                        that.ui.setProp(element, 'curveColor', that.selectedCurveColor);
                        that.status.selected = i;
                    } else {
                        that.ui.setProp(that.status.curveArray[i], 'curveColor', that.curveArgsTemplate.curveColor);
                    }
                }
            }
            if (slot === 'held') {
                /* TODO maybe a context menu or something */
            }
            if (slot === 'doubletap_c') {
                /* Set the last point of the selected curve to x,y, then create another curve
                * and set its initial point to x,y, then its final point to the initial point of the next
                * curve. Then insert the new curve in the right point of the array with splice() */

                // PLEASE KEEP IN MIND that getProp does return a reference and not an hard copy! Be careful changing these values!
                var currentPoints = (that.ui.getProp(element, 'values')).points;

                // Get a deep copy of the template object
                var newCurveArgs = K2.GenericUtils.clone(that.curveArgsTemplate);

                // Linear by default (for now?)
                newCurveArgs.curveType = "linear";
                newCurveArgs.ID = 'curve' + that.status.nextNumber++;

                if (that.status.selected < that.status.curveArray.length - 1) {
                    newCurveArgs.paintTerminalPoints = 'first';
                    // The selected curve ends at the double-click value
                    currentPoints[currentPoints.length - 1] = value;
                    // Get the next curve
                    var nextID = that.status.curveArray[that.status.selected + 1];
                    var nextPoints = (that.ui.getProp(nextID, 'values')).points;
                    // The new curve starts at the double-click value, ends at the first point of the next curve
                    newCurveArgs.points = [value[0], value[1], nextPoints[0][0], nextPoints[0][1]];
                } else {
                    // Set the former last curve's terminal points draw strategy as 'first'
                    that.ui.setProp(element, 'paintTerminalPoints', 'first');

                    newCurveArgs.paintTerminalPoints = 'all';
                    // Deep copy of the final object
                    var finalPoints = K2.GenericUtils.clone(currentPoints[currentPoints.length - 1]);
                    // The former last curve ends at the double-click value
                    currentPoints[currentPoints.length - 1] = value;
                    // The new last curve starts at the double-click value, ends at the former last points
                    newCurveArgs.points = [value[0], value[1], finalPoints[0], finalPoints[1]];
                }

                var curveElement = new K2.Curve(newCurveArgs);
                that.ui.addElement(curveElement);

                that.status.curveArray.splice(that.status.selected + 1, 0, newCurveArgs.ID);
            }
            console.log("Reorganizing elements");
            that.reorganizeElements();
            that.ui.refresh();
        };
    };

    this.clearCurve = function() {
        for (var i = 0; i < this.status.curveArray.length; i += 1) {
            // Remove the element from the UI
            this.ui.removeElement(this.status.curveArray[i]);
        }
        // Remove the element from the array
        this.status.curveArray = [];
        this.status.selected = null;
        this.ui.refresh();
    };

    this.addCurve = function(curveType, grade, first_point, last_point) {
        console.log("Adding a curve");
        var lastElementID;

        // Get a deep copy of the template object
        // var newCurveArgs = JSON.parse(JSON.stringify(this.curveArgsTemplate));
        var newCurveArgs = K2.GenericUtils.clone(this.curveArgsTemplate);

        newCurveArgs.ID = 'curve' + this.status.nextNumber++;

        var bezierN = grade;

        var firstPoint, lastPoint, midPoints = [];

        newCurveArgs.paintTerminalPoints = 'all';
        // Calculate terminal points type and first, last point
        if (typeof first_point !== 'undefined') {
			firstPoint = first_point;
        }
        
        else {
	        if (this.status.curveArray.length === 0) {
	            // Lower left
	            firstPoint = [0, this.height];
	        } else {
	            // Appending: calculate the terminal point
	            lastElementID = this.status.curveArray[this.status.curveArray.length - 1];
	            //Get the values from the element
	            var coordinates = (this.ui.getProp(lastElementID, 'values')).points;
	            firstPoint = [coordinates[coordinates.length - 1][0], coordinates[coordinates.length - 1][1]];
	            // Set the curve to paint only its first handle
	            this.ui.setProp(lastElementID, 'paintTerminalPoints', 'first');
	        }
	    }

        var xInc = Math.round(this.width / 8);
        var yInc = -Math.round(this.height / 8);

		if (typeof last_point !== 'undefined') {
				lastPoint = last_point; 
			}
			
		else {	
	        // Calculate the next "landing" point
	        lastPoint = [firstPoint[0] + xInc, firstPoint[1] + yInc];
	
	        if (lastPoint[0] > this.width) {
	            lastPoint[0] = this.width;
	        }
	        if (lastPoint[1] < 0) {
	            lastPoint[1] = 0;
	        }
	
	        if ((lastPoint[0] === this.lastCalculatedPoint[0]) && (lastPoint[1] === this.lastCalculatedPoint[1])) {
	            // Set the curve to paint only its first handle
	            console.log("Remove something before adding stuff");
	            // Undo the previous paintTerminalPoints inference
	            this.ui.setProp(lastElementID, 'paintTerminalPoints', 'all');
	            return;
	        }
       }

        this.lastCalculatedPoint[0] = lastPoint[0];
        this.lastCalculatedPoint[1] = lastPoint[1];

        switch (curveType) {
            case 'linear':
            case 'smooth':
            case 'halfcosine':
                // Two point curve
                newCurveArgs.points = firstPoint.concat(lastPoint);
                break;
            case 'bezier':
                var midPoint = firstPoint.slice();
                for (var i = 1; i < bezierN; i += 1) {
                    // TODO remove the magic numbers
                    midPoint[0] += 20;
                    midPoint[1] -= 20;
                    midPoints = midPoints.concat(midPoint);
                }
                newCurveArgs.points = firstPoint.concat(midPoints, lastPoint);
        }

        newCurveArgs.curveType = curveType;

        var curveElement = new K2.Curve(newCurveArgs);
        this.ui.addElement(curveElement);
        this.status.curveArray.push(newCurveArgs.ID);
        this.reorganizeElements();
        this.ui.refresh();
    };

    this.removeCurve = function() {
        var prevID;
        
        if (this.status.selected !== null) {
            console.log("Deleting selected curve " + this.status.selected);

            //arr = arr.filter(function(){return true});

            // Change the (selected + 1) array initial point
            if ((this.status.selected !== 0) && (this.status.selected < this.status.curveArray.length - 1)) {
                var nextID = this.status.curveArray[this.status.selected + 1];
                prevID = this.status.curveArray[this.status.selected - 1];

                var nextValues = this.ui.getProp(nextID, 'values');
                var prevValues = this.ui.getProp(prevID, 'values');

                // PLEASE KEEP IN MIND that getProp does return a reference and not an hard copy! Be careful changing these values!
                // TODO maybe they should be cloned inside the UI (r/o copy)
                var newValues = K2.GenericUtils.clone(nextValues);
                newValues.points[0][0] = prevValues.points[prevValues.points.length - 1][0];
                newValues.points[0][1] = prevValues.points[prevValues.points.length - 1][1];

                this.ui.setProp(nextID, 'values', newValues);

            }

            if ((this.status.selected === this.status.curveArray.length - 1) && (this.status.selected !== 0)) {
                // Paint the final point in the previous curve
                prevID = this.status.curveArray[this.status.selected - 1];
                this.ui.setProp(prevID, 'paintTerminalPoints', 'all');
            }

            // Remove the element from the UI
            this.ui.removeElement(this.status.curveArray[this.status.selected]);

            // Remove the element from the array
            this.status.curveArray.splice(this.status.selected, 1);

            this.status.selected = null;

            this.reorganizeElements();
            this.ui.refresh();
        }
    };

    this.modifyCurve = function(curveType, grade) {
        var i;
        if (this.status.selected !== null) {

            console.log("Transforming selected curve " + this.status.selected);

            var bezierN = grade;

            var curveNow = this.ui.getProp(this.status.curveArray[this.status.selected], 'curveType');
            var curveValues = K2.GenericUtils.clone(this.ui.getProp(this.status.curveArray[this.status.selected], 'values'));
            var curvePoints = curveValues.points;
            var curveGrade = curvePoints.length - 1;

            if (curveNow === curveType) {
                if (curveType !== 'bezier') {
                    console.log("Identical type, doing nothing");
                    return;
                } else {
                    if (bezierN === curveGrade) {
                        console.log("Identical type and grade, doing nothing");
                        return;
                    }
                }
            }

            // We really have to change the curve
            // Take the first points
            var startPoint = curvePoints[0];
            var midPoints = [];
            var midPoint = [startPoint[0], startPoint[1]];
            // Calculate the midpoints, optionally
            if (curveType === 'bezier') {
                for (i = 1; i < bezierN; i += 1) {
                    // TODO remove the magic numbers
                    midPoint[0] += 20;
                    midPoint[1] -= 20;
                    midPoints = midPoints.concat(midPoint);
                }
            }
            var endPoint = curvePoints[curvePoints.length - 1];
            var newPoints = startPoint.concat(midPoints, endPoint);

            //transform initial arguments into an {Array} of [x,y] coordinates
            var newPointsCoordArray = [];
            for (i = 0; i < newPoints.length; i = i + 2) {
                newPointsCoordArray.push([newPoints[i], newPoints[i + 1]]);
            }

            // set curveType and new points
            curveValues.points = newPointsCoordArray;
            this.ui.setProp(this.status.curveArray[this.status.selected], 'curveType', curveType);
            this.ui.setProp(this.status.curveArray[this.status.selected], 'values', curveValues);

            this.reorganizeElements();
            this.ui.refresh();
        }
    };

    this.ui = parameters.ui;
    this.plugin_canvas = parameters.canvas;

    this.status = {
        curveArray : [],
        selected : null,
        nextNumber : 0
    };

    this.Z_OFFSET = parameters.zOffset || 0;

    this.width = parameters.width || parameters.canvas.width;
    this.height = parameters.height || parameters.canvas.height;

    this.lastCalculatedPoint = [];
    
    this.selectedCurveColor = parameters.selectedCurveColor || 'red';
    this.externalCallback = parameters.callback;
    
    this.xMonotone = parameters.xMonotone;

    //curve template
    this.curveArgsTemplate = {
        ID : '',
        top : 0,
        left : 0,
        width : this.width,
        height : this.height,
        thickness : parameters.thickness || 5,
        curveColor : parameters.curveColor || "02B51F",
        handleColor : parameters.handleColor || "A81B32",
        helperColor : parameters.helperColor || "gray",
        curveLabels : parameters.curveLabels || true,
        midPointSize : parameters.midPointSize || 8,
        terminalPointSize : parameters.terminalPointSize || 15,
        terminalPointColor : parameters.terminalPointColor || 'black',
        terminalPointFill : parameters.terminalPointFill || '015C10',
        midPointFill : parameters.midPointFill || 'E6965A',
        isListening : parameters.isListening || true,
        transparency : parameters.transparency || 0.8,
        xMonotone: parameters.xMonotone,
        onValueSet : this.callback()
    };

};