function Curve(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(Curve, Element);

Curve.prototype.getready = function (args) {

    // Call the constructor from the superclass.
    Curve.superclass.getready.call(this, args);

    this.values = {	"points" : []};
    this.defaultSlot = "points";
    
    this.setWidth(args.width);
    this.setHeight(args.height);
    this.curveType = args.curveType || "bezier";
    this.handleSize = args.handleSize || 10;
    this.thickness = args.thickness || 2;
    this.curveColor = args.curveColor || "black";
    this.helperColor = args.helperColor || '#CCCCCC';
    this.handleColor = args.handleColor || "red";
    this.curveLabels = (typeof args.curveLabels === 'boolean') ? args.curveLabels : false;
    
    //internals
    this.handleClicked = null;
    this.supportPoints = [];
    
    
    // check for correct number of arguments
    // TODO this will evolve with various types of curves
    
    if(args.points.length % 2 != 0 || args.points.length < 4) {
        throw "Incorrect number of points " + arguments.length;
    }
                
    //simple console dump
    if(console){
        console.info(args.points);
    }
                
    //transform initial arguments into an {Array} of [x,y] coordinates
    var initialPoints = [];
    for(var i=0; i < args.points.length; i=i+2){
        initialPoints.push([args.points[i], args.points[i+1]]);
    }
    
    this.values.points = initialPoints;

};

// This methods returns true if the point given belongs to this element.
Curve.prototype.isInROI = function (x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {            
            return true;
        }
    }
    return false;
};

Curve.prototype.dragstart = Curve.prototype.mousedown = function (x, y) {

    var points = this.values.points;

    if (this.isInROI(x, y)) { 
	    for (var i = 0; i < points.length; i+=1) {
	    	if ((x > (points[i][0] - this.handleSize)) && (x < (points[i][0] + this.handleSize))) {
	    		if ((y > (points[i][1] - this.handleSize)) && (y < (points[i][1] + this.handleSize))) {
	    			// We clicked on an handle!
	    			console.log ("Clicked on handle " + i);
	    			this.handleClicked = i;
	    		} 
	    	}
	    }
    }
    return undefined;
};

Curve.prototype.drag = Curve.prototype.mousemove = function (curr_x, curr_y) {

    var to_set = 0,
        ret = {};

    if (this.handleClicked !== null) {
        // Button is activated when cursor is still in the element ROI, otherwise action is void.
        if (this.isInROI(curr_x, curr_y)) {
            // Click on button is completed, the button is no more triggered.
            this.triggered = false;
            // Copy the array before modifying it
            // TODO this is a shallow copy
            var points = this.values.points.slice();
            points[this.handleClicked][0] = curr_x;
            points[this.handleClicked][1] = curr_y;
            ret = {"slot" : "knobvalue", "value" : points};
            return ret;
        }
        else {
        	// Out of ROI, end this here
        	// Copy the array before modifying it
        	// TODO this is a shallow copy
            var points = this.values.points.slice();
            // Calculate where to stop
            points[this.handleClicked][0] = (curr_x < this.ROILeft + this.ROIWidth) ? curr_x : (this.ROILeft + this.ROIWidth);
            points[this.handleClicked][0] = (curr_x > this.ROILeft) ? curr_x : this.ROILeft;
            points[this.handleClicked][1] = (curr_y < this.ROITop + this.ROIHeight) ? curr_y : (this.ROITop + this.ROIHeight);
            points[this.handleClicked][1] = (curr_y < this.ROITop) ? curr_y : this.ROITop;
            // Stop the drag action
        	this.handleClicked = null;
        	
        }
    }
    
    // Action is void, button was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;
    
};

Curve.prototype.dragend = Curve.prototype.mouseup = function (x, y) {
	this.handleClicked = null;
}

Curve.prototype.setValue = function (slot, value) {
	
	console.log ("Setting " + slot + " to " + value);

};

Curve.prototype.refresh = function () {
    if (this.drawClass !== undefined) {
		       
        // Call the superclass.
        Curve.superclass.refresh.call(this, this.drawClass.drawDummy);
        
        var context = this.drawClass.drawDummy.canvasC;
		
        if (this.isVisible === true) {
        	var initialPoints = this.values.points;
        	var parameters = {
        		thickness: this.thickness,
     			curveColor: this.curveColor,
     			helperColor: this.helperColor,
     			handleColor: this.handleColor,
     			handleSize: this.handleSize,
     			curveLabels: this.curveLabels
        	}
			this.bezier (context, initialPoints, parameters);
        }
    }
};

Curve.prototype.getPoint = function (index) {
	return this.supportPoints[index];
};

Curve.prototype.getnumPoints = function () {
	return this.supportPoints.length;
};

//Non-interface functions
//N grade bezier curve, adapted from http://html5tutorial.com/how-to-draw-n-grade-bezier-curve-with-canvas-api/ 
Curve.prototype.bezier = function (context, initialPoints, parameters) {
    
    // if set to true it will also paint debug information along with curve
    var debug = true;         
                 
    function distance(a, b){
        return Math.sqrt(Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2));
    }            
                
    /**Computes the drawing/support points for the Bezier curve*/
    function computeSupportPoints(points){

        /**Computes factorial*/
        function fact(k){
            if(k==0 || k==1){
                return 1;
            }
            else{
                return k * fact(k-1);
            }
        }

        /**Computes Bernstain
        *@param {Integer} i - the i-th index
        *@param {Integer} n - the total number of points
        *@param {Number} t - the value of parameter t , between 0 and 1
        **/
        function B(i,n,t){
            //if(n < i) throw "Wrong";
            return fact(n) / (fact(i) * fact(n-i))* Math.pow(t, i) * Math.pow(1-t, n-i);
        }                            


        /**Computes a point's coordinates for a value of t
        *@param {Number} t - a value between o and 1
        *@param {Array} points - an {Array} of [x,y] coodinates. The initial points
        **/
        function P(t, points){
            var r = [0,0];
            var n = points.length-1;
            for(var i=0; i <= n; i++){
                r[0] += points[i][0] * B(i, n, t);
                r[1] += points[i][1] * B(i, n, t);
            }                
            return r;
        }

                    
        /**Compute the incremental step*/
        var tLength = 0;
        for(var i=0; i< points.length-1; i++){
            tLength += distance(points[i], points[i+1]);
        }
        var step = 1 / tLength;

        //compute the support points
        var temp = [];
        for(var t=0;t<=1; t=t+step){
            var p = P(t, points);
            temp.push(p);
        }
        return temp;
    }
                
    // Stroked rectangle dot
    function paintPoint(ctx, color, size, point){
        
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.round(size / 5);
        ctx.strokeRect(point[0] - Math.round(size / 2) , point[1] - Math.round (size / 2), size, size);                
        ctx.restore();
    }
            
            
    /**Paint the support points*/
    function paintPoints(ctx, points, parameters){
        ctx.save();
                
        //paint lines           
        ctx.strokeStyle = parameters.helperColor;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for(var i=1;i<points.length; i++){
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.stroke();
                
                
        //control points
        for(var i=0;i<points.length; i++){
            paintPoint(ctx, parameters.handleColor, parameters.handleSize, points[i]);
            if (parameters.curveLabels) {
            	ctx.fillText("P" + i + " [" + points[i][0] + ',' + points[i][1] + ']', points[i][0], points[i][1] - 10);
            }
        }
                
                
        ctx.restore();
    }
                    
                    
                
    /**Generic paint curve method*/
    function paintCurve(ctx, points, thickness, color){
        ctx.save();
		ctx.lineWidth = thickness;
		context.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for(var i=1;i<points.length; i++){
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.stroke();
        ctx.restore();
    }

	// They are memorized, but they are stepped.     			                
    this.supportPoints = computeSupportPoints(initialPoints);
    paintCurve(context, this.supportPoints, parameters.thickness, parameters.curveColor);
    if(debug){
        paintPoints(context, initialPoints, parameters /*.helperColor, parameters.handleColor, parameters.handleSize, parameters.curveLabels*/);
    }
}

Curve.prototype.setGraphicWrapper = function (wrapper) {

    // Call the superclass.
    Curve.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions TODO dummy here
    this.drawClass = wrapper.initObject ([{objName: "drawDummy"}]);
                                   
};