K2.Curve = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Curve, K2.UIElement);

K2.Curve.prototype.getready = function(args) {

    // Call the constructor from the superclass.
    K2.Curve.superclass.getready.call(this, args);

    this.values = {	'points' : [],
					'selected' : [],
					'held' : [],
					'doubletap_c' : [],
					'doubletap_h' : []};

    this.defaultSlot = 'points';

    this.setWidth(args.width);
    this.setHeight(args.height);
    this.curveType = args.curveType || 'bezier';
    this.thickness = args.thickness || 2;
    this.curveColor = args.curveColor || 'black';
    this.helperColor = args.helperColor || '#CCCCCC';
    this.handleColor = args.handleColor || 'red';
    this.curveLabels = (typeof args.curveLabels === 'boolean') ? args.curveLabels : false;
    this.terminalPointStyle = args.terminalPointStyle || 'rect';
    this.paintTerminalPoints = args.paintTerminalPoints || 'all';
    this.midPointStyle = args.midPointStyle || 'circle';
    this.terminalPointSize = args.terminalPointSize || 16;
    this.midPointSize = args.midPointSize || 8;
    this.terminalPointColor = args.terminalPointColor || this.handleColor;
    this.midPointColor = args.midPointColor || this.handleColor;
    this.terminalPointFill = args.terminalPointFill || null;
    this.midPointFill = args.midPointFill || null;
    this.xMonotone = args.xMonotone || false;
    // handleSize is the tolerance when dragging handles
    this.handleSize = args.handleSize || (this.terminalPointSize > this.midPointSize) ? this.terminalPointSize : this.midPointSize;

    //internals
    this.handleClicked = null;
    this.supportPoints = [];
    this.selectStart = false;
    this.whereHappened = [];
    // Check for correct number of arguments
    switch (args.curveType) {
		case 'bezier':
			if (args.points.length % 2 !== 0 || args.points.length < 4) {
				throw 'Incorrect number of points ' + args.points.length;
			}
		break;
		case 'halfcosine':
		case 'smooth':
		case 'linear':
			if (args.points.length !== 4) {
				throw 'Incorrect number of points ' + args.points.length;
			}
		break;
		/* TODO these aren't working
		case "cubic":
		case "catmull":
		case "hermite" :
			if(args.points.length !== 8) {
				throw "Incorrect number of points " + args.points.length;
			}
		break; */
		default:
			throw 'Unknown curve type ' + args.curveType;
    }

    //transform initial arguments into an {Array} of [x,y] coordinates
    var initialPoints = [];
    for (var i = 0; i < args.points.length; i = i + 2) {
        initialPoints.push([args.points[i], args.points[i + 1]]);
    }

    this.values.points = initialPoints;

};

K2.Curve.prototype.isInCurve = function(x, y) {
	for (var i = 0; i < this.supportPoints.length; i += 1) {
		if ((x > this.supportPoints[i][0] - this.thickness) && (x < this.supportPoints[i][0] + this.thickness)) {
				if ((y > this.supportPoints[i][1] - this.thickness) && (y < this.supportPoints[i][1] + this.thickness)) {
					// Curve selected
					return true;
				}
			}
		}
		return false;
};

K2.Curve.prototype.isInHandle = function(x, y) {
	var points = this.values.points;
	for (var i = 0; i < points.length; i += 1) {
		if ((x > (points[i][0] - this.handleSize)) && (x < (points[i][0] + this.handleSize))) {
			if ((y > (points[i][1] - this.handleSize)) && (y < (points[i][1] + this.handleSize))) {
				// We clicked on a curve handle
				return i;
			}
		}
	}
	return null;
};

// This methods returns true if the point given belongs to this element.
// TODO to reflect the bounding box of the element ?
K2.Curve.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

K2.Curve.prototype.touch = K2.Curve.prototype.dragstart = function(x, y) {

    var points = this.values.points;

    if (this.isInROI(x, y)) {

        var handleNum;
		if ((handleNum = this.isInHandle(x, y)) !== null) {
			// Handle was tapped.
			this.handleClicked = handleNum;
            if ((handleNum === 0) || (handleNum === points.length - 1)) {
                // caught a terminal handle!
                return;
            }
		}
	    // Check if Curve was tapped/clicked
	    // and save a guard (this might be inefficient when t is small and plain wrong when t is big)
	    if (this.isInCurve(x, y)) {
			//Curve is selected
			this.selectStart = true;
			return;
		}
    }
};

K2.Curve.prototype.xMonotoneFunc  = function (points) {
	
	if (points[0][0] > points[points.length-1][0]) {
		
		if (points[0][0] > this.values.points[0][0]) {
			// First point is moving
			points[0][0] = points[points.length-1][0];
		}
		else {
			// Last point is moving
			points[points.length-1][0] = points[0][0];
		}
	}
				
};

K2.Curve.prototype.drag = function(curr_x, curr_y) {

    var ret = {},
        points;

    if (this.handleClicked !== null) {
        // Copy the array before modifying it
        points = K2.GenericUtils.clone (this.values.points);
        
        // Button is activated when cursor is still in the element ROI, otherwise action is void.
        if (this.isInROI(curr_x, curr_y)) {
            // Click on button is completed, the button is no more triggered.
            this.triggered = false;
                        
            points[this.handleClicked][0] = curr_x;
            points[this.handleClicked][1] = curr_y;
                        
        }
        else {
            // Out of ROI
            // Calculate where to stop
            points[this.handleClicked][0] = curr_x;
            points[this.handleClicked][1] = curr_y;
            
            if (curr_x > (this.ROILeft + this.ROIWidth)) {
                points[this.handleClicked][0] = this.ROILeft + this.ROIWidth;
            }
            if (curr_x < this.ROILeft) {
                points[this.handleClicked][0] = this.ROILeft;
            }
            
            if (curr_y > (this.ROITop + this.ROIHeight)) {
                points[this.handleClicked][1] = this.ROITop + this.ROIHeight;
            }
            if (curr_y < this.ROITop) {
                points[this.handleClicked][1] = this.ROITop;
            }

        }
        this.whereHappened = [points[this.handleClicked][0], points[this.handleClicked][1]];
        ret = {'slot' : 'points', 'value' : points};
        return ret;
    }

    // Action is void, button was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;

};

K2.Curve.prototype.dragend = K2.Curve.prototype.swipe = function (x,y) {
    if ((x < 0) && (y < 0)) {
        // This seems to be an Hammer.js bug in mobile. Need to investigate
        return;
    }
    var ret = this.drag (x,y);
    this.handleClicked = null;
    return ret;
};

K2.Curve.prototype.release = function(x, y) {
	this.handleClicked = null;
	// check the selection-end
	// check if the point is "on" the curve plot
	// if the saved guard is true
	// reset the guard and trigger a selected event
	if (this.selectStart === true) {
		if (this.isInCurve(x, y)) {
			//Curve is selected
			this.selectStart = false;
            console.log ("selected curve!", this);

            return {'slot': 'selected', 'value': [x, y]};
			}
	}
};

K2.Curve.prototype.hold = function(x, y) {
	if (this.isInROI(x, y)) {
		if (this.isInCurve(x, y)) {
			//Curve is held
		    var ret = {'slot' : 'held', 'value' : [x, y]};
		    return ret;
	   }
	}
    return undefined;
};

K2.Curve.prototype.doubletap = function(x, y) {
	if (this.isInROI(x, y)) {

		var handleNum;
		if ((handleNum = this.isInHandle(x, y)) !== null) {
			// Handle is double-tapped. This has precedence
            console.log ("duble tapped handle!", this);
			return {'slot' : 'doubletap_h', 'value' : [[x, y], handleNum]};
		}
		if (this.isInCurve(x, y)) {
			//Curve is double-tapped
            console.log ("duble tapped curve!", this);
			return {'slot' : 'doubletap_c', 'value' : [x, y]};
		}
	}
    return undefined;
};

K2.Curve.prototype.setValue = function(slot, value) {
	var equal = true;
	
	if (slot === 'points') {
		
		var oldValue = this.values[slot];
		for (var i = 0; i < value.length; i += 1) {
			for (var k = 0; k < value.length; k += 1) {
				if (value[i][k] !== oldValue[i][k]) {
					equal = false;
					break;
				}
			}
			if (equal === false) {
				break;
			}
		}
	}
	else {
		equal = false;
	}
	
	if (this.xMonotone) {
	   this.xMonotoneFunc(value);
	   }
	
	if (!equal) {
		// Now, we call the superclass
	    K2.Curve.superclass.setValue.call(this, slot, value);
	  }

};

K2.Curve.prototype.refresh_CANVAS2D = function(engine) {

        if (this.isVisible === true) {
            
            var context = engine.context;

            var parameters = {
                thickness: this.thickness,
                curveColor: this.curveColor,
                helperColor: this.helperColor,
                handleColor: this.handleColor,
                handleSize: this.handleSize,
                curveLabels: this.curveLabels
            };

            this.genericCurve(this.values.points, this.curveType);
            this.paintCurve(context);
            this.paintPoints(context, this.values.points, parameters);
        }
    
};

K2.Curve.prototype.getCurvePoints = function (numPoints) {
        // Returns an array of numPoints x,y coordinates
        
        var step = 1 / numPoints;
        var temp = [];
        for (var t = 0; t <= 1; t = t + step) {
            var p = this[this.curveType].P(t, this.values.points);
            temp.push(p);
        }
        return temp;
};

K2.Curve.prototype.getCurveYPoints = function (numPoints, mulFactor) {
        // Returns an array of numPoints y coordinates     
        
        if (typeof mulFactor === 'undefined') {
            mulFactor = 1;
        }
        
        var step = 1 / numPoints;
        var temp = [];
        for (var t = 0; t <= 1; t = t + step) {
            var p = this[this.curveType].P(t, this.values.points)[1] * mulFactor;
            temp.push(p);
        }
        return temp;
};

K2.Curve.prototype.getPoint = function(index) {
	return this.supportPoints[index];
};

K2.Curve.prototype.getnumPoints = function() {
	return this.supportPoints.length;
};

//Non-interface functions

K2.Curve.prototype.halfcosine = {

	/*
     *Computes a point's coordinates for a value of t
     *@param {Number} t - a value between 0 and 1
     *@param {Array} points - an {Array} of [x,y] coodinates. The initial points
    */

    P: function(t, points) {
        // http://paulbourke.net/miscellaneous/interpolation/
        var mu2 = (1 - Math.cos(t * Math.PI)) / 2;

        var r = [0, 0];
        r[0] = points[0][0] + (points[1][0] - points[0][0]) * t;
        r[1] = (points[0][1] * (1 - mu2) + points[1][1] * mu2);
        return r;
    }
};

K2.Curve.prototype.smooth = {
    P: function(t, points) {
        // http://codeplea.com/simple-interpolation
        var tSmooth = t * t * (3 - 2 * t);

        var r = [0, 0];
        r[0] = points[0][0] + (points[1][0] - points[0][0]) * t;
        r[1] = points[0][1] + tSmooth * (points[1][1] - points[0][1]);

        return r;
    }
};

K2.Curve.prototype.linear = {

    P: function(t, points) {
        var r = [0, 0];
        r[0] = points[0][0] + (points[1][0] - points[0][0]) * t;
        r[1] = points[0][1] * (1 - t) + points[1][1] * t;

        return r;
    }
};


K2.Curve.prototype.cubic = {

    P: function(t, points) {
        var r = [0, 0];

        r[0] = points[0][0] + (points[3][0] - points[0][0]) * t;

        var mu = t;
        var mu2 = t * t;

        var a0 = points[3][1] - points[2][1] - points[0][1] + points[1][1];
        var a1 = points[0][1] - points[1][1] - a0;
        var a2 = points[2][1] - points[0][1];
        var a3 = points[1][1];

        r[1] = (a0 * mu * mu2 + a1 * mu2 + a2 * mu + a3);

        return r;
    }
};

K2.Curve.prototype.catmull = {

    P: function(t, points) {
        var r = [0, 0];

        r[0] = points[0][0] + (points[3][0] - points[0][0]) * t;

        var mu = t;
        var mu2 = t * t;
        var y0 = points[0][1];
        var y1 = points[1][1];
        var y2 = points[2][1];
        var y3 = points[3][1];

        var a0 = -0.5 * y0 + 1.5 * y1 - 1.5 * y2 + 0.5 * y3;
        var a1 = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3;
        var a2 = -0.5 * y0 + 0.5 * y2;
        var a3 = y1;

        r[1] = (a0 * mu * mu2 + a1 * mu2 + a2 * mu + a3);

        return r;
    }
};


/*
   Tension: 1 is high, 0 normal, -1 is low
   Bias: 0 is even,
         positive is towards first segment,
         negative towards the other
*/
K2.Curve.prototype.hermite = {

	  P: function(t, points, tension_, bias_) {

		var r = [0, 0];
		r[0] = points[0][0] + (points[3][0] - points[0][0]) * t;

		var bias = bias_ || 0;
		var tension = tension_ || 0;
		var m0, m1, mu2, mu3;
		var a0, a1, a2, a3;
		var mu = t;

		var y0 = points[0][1];
        var y1 = points[1][1];
        var y2 = points[2][1];
        var y3 = points[3][1];

		mu2 = mu * mu;
		mu3 = mu2 * mu;
		m0 = (y1 - y0) * (1 + bias) * (1 - tension) / 2;
		m0 += (y2 - y1) * (1 - bias) * (1 - tension) / 2;
		m1 = (y2 - y1) * (1 + bias) * (1 - tension) / 2;
		m1 += (y3 - y2) * (1 - bias) * (1 - tension) / 2;
		a0 = 2 * mu3 - 3 * mu2 + 1;
		a1 = mu3 - 2 * mu2 + mu;
		a2 = mu3 - mu2;
		a3 = -2 * mu3 + 3 * mu2;

		r[1] = (a0 * y1 + a1 * m0 + a2 * m1 + a3 * y2);
		return r;
	}
};

//N grade bezier curve, adapted from http://html5tutorial.com/how-to-draw-n-grade-bezier-curve-with-canvas-api/
K2.Curve.prototype.bezier = {

        /**Computes a point's coordinates for a value of t
        *@param {Number} t - a value between o and 1
        *@param {Array} points - an {Array} of [x,y] coodinates. The initial points
        **/
        P: function(t, points) {

            /**Computes factorial iteratively*/
	        var fact = function(k) {
	            var rval = 1;
                for (var i = 2; i <= k; i++)
                    rval = rval * i;
                return rval;
	        };

	        /**Computes Bernstain
	        *@param {Integer} i - the i-th index
	        *@param {Integer} n - the total number of points
	        *@param {Number} t - the value of parameter t , between 0 and 1
	        **/
	        function B(i,n,t) {
	            //if(n < i) throw "Wrong";
	            var fact_funct = fact;
	            if (typeof fact_lookup === 'function') {
                    fact_funct = fact_lookup;
	            }
	            return fact_funct(n) / (fact_funct(i) * fact_funct(n - i)) * Math.pow(t, i) * Math.pow(1 - t, n - i);
	        }

            var r = [0, 0];
            var n = points.length - 1;
            for (var i = 0; i <= n; i++) {
                r[0] += points[i][0] * B(i, n, t);
                r[1] += points[i][1] * B(i, n, t);
            }
            return r;
        }

};

K2.Curve.prototype.genericCurve = function(initialPoints, type) {

    function distance(a, b) {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

    // Compute the incremental step
    function computeIncrementalStep(points) {
	    var tLength = 0;
	    for (var i = 0; i < points.length - 1; i++) {
	        tLength += distance(points[i], points[i + 1]);
	    }
	    var step = 1 / tLength;
	    return step;
	}

	function computeSupportPoints(points, curveObj) {
        //Compute the support points
        var step = computeIncrementalStep(points);
	    var temp = [];
	    for (var t = 0; t <= 1; t = t + step) {
	        var p = curveObj.P(t, points);
	        temp.push(p);
	    }
	    return temp;
	}

    // Memorize the curve (support) points.
    this.supportPoints = computeSupportPoints(initialPoints, this[type]);
};


// Internal paint functions
// TODO PER-ELEMENT ALPHA https://developer.mozilla.org/en/Drawing_Graphics_with_Canvas

K2.Curve.prototype.paintHandle = function(ctx, point, terminal) {
		if (terminal === true) {
			this.paintPoint(ctx, point, this.terminalPointStyle, this.terminalPointFill, this.terminalPointColor, this.terminalPointSize);
		}
		else {
			this.paintPoint(ctx, point, this.midPointStyle, this.midPointFill, this.midPointColor, this.midPointSize);
		}
	};

// Paint an handle point
K2.Curve.prototype.paintPoint = function(ctx, point, style, fill, color, size) {

		if (style === 'rect') {
			// Stroked rectangle
			ctx.save();
			ctx.strokeStyle = color;
			ctx.lineWidth = Math.round(size / 5);
			ctx.strokeRect(point[0] - Math.round(size / 2) , point[1] - Math.round(size / 2), size, size);
			if (fill !== null) {
				ctx.fillStyle = fill;
                ctx.fillRect((point[0] - Math.ceil(size / 2)) + Math.floor(ctx.lineWidth / 2) , (point[1] - Math.ceil(size / 2)) + Math.floor(ctx.lineWidth / 2), size - ctx.lineWidth + 1, size - ctx.lineWidth + 1);
            }
			ctx.restore();
		}
		else if (style === 'circle') {
			// Stroked circle
			ctx.save();
			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.lineWidth = Math.round(size / 5);
			ctx.arc(point[0], point[1], size, 0, 2 * Math.PI, false);
			if (fill !== null) {
				ctx.fillStyle = fill;
                ctx.fill();
            }
			ctx.stroke();
			ctx.restore();
		}
		else if (style === 'none') {
			// noop
		}
		else {
			throw 'Unknown handle style: ' + style;
		}
	};

// Paint the curve support / control points / labels
K2.Curve.prototype.paintPoints = function(ctx, parameters) {

	var points = this.values.points;
	var i;

    ctx.save();
    //paint lines
    ctx.strokeStyle = this.helperColor;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();

    //control points
    for (i = 0; i < points.length; i++) {

        // See if the point being painted is a terminal one
        var terminal = false;
        if ((i === 0) || (i === (points.length - 1))) {
            terminal = true;
        }

        // Paint the handle and labels only according to paintTerminalPoints strategy
        var pTT = this.paintTerminalPoints;
        if (terminal === true) {
			if ((pTT === 'all') || ((pTT === 'first') && (i === 0)) || ((pTT === 'last') && (i === (points.length - 1)))) {
                this.paintHandle(ctx, points[i], terminal);
                // Paint the curve labels
		        if (this.curveLabels) {
                    ctx.fillText(this.ID + ' (' + i + ')' + ' [' + points[i][0] + ',' + points[i][1] + ']', points[i][0], points[i][1] - 10);
		        }
	        }
	    }

	    else {
            // Paint the midpoints
            this.paintHandle(ctx, points[i], terminal);
            // Paint the curve labels
			if (this.curveLabels) {
				ctx.fillText(this.ID + ' (' + i + ')' + ' [' + points[i][0] + ',' + points[i][1] + ']', points[i][0], points[i][1] - 10);
			}
	    }
    ctx.restore();
	}
};

// Generic paint curve method
K2.Curve.prototype.paintCurve = function(ctx) {

	var points = this.supportPoints;
	var thickness = this.thickness;
	var color = this.curveColor;

    ctx.save();
	ctx.lineWidth = thickness;
	ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
    ctx.restore();
};
