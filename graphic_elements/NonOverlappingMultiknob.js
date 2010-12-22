function NonOverlappingMultiknob(name, topleft, specArgs) {
    if (arguments.length) {
        this.getready(name, topleft, specArgs);
    }
}

//inherit from the Element prototype
NonOverlappingMultiknob.prototype = new Element();
//put the correct constructor reference back (not essential)
NonOverlappingMultiknob.prototype.constructor = NonOverlappingMultiknob;


NonOverlappingMultiknob.prototype.getready = function (name, topleft, specArgs) {
    //reference the getready method from the parent class
    this.tempReady = Element.prototype.getready;
    //and run it as if it were part of this object
    this.tempReady(name, topleft);
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
    nKnobs = specArgs.coordinates.length;

    // Set the status progress. TODO this can go.
    this.objectsTotal = nKnobs * specArgs.images.length;

    // Fill the knob array. It contains, you know, knobs :)
    for (i = 0; i < nKnobs; i += 1) {

        var knobSpecArgs = {
            images: specArgs.images
        };
        // The knobs are named 1,2,3...n
        tempKnob = new Knob(i, specArgs.coordinates[i], knobSpecArgs);

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

NonOverlappingMultiknob.prototype.onROI = function (start_x, start_y, curr_x, curr_y) {

    var knobret,
        ret;

    //Pass it to the right "subknob"
    knobret = this.KnobArray[this.ROIKnob].onROI(start_x, start_y, curr_x, curr_y);

    // TODO define whatever :)
    ret = {"slot" : ("knobvalue" + this.ROIKnob), "value" : knobret.value};

    return ret;
};

NonOverlappingMultiknob.prototype.setValue = function (slot, value) {

    var temp_value,
        knobN;

    temp_value = value;

    if ((temp_value < 0) || (temp_value > 1)) {
        //Just do nothing.
        //console.log("NonOverlappingMultiknob.prototype.setValue: VALUE INCORRECT!!");
        return;
    }

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
        if (value > this.KnobArray[knobN].values.knobvalue) {
            value = this.KnobArray[knobN].values.knobvalue;
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
        //Refresh all the subknobs. TODO we might just want to refresh only the
        //knob that has been modified.
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

NonOverlappingMultiknob.prototype.getStatus = function () {

    // Calculate the status, based on knob status.
    var total = 0,
        loaded = 0,
        knobStatus,
        tempStatus,
        i;

    for (i = 0; i < this.KnobArray.length; i += 1) {

        knobStatus = this.KnobArray[i].getStatus();

        total += knobStatus.ObjectTotal;
        loaded += knobStatus.ObjectLoaded;

    }

    tempStatus = {"ObjectTotal": total, "ObjectLoaded" : loaded};
    return tempStatus;
};

NonOverlappingMultiknob.prototype.isComplete = function () {

    // TODO:
    // This is ok as long as we call isComplete() every 100 ms.
    // But when we'll use callbacks, we won't set this.completed here.

    var temp, i;

    if (this.completed === true) {
        return true;
    }

    for (i = 0; i < this.KnobArray.length; i += 1) {

        temp = this.KnobArray[i].isComplete();

        if (temp === false) {
            return false;
        }

    }
    
    this.completed = true;
    return true;
    
};