// Ok, this Slider is an horizontal one. Must implement the vertical one as well.
function Slider(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(Slider, Element);

Slider.prototype.getready = function (args /*sliderImg, knobImg*/) {

    if (args === undefined) {
        throw new Error("Error: specArgs is undefined!");
    }

    // Call the constructor from the superclass.
    Slider.superclass.getready.call(this, args);

    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class

    // Default value is 0
    this.values = {"slidervalue" : 0};

    //By default, a Slider always draws itself when value is set.
    this.drawItself = args.drawItself || true;

    this.width = 0;
    this.height = 0;

    this.sliderImage = args.sliderImg;
    this.knobImage = args.knobImg;
    this.type = args.type;

    this.calculateDimensions();

    // As soon as we can, we want to save our background.
    this.backgroundSavePending = true;

};


// This method returns an x position given the Slider value.
/*jslint nomen: false*/
Slider.prototype._getKnobPosition = function () {
/*jslint nomen: true*/
    var ret;

    if ((this.values.slidervalue < 0) || (this.values.slidervalue > 1)) {
        // Do nothing
        return undefined;
    }
    // We must take in account the half-knob thing, here.
    switch(this.type) {

      case "horizontal":
          ret = Math.round(this.values.slidervalue * this.width + this.zeroLimit);
      break;

      case "vertical":
          ret = Math.round(this.values.slidervalue * this.height + this.zeroLimit);
      break;

      default:
          throw new Error("Error: Slider orientation is undefined!");
      }

    return ret;
};

// This method returns true if the point given belongs to this Slider.
Slider.prototype.isInROI = function (x, y) {
    switch(this.type) {
        case "horizontal":
            if ((x > this._getKnobPosition()) && (y > this.ROITop)) {
                if ((x < (this._getKnobPosition() + this.kWidth)) && (y < (this.ROITop + this.kHeight))) {
                    return true;
                }
            }
        break;

        case "vertical":
            if ((y > this._getKnobPosition()) && (x > this.ROILeft)) {
                if ((y < (this._getKnobPosition() + this.kHeight)) && (x < (this.ROILeft + this.kWidth))) {
                    return true;
                }
            }
        break;

        default:
          throw new Error("Error: Slider orientation is undefined!");
      }

    // Slider is in ROI if and only if we drag the knob.
    return false;
};

Slider.prototype.onMouseDown = function (x, y) {
    if (this.isInROI(x, y)) {
        this.triggered = true;
        // This remembers the difference between the current knob start and
        // the point where we started dragging.
        switch(this.type) {

            case "horizontal":
                this.drag_offset = x - this._getKnobPosition();
            break;

            case "vertical":
                this.drag_offset = y - this._getKnobPosition();
            break;

            default:
              throw new Error("Error: Slider orientation is undefined!");
          }
    }
    return undefined;
};

Slider.prototype.onMouseUp = function (x, y) {
    this.triggered = false;
    this.drag_offset = undefined;
    return undefined;
};

Slider.prototype.onMouseMove = function (curr_x, curr_y) {

        if (this.triggered === true) {
            var to_set,
                ret;

            // We must compensate for the point where we started to drag if
            // we want a seamless drag animation.
            switch(this.type) {
                case "horizontal":
                    to_set = (curr_x - this.zeroLimit - this.drag_offset) / (this.width);
                break;

                case "vertical":
                    to_set = (curr_y - this.zeroLimit - this.drag_offset) / (this.height);
                break;

                default:
                  throw new Error("Error: Slider orientation is undefined!");
              }

            if (to_set > 1) {
                to_set = 1;
            }
            if (to_set < 0) {
                to_set = 0;
            }

            ret = {"slot" : "slidervalue", "value" : to_set};

            return ret;
        }
        
        return undefined;
    };

// Setters
Slider.prototype.setValue = function (slot, value, fireCallback) {

    if (this.values[slot] === value) {
        // Don't update and refresh, just return!
        return;
    }

    if ((value < 0) || (value > 1)) {
        // Can happen if the user drags too much.
        return;
    }

    // Now, we call the superclass
    Slider.superclass.setValue.call(this, slot, value, fireCallback);

};

Slider.prototype.refresh = function () {

    // Completely override the superclass, because the mechanism is different.
    // Maybe this function could be polymorphic and also accept areas, so we
    // could call the superclass with parameters.

    if (this.drawClass === undefined) {
        return;
    }
    else {

        if (this.backgroundSavePending === true) {
            switch(this.type) {
                case "horizontal":
                    this.drawClass.drawImage.saveBackground (this.xOrigin - this.additionalEndSpace, this.yOrigin, this.totalStride, this.height);
                break;

                case "vertical":
                    this.drawClass.drawImage.saveBackground (this.xOrigin, this.yOrigin - this.additionalEndSpace, this.width, this.totalStride);
                break;

                default:
                  throw new Error("Error: Slider orientation is undefined!");
              }
            
            this.backgroundSavePending = false;
        }

        else {
            // We want drawClass to refresh the saved background.
            this.drawClass.drawImage.restoreBackground();
        }
        if ((this.drawClass !== undefined) && (this.isVisible === true)) {
            this.drawClass.drawImage.draw(this.sliderImage, this.xOrigin, this.yOrigin);
            /*jslint nomen: false*/

            switch(this.type) {
                case "horizontal":
                    this.drawClass.drawImage.draw(this.knobImage, this._getKnobPosition(), this.yOrigin);
                break;

                case "vertical":
                    this.drawClass.drawImage.draw(this.knobImage, this.xOrigin, this._getKnobPosition());
                break;

                default:
                  throw new Error("Error: Slider orientation is undefined!");
              }
          }
        
        /*jslint nomen: true*/
    }
};

Slider.prototype.calculateDimensions = function () {

    // The length of the slider knob.
    this.kWidth = this.knobImage.width;
    this.kHeight = this.knobImage.height;
   
    //TODO Maybe we should override this function, to set the ROI to the fader.
    this.setWidth(this.sliderImage.width);
    this.setHeight(this.sliderImage.height);
    
    // The fader can stick out by an half of its length at the two extremes of the
    // slider. Let's store some useful variables.
        switch(this.type) {
        case "horizontal":
            this.totalStride = this.width + this.kWidth;
            this.additionalEndSpace = Math.round (this.kWidth / 2);
            this.zeroLimit = this.xOrigin - this.additionalEndSpace;
            this.oneLimit =  this.xOrigin + this.width + this.additionalEndSpace;
        break;

        case "vertical":
            this.totalStride = this.height + this.kHeight;
            this.additionalEndSpace = Math.round (this.kHeight / 2);
            this.zeroLimit = this.yOrigin - this.additionalEndSpace;
            this.oneLimit =  this.yOrigin + this.height + this.additionalEndSpace;
        break;

        default:
          throw new Error("Error: Slider orientation is undefined!");
      }
    
};

Slider.prototype.setGraphicWrapper = function (wrapper) {

    // Call the superclass.
    Slider.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions
    this.drawClass = wrapper.initObject ([{objName: "drawImage",
                                           objParms: this.objParms}]);

};
