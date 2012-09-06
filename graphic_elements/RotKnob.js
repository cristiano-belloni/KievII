K2.RotKnob = function (args) {
    if (arguments.length) {
        this.getready(args);
    }
};

// TODO should it extend Knob? Or maybe we should make a GenericKnob class?
K2.extend(K2.RotKnob, K2.UIElement);

K2.RotKnob.prototype.getready = function(args) {

    if (typeof args === 'undefined') {
        throw ('RotKnob constructor: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.RotKnob.superclass.getready.call(this, args);

    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class

    //Default value is 0
    this.values = {'knobvalue' : 0,
                   'realknobvalue' : 0};

    this.defaultSlot = 'knobvalue';

    // Init angular value. Describes the orientation of the rotary part image,
    // relative to the angular 0 point.
    if (args.initAngValue === undefined) {
        this.initAngValue = 0;
    }
    else {
        this.initAngValue = args.initAngValue;
    }

    // Defines the rotation direction in relation to the movement type.
    if (args.moveDirection == 'anticlockwise') {
        this.moveDirection = -1;
    }
    else {
        // Default, clockwise.
        this.moveDirection = 1;
    }

    // Start angular value. Defines the start point of the knob.
    this.startAngValue = args.startAngValue || 0;

    // Stop angular value. Defines the stop point of the knob.
    this.stopAngValue = args.stopAngValue || 360;

    // Steps. Defines the number of discrete steps of the knob. Infinite if
    // left undefined.
    this.angSteps = args.angSteps;

    var sens = args.sensitivity || 2000;
    // Scale sensivity according to the knob angle.
    this.sensitivity = Math.round((sens / 360) * (Math.abs(this.stopAngValue - this.startAngValue)));


    this.image = args.image;

    this.setWidth(this.image.width);
    this.setHeight(this.image.height);
    
    this.start_x = null;
    this.start_y = null;
};


// This method returns a rotating amount given the RotKnob value.
K2.RotKnob.prototype.getRotateAmount = function() {
    if ((this.values.knobvalue < 0) || (this.values.knobvalue > 1)) {
        // Do nothing
        return undefined;
    }

    // value in degrees.
    var angularValue = this.values.knobvalue * 360;
    //console.log ("angularValue: ", angularValue);

    // Linear interpolation between startAngValue and stopAngValue
    var rangedAngularValue = 360 - (angularValue * (this.startAngValue - this.stopAngValue) / 360 + this.stopAngValue) % 360;
    //console.log ("rangedAngularValue: ", rangedAngularValue);

    // Add the angular offset, if any.
    var offsetAngularValue = (360 - this.initAngValue + rangedAngularValue) % 360;

    // Convert to radians
    var ret = offsetAngularValue * Math.PI / 180;
    return ret;
};

// This method returns true if the point given belongs to this RotKnob.
K2.RotKnob.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

K2.RotKnob.prototype.dragstart = K2.RotKnob.prototype.mousedown = function(x, y) {

    var inROI = this.isInROI(x, y);
    // Save the starting point if event happened in our ROI.
    if (inROI) {
        this.start_x = x;
        this.start_y = y;
    }

    // No value has been changed.
    return undefined;
};

K2.RotKnob.prototype.dragend = K2.RotKnob.prototype.mouseup = function(x, y) {

    // Reset the starting point.
    this.start_x = null;
    this.start_y = null;

    // No value has been changed
    return undefined;

};

K2.RotKnob.prototype.drag = K2.RotKnob.prototype.mousemove = function(curr_x, curr_y) {

    if ((this.start_x !== null) && (this.start_y !== null)) {

        // This means that the mouse is currently down.
        var deltaY = 0,
            temp_value,
            to_set,
            ret;

        deltaY = curr_y - this.start_y;

        temp_value = this.values.realknobvalue;

        to_set = temp_value - ((deltaY / this.sensitivity) * this.moveDirection);

        if (to_set > 1) {
            to_set = 1;
        }
        if (to_set < 0) {
            to_set = 0;
        }

        ret = {'slot' : 'knobvalue', 'value' : to_set};

        return ret;
    }

    // The mouse is currently up; ignore the event notify.
    return undefined;

};

// Setters
K2.RotKnob.prototype.setValue = function(slot, value) {
    var stepped_new_value;

    if ((value < 0) || (value > 1)) {
        //Just do nothing.
        //console.log("RotKnob.prototype.setValue: VALUE INCORRECT!!");
        return;
    }

    if (this.values[slot] === undefined) {
        throw new Error('Slot ' + slot + ' not present or value undefined');
    }

    if ((value === this.values[slot]) || (value === this.values['real' + slot])) {
        // Nothing to do.
        return;
    }

    this.values['real' + slot] = value;

    if ((this.angSteps) !== undefined) {

        var single_step = 1 / this.angSteps;
        stepped_new_value = Math.floor(value / single_step) * single_step;

        // No change in step -> no change in state or representation. Return.
        if (stepped_new_value === this.values[slot]) {
            return;
        }
    }

    else {
        stepped_new_value = value;
    }

    console.log('Value is: ', stepped_new_value);

    // Now, we call the superclass
    K2.RotKnob.superclass.setValue.call(this, slot, stepped_new_value);

};

K2.RotKnob.prototype.refresh_CANVAS2D = function(engine) {

    // Draw if visible.
    if (this.isVisible === true) {
        var rot = this.getRotateAmount();
        K2.CanvasUtils.drawRotate(engine.context, {image: this.image, x: this.xOrigin, y: this.yOrigin, rot: rot});
    }
    
};