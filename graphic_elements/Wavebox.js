function Wavebox(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(Wavebox, Element);

Wavebox.prototype.getready = function (args) {

    // Call the constructor from the superclass.
    Wavebox.superclass.getready.call(this, args);

    this.values = {"waveboxposition" : 0,
                   "startsample" : 0,
                   "endsample" : null,
                   "waveboxsignal" : []
               };
    this.defaultSlot = "waveboxposition";
    
    this.setWidth(args.width);
    this.setHeight(args.height);
    this.binMethod = args.binMethod || "minmax";
    this.orientation = args.orientation || 0;

};

// This methods returns true if the point given belongs to this element.
Wavebox.prototype.isInROI = function (x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {            
            return true;
        }
    }
    return false;
};

Wavebox.prototype.setValue = function (slot, value) {

    // Won't call the parent: this element has a custom way to set values.

    if (this.values[slot] === undefined) {
        throw new Error("Slot " + slot + " not present or value undefined");
    }

    if (this.values[slot] === value) {
        //Nothing changed.
        return;
    }

    // Check some boundaries.

    if ((slot === "startsample") || (slot === "endsample")) {
        if (value < 0) {
            throw new Error("Error: Trying to set ", slot, " less than 0: ", value);
        }
        if (this.values["waveboxsignal"] !== undefined) {
            if (value > this.values["waveboxsignal"].length) {
                throw new Error("Error: Trying to set ", slot, " bigger than signal length: ", value, " > ", this.values["waveboxsignal"].length);
            }
        }
    }

    if (slot === "startsample") {
        if (value > this.values["endsample"]) {
                throw new Error("Error: Trying to set startsample > endsample: ", value, " > ", this.values["endsample"]);
            }
    }

    if (slot === "endsample") {
        if (value < this.values["startample"]) {
                throw new Error("Error: Trying to set endsample < startsample: ", value, " < ", this.values["startsample"]);
            }
    }

    this.values[slot] = value;
    // console.log ("set value for slot ", slot);

    // When we change the signal, we know we must reset the whole thing.
    if (slot === "waveboxsignal") {
        //Take the whole waveform
        // console.log ("inside!");
        this.values["endsample"] = this.values["waveboxsignal"].length;
        this.values["startsample"] = 0;
    }
};

Wavebox.prototype.refresh = function () {
    if (this.drawClass !== undefined) {
		       
        // Call the superclass.
        Wavebox.superclass.refresh.call(this, this.drawClass.drawPath);

		//TODO there must be a less-repetitive way of handling orientations
		
        if (this.isVisible === true) {
        	
        	// Default
        	var dim1 = this.width;
        	var dim2 = this.height;
        	
        	if (this.orientation === 1) {
        		var dim1 = this.height;
        		var dim2 = this.width;
        	}
            
            var binFunction;
            
            if (this.binMethod == "minmax") {
                binFunction = this.calculateBinMix;
            }
            else if (this.binMethod == "none") {
                binFunction = this.calculateBinNone;
            }
            else {
                console.log ("Error: no binMethod!");
            }
            
            var i = 0;
            // One bin per pixel
            var bin_size = parseInt (((this.values.endsample - this.values.startsample) / dim1), 10);

            if (true) {

                this.drawClass.drawPath.beginDraw();
				
				//Start from the middle
				if (this.orientation === 0) {
                	this.drawClass.drawPath.draw(this.xOrigin, dim2 * 0.5 + this.yOrigin);
                }
                else if (this.orientation === 1) {
                	this.drawClass.drawPath.draw(this.xOrigin + dim2 * 0.5, this.yOrigin);
                }
                
                for (i = 0; i < dim1; i += 1) {
                    
                    var bin_value = binFunction (i, bin_size, this.values);
                    
                    if (this.orientation === 0) {
	                    var y_point = (dim2 - (((bin_value.max + 1 ) * (dim2)) / 2)) + this.yOrigin;
	                    var x_point = i + this.xOrigin;
                    }
                    else if (this.orientation === 1) {
                    	var y_point = i + this.yOrigin;
                    	var x_point = (dim2 - (((bin_value.max + 1 ) * (dim2)) / 2)) + this.xOrigin;
                    }
                    
                    this.drawClass.drawPath.draw(x_point, y_point);
                    
                }
                if (this.orientation === 0) {
                	this.drawClass.drawPath.draw(dim1 + this.xOrigin, dim2 * 0.5 + this.yOrigin);
                }
                else if (this.orientation === 1) {
                	this.drawClass.drawPath.draw(dim2 * 0.5 + this.xOrigin, dim1 + this.yOrigin);
                }

                this.drawClass.drawPath.endDraw();

                this.drawClass.drawPath.beginDraw();
				
				if (this.orientation === 0) {
                	this.drawClass.drawPath.draw(this.xOrigin, dim2 * 0.5 + this.yOrigin);
               	}
               	else if (this.orientation === 1) {
               		this.drawClass.drawPath.draw(this.xOrigin + dim2 * 0.5, this.yOrigin);
               	}
               	
                for (i = 0; i < dim1; i += 1) {
                    
                    var bin_value = binFunction (i, bin_size, this.values);
                    
                    if (this.orientation === 0) {
	                    var y_point = (dim2 - (((bin_value.min + 1 ) * (dim2)) / 2)) + this.yOrigin;
	                    var x_point = i + this.xOrigin;
                    }
                    if (this.orientation === 1) {
                    	var y_point = i + this.yOrigin;
                    	var x_point = (dim2 - (((bin_value.min + 1 ) * (dim2)) / 2)) + this.xOrigin;
                    }
                    
                    this.drawClass.drawPath.draw(x_point, y_point);
                }
                
                if (this.orientation === 0) {
                	this.drawClass.drawPath.draw(dim1 + this.xOrigin, dim2 * 0.5 + this.yOrigin);
                }
                else if (this.orientation === 1) {
                	this.drawClass.drawPath.draw(dim2 * 0.5 + this.xOrigin, dim1 + this.yOrigin);
                }
                

                this.drawClass.drawPath.endDraw();

            }
           
            if (false) {
             
             	// TODO this doesn't work with orientations
             	
                for (i = 0; i < dim1; i += 1) {
                    var bin_value = binFunction (i, bin_size, this.values);
                   
                   //NewValue = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
                   
                   var y = (dim2 - (((bin_value.max + 1 ) * (dim2)) / 2)) + this.yOrigin;
                   var y1 = (dim2 - (((bin_value.min + 1 ) * (dim2)) / 2)) + this.yOrigin;
                   var x = i + this.xOrigin;
                   var width = 1;
                   var height = y1 - y;
                   
                   this.drawClass.drawRect.draw(x, y, width, height, 0);
                   
               }
               
           }

        }
    }
};

//Non-interface functions
Wavebox.prototype.calculateBinMix = function (bin_index, bin_size, values) {
    var wave = values.waveboxsignal;
    var start = values.startsample + bin_index * bin_size;
    var end = values.startsample + ((bin_index + 1) * bin_size);
    if (end > values.endsample) {
        end = values.endsample;
    }

    var bin_min = wave[start];
    var bin_max = wave[start];
    
    for (var i = 1; i < bin_size; i++) {
        if (wave[start + i] < bin_min) {
            bin_min = wave[start + i];
        }
        if (wave[start + i] > bin_max) {
            bin_max = wave[start + i];
        }
    }
    
    var bin_res = {
        "max" : bin_max,
        "min" : bin_min
    }
    
    return bin_res;
}

Wavebox.prototype.calculateBinNone = function (bin_index, bin_size, values) {
    
    var start = values.startsample + bin_index * bin_size;

    // In the middle of the bin
    var middle = parseInt ((bin_size / 2), 10);
    var sample_val = values.waveboxsignal[start + middle];
    
    var bin_res = {
        "max" : sample_val,
        "min" : (-sample_val)
    }
    
    return bin_res;
    
}


Wavebox.prototype.calculateBinAvg = function (bin_index, bin_size) {
    
    var wave = this.values.waveboxsignal;
    var start = this.values.startsample + bin_index * bin_size;
    var end = start + ((bin_index + 1) * bin_size);
    if (end > this.values.endsample) {
        end = this.values.endsample;
    }

    var bin = wave.subarray(start, end);

    // Moving average
    var bin_avg = 0;
    var len = bin.length;
    for (var i = 0; i < (len -1); i++) {
        bin_avg = (bin[i+1] + i * bin_avg) / (i + 1);
    }

    return bin_avg;
}

Wavebox.prototype.setGraphicWrapper = function (wrapper) {

    // Call the superclass.
    Wavebox.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions
    this.drawClass = wrapper.initObject ([{objName: "drawPath", objParms: this.objParms}]);
    //this.drawClass = wrapper.initObject ([{objName: "drawRect", objParms: this.objParms}]);
                                   
};