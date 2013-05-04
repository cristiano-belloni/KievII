K2.Slider = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Slider, K2.UIElement);

K2.Slider.prototype.getready = function(args) {

    if (typeof args === 'undefined') {
        throw ('Slider error: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Slider.superclass.getready.call(this, args);

    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class

    // Default value is 0
    this.values = {'slidervalue' : 0};
    this.defaultSlot = 'slidervalue';

    this.width = 0;
    this.height = 0;

    this.sliderImage = args.sliderImg;
    this.knobImage = args.knobImg;
    this.type = args.type;

    if ((this.type !== 'horizontal') && (this.type !== 'vertical')) {
        // Default
        this.type = 'vertical';
    }

    this.calculateDimensions();

};


// This method returns an x position given the Slider value.
K2.Slider.prototype.getKnobPosition = function() {
    var ret;

    if ((this.values.slidervalue < 0) || (this.values.slidervalue > 1)) {
        // Do nothing
        return undefined;
    }
    // We must take in account the half-knob thing, here.
    switch (this.type) {

      case 'horizontal':
          ret = Math.round(this.values.slidervalue * this.width + this.zeroLimit);
      break;

      case 'vertical':
          ret = Math.round(this.values.slidervalue * this.height + this.zeroLimit);
      break;

      default:
          throw new Error('Error: Slider orientation is undefined!');
      }

    return ret;
};

// This method returns true if the point given belongs to this Slider.
K2.Slider.prototype.isInROI = function(x, y) {
    switch (this.type) {
        case 'horizontal':
            if ((x > this.getKnobPosition()) && (y > this.ROITop)) {
                if ((x < (this.getKnobPosition() + this.kWidth)) && (y < (this.ROITop + this.kHeight))) {
                    return true;
                }
            }
        break;

        case 'vertical':
            if ((y > this.getKnobPosition()) && (x > this.ROILeft)) {
                if ((y < (this.getKnobPosition() + this.kHeight)) && (x < (this.ROILeft + this.kWidth))) {
                    return true;
                }
            }
        break;

        default:
          throw new Error('Error: Slider orientation is undefined!');
      }

    // Slider is in ROI if and only if we drag the knob.
    return false;
};

K2.Slider.prototype.touch = function(x, y) {
    if (this.isInROI(x, y)) {
        this.triggered = true;
        // This remembers the difference between the current knob start and
        // the point where we started dragging.
        switch (this.type) {

            case 'horizontal':
                this.drag_offset = x - this.getKnobPosition();
            break;

            case 'vertical':
                this.drag_offset = y - this.getKnobPosition();
            break;

            default:
              throw new Error('Error: Slider orientation is undefined!');
          }
    }
    return undefined;
};

K2.Slider.prototype.release = function(x, y) {
    this.triggered = false;
    this.drag_offset = undefined;
    return undefined;
};

K2.Slider.prototype.drag = function(curr_x, curr_y) {

        if (this.triggered === true) {
            var to_set,
                ret;

            // We must compensate for the point where we started to drag if
            // we want a seamless drag animation.
            switch (this.type) {
                case 'horizontal':
                    to_set = (curr_x - this.zeroLimit - this.drag_offset) / (this.width);
                break;

                case 'vertical':
                    to_set = (curr_y - this.zeroLimit - this.drag_offset) / (this.height);
                break;

                default:
                  throw new Error('Error: Slider orientation is undefined!');
              }

            if (to_set > 1) {
                to_set = 1;
            }
            if (to_set < 0) {
                to_set = 0;
            }

            ret = {'slot' : 'slidervalue', 'value' : to_set};

            return ret;
        }

        return undefined;
    };

// Setters
K2.Slider.prototype.setValue = function(slot, value) {

    if ((value < 0) || (value > 1)) {
        // Can happen if the user drags too much.
        return;
    }

    // Now, we call the superclass
    K2.Slider.superclass.setValue.call(this, slot, value);

};

K2.Slider.prototype.refresh_CANVAS2D = function(engine) {

    if (this.isVisible === true) {
        
        engine.context.drawImage (this.sliderImage, this.xOrigin, this.yOrigin);
    
        switch (this.type) {
            case 'horizontal':
                engine.context.drawImage (this.knobImage, this.getKnobPosition(), this.yOrigin);
            break;
    
            case 'vertical':
                engine.context.drawImage (this.knobImage, this.xOrigin, this.getKnobPosition());
            break;
    
            default:
              throw new Error('Error: Slider orientation unknown: ', this.type);
        }
    }

    
};

K2.Slider.prototype.calculateDimensions = function() {

    // The length of the slider knob.
    this.kWidth = this.knobImage.width;
    this.kHeight = this.knobImage.height;

    //TODO Maybe we should override this function, to set the ROI to the fader.
    this.setWidth(this.sliderImage.width);
    this.setHeight(this.sliderImage.height);

    // The fader can stick out by an half of its length at the two extremes of the
    // slider. Let's store some useful variables.
        switch (this.type) {
        case 'horizontal':
            this.totalStride = this.width + this.kWidth;
            this.additionalEndSpace = Math.round(this.kWidth / 2);
            this.zeroLimit = this.xOrigin - this.additionalEndSpace;
            this.oneLimit = this.xOrigin + this.width + this.additionalEndSpace;
        break;

        case 'vertical':
            this.totalStride = this.height + this.kHeight;
            this.additionalEndSpace = Math.round(this.kHeight / 2);
            this.zeroLimit = this.yOrigin - this.additionalEndSpace;
            this.oneLimit = this.yOrigin + this.height + this.additionalEndSpace;
        break;

        default:
          throw new Error('Error: Slider orientation is undefined!');
      }

};

K2.Slider.prototype.setGraphicWrapper = function(wrapper) {

    // Call the superclass.
    K2.Slider.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions
    this.drawClass = wrapper.initObject([{objName: 'drawImage',
                                           objParms: this.objParms}]);

};
