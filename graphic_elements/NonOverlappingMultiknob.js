// This kind of knob can be easily emulated with callbacks and so on. Not sure
// if I really need to mantain it.

function NonOverlappingMultiknob(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(NonOverlappingMultiknob, Element);


NonOverlappingMultiknob.prototype.getready = function (args) {
    
     // Call the constructor from the superclass.
    NonOverlappingMultiknob.superclass.getready.call(this, args);

    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class
    this.KnobArray = [];
    this.ROIKnob = undefined;

    var nKnobs,
        tempKnob,
        knob,
        valuename,
        i;

    //Coordinates is an array of arrays. We infer the number of knobs from its
    //length. No alignment functions here, they must be provided outside of this
    //class.
    nKnobs = args.coordinates.length;

    // Set the status progress. TODO this can go.
    this.objectsTotal = nKnobs * args.images.length;

    // Fill the knob array. It contains, you know, knobs :)
    for (i = 0; i < nKnobs; i += 1) {

        var knobSpecArgs = {
            images: args.images
        };
        // The knobs are named 1,2,3...n
        tempKnob = new Knob(i, args.coordinates[i], knobSpecArgs);

        //Set them undrawable, as we will explicitly refresh them.
        tempKnob.drawItself = false;

        this.KnobArray.push(tempKnob);
    }

    this.values = {};

    //Map our values to the corresponding knob
    for (i = 0; i < this.KnobArray.length; i += 1) {
        valuename = "knobvalue" + this.KnobArray[i].name;
        this.values[valuename] = i;
    }

    //By default, a multiple knob always draws itself when value is set.
    this.drawItself = true;
};

NonOverlappingMultiknob.prototype.isInROI = function (x, y) {

    var nKnobs,
        i;

    //Check all the "subknobs".
    nKnobs = this.KnobArray.length;
    for (i = 0; i < nKnobs; i += 1) {
        if (this.KnobArray[i].isInROI(x, y) === true) {
            // Store the knob that responded true.
            this.ROIKnob = i;
            return true;
        }
    }

    return false;

};

NonOverlappingMultiknob.prototype.onMouseDown = function (x, y) {

    var knobret,
        inROI;

    inROI = this.isInROI(x, y);

    if (inROI === true) {
        knobret = this.KnobArray[this.ROIKnob].onMouseDown(x,y);
    }

    //assert (knobret === undefined) TODO
    return knobret;
    
};

NonOverlappingMultiknob.prototype.onMouseUp = function (x, y) {

    var knobret;

    if (this.ROIKnob !== undefined) {
        knobret = this.KnobArray[this.ROIKnob].onMouseUp(x,y);
    }
    this.ROIKnob = undefined;
    //assert (knobret === undefined) TODO
    return knobret;
}

NonOverlappingMultiknob.prototype.onMouseMove = function (x, y) {

    var knobret;

    if (this.ROIKnob !== undefined) {
        //Pass it to the right subknob
        knobret = this.KnobArray[this.ROIKnob].onMouseMove(x,y);

        if (knobret !== undefined) {
            var ret = {"slot" : ("knobvalue" + this.ROIKnob), "value" : knobret.value};
            return ret;
        }
    }
    // else
    return undefined;
}

NonOverlappingMultiknob.prototype.setValue = function (slot, value) {

    var knobN;

    //Do the magic here. Knobs should not overlap.
    //Note that we don't change any other knob value, we simply assure that knob[i]
    //is always minor (or equal?) to knob[i+1] and that knob[0] >= 0 and knob[1]
    // <= 1.

    if ((value < 0) || (value > 1)) {
        //Just do nothing.
        //console.log("NonOverlappingMultiknob.prototype.setValue: VALUE INCORRECT!!");
        return;
    }

    //Retrieve the knob number here. Kind of an hack, mh?
    knobN = parseInt(this.values[slot], 10);

    if (knobN === 0) {
        if (value < 0) {
            value = 0;
        }
        if (value > this.KnobArray[knobN + 1].values.knobvalue) {
            value = this.KnobArray[knobN + 1].values.knobvalue;
        }
    }

    else if (knobN === (this.KnobArray.length - 1)) {
        if (value > 1) {
            value = 1;
        }
        if (value < this.KnobArray[knobN - 1].values.knobvalue) {
            value = this.KnobArray[knobN - 1].values.knobvalue;
        }
    }

    else {
        if (value < this.KnobArray[knobN - 1].values.knobvalue) {
            value = this.KnobArray[knobN - 1].values.knobvalue;
        }
        if (value > this.KnobArray[knobN + 1].values.knobvalue) {
            value = this.KnobArray[knobN + 1].values.knobvalue;
        }
    }

    //Set the values in the subknob. I don't like the hardcoded string here.
    //(maybe a Multielement could be generalized)
    this.KnobArray[knobN].setValue("knobvalue", value);

    // Now, we don't need to call the superclass since we don't have any "real" value.
    // We must refresh by ourselves, though.
    // TODO IMPLEMENT CALLBACKS AND USE fireCallback
    if (this.drawItself === true) {
        this.refresh();
    }
};

NonOverlappingMultiknob.prototype.refresh = function () {
    
    var i;

    if (this.drawClass === undefined) {
        throw new Error("Error: drawClass is undefined!");
    }
    else {
        // Refresh all the subknobs. TODO THIS IS NOT RIGHT!
        // If we want to preserve the background, we have to have different
        // drawing contexts.
        for (i = 0; i < this.KnobArray.length; i += 1) {
            //drawClasses must be lazily initialized here.
            if (this.KnobArray[i].drawClass === undefined) {
                this.KnobArray[i].drawClass = this.drawClass;
            }
            this.KnobArray[i].refresh();
        }
    }
};

NonOverlappingMultiknob.prototype.getValue = function (slot) {
    //Retrieve the knob numer here. Kind of an hack, mh?
    var knobN = this.values[slot];
    //Get the values from the subknob. Same as setValue.
    this.KnobArray[knobN].getValue("knobvalue");
};
