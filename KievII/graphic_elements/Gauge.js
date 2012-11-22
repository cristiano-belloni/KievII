K2.Gauge = function(args) {
	if (arguments.length) {
		this.getready(args);
	}
};

K2.extend(K2.Gauge, K2.UIElement);

K2.Gauge.prototype.getready = function(args) {

	if ( typeof args === 'undefined') {
		throw new Error('Error: args is undefined!');
	}

	// Call the constructor from the superclass.
	K2.Gauge.superclass.getready.call(this, args);

	this.values = {
		'gaugevalue' : null,
		'midgaugevalue' : null,
		'selected' : [],
		'held' : [],
		'doubletap' : [],
		'tap' : []
	};

	this.defaultSlot = 'gaugevalue';

	this.prevValue = this.values.gaugevalue;

	this.setWidth(args.width);
	this.setHeight(args.height);

	this.color = args.color || ["#47D147","#70DB70","#99E699"];
	this.bgColor = args.bgColor || "#222";

	this.radius = args.radius || ((this.width < this.height) ? Math.floor(this.width / 2) : Math.floor(this.height / 2));
	this.thickness = args.thickness || ((this.width < this.height) ? Math.floor(this.width / 3) : Math.floor(this.height / 3));

	this.animationInterval = null;

};

// This methods returns true if the point given belongs to this element.
K2.Gauge.prototype.isInROI = function(x, y) {
	return true;
};

K2.Gauge.prototype.calculateAngle = function (x,y) {
	
	var centerX = this.xOrigin + this.width / 2;
	var centerY = this.yOrigin + this.height / 2;
	
	console.log ("Point is: ", x, y, "Center is: ", centerX, centerY);
	
	var radtan = Math.atan2 (x - centerX, y - centerY);
	console.log('radiant atan ', radtan);
	
	var degreetan = radtan * (180 / Math.PI);
	degreetan = 180 - degreetan;
	console.log('degree atan ', degreetan);
	
	var range_val = K2.MathUtils.linearRange(0, 360, 0, 1, Math.floor(degreetan));
	return range_val;
	
};

K2.Gauge.prototype.tap = K2.Gauge.prototype.mousedown = K2.Gauge.prototype.touchstart = function(x, y) {
	
	var dist = K2.MathUtils.distance(x, y, this.xOrigin + this.width / 2, this.yOrigin + this.height / 2);
	console.log("dist is, ", dist, " radius is ", this.radius, " thickness is ", this.thickness);
	
	if ((dist > this.radius - this.thickness / 2) && (dist < this.radius + this.thickness / 2)) {
		
		console.log("down / tapped Inside the dial");
		this.triggered = true;

		var range_val = this.calculateAngle (x,y);
		
		this.prevValue = this.values.gaugevalue;
		var ret = {'slot' : 'gaugevalue', 'value' : range_val};
		
		return ret;
	}

	return undefined;
};

K2.Gauge.prototype.drag = K2.Gauge.prototype.mousemove = function (x, y) {
	
	if (this.triggered) {
		console.log ("triggered mousemove");
		var range_val = this.calculateAngle (x,y);
		//this.prevValue = this.values.gaugevalue;
		var ret = {'slot' : 'gaugevalue', 'value' : range_val};
		return ret;
	}
};

K2.Gauge.prototype.release = K2.Gauge.prototype.dragend = K2.Gauge.prototype.mouseup = function(curr_x, curr_y) {

	if (this.triggered) {
		this.triggered = false;
		this.prevValue = this.values.gaugevalue;
		var ret = {'slot' : 'gaugevalue', 'value' : this.values.gaugevalue};
		return ret;
	}

};

K2.Gauge.prototype.setValue = function(slot, value) {

	// Call the superclass
	K2.Gauge.superclass.setValue.call(this, slot, value);

};

K2.Gauge.prototype.refresh_CANVAS2D = function(engine) {
	// Draw, if the element is visible.
	if (this.isVisible === true) {
		var ctx = engine.context;

		ctx.beginPath();

		// Background arc, 360 degrees
		this.drawGauge(ctx, 1, this.bgColor);

		// Accessory arcs
		if (this.triggered) {
			
			if (this.values.gaugevalue <= this.prevValue) {
				this.drawGauge(ctx, this.prevValue, this.color[2]);
				this.drawGauge(ctx, this.values.gaugevalue, this.color[1]);
			}
			else {
				this.drawGauge(ctx, this.values.gaugevalue, this.color[2]);
				this.drawGauge(ctx, this.prevValue, this.color[1]);
			}
			
		}
		
		else {
			// Foreground (gauge) arc, degrees [0,360] linearly interpolated from gaugevalue [0,1]
			this.drawGauge(ctx, this.values.gaugevalue, this.color[0]);
		}

	}
};

K2.Gauge.prototype.drawGauge = function(ctx, value, color) {

	var degrees, radians;

	degrees = K2.MathUtils.linearRange(0, 1, 0, 360, value);
	radians = degrees * Math.PI / 180;

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = this.thickness;

	if (value === 1) {
		ctx.arc(this.xOrigin + this.width / 2, this.yOrigin + this.height / 2, this.radius, 0, Math.PI * 2, false);
	} else {
		//The arc starts from the rightmost end. If we deduct 90 degrees from the angles
		//the arc will start from the topmost end
		ctx.arc(this.xOrigin + this.width / 2, this.yOrigin + this.height / 2, this.radius, -90 * Math.PI / 180, radians - 90 * Math.PI / 180, false);
	}
	ctx.stroke();
}; 