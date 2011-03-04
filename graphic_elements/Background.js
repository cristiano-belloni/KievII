function Background(name, topleft, specArgs) {
    if (arguments.length) {
        this.getready(name, topleft, specArgs);
    }
}

//inherit from the Element prototype
Background.prototype = new Element();
//put the correct constructor reference back (not essential)
Background.prototype.constructor = Background;

Background.prototype.getready = function (name, topleft, specArgs) {
    //reference the getready method from the parent class
    this.tempReady = Element.prototype.getready;
    //and run it as if it were part of this object
    this.tempReady(name, topleft, specArgs);

    // Set the status progress.
    this.objectsTotal = 1;
    this.objectsLoaded = 0;

    this.width = undefined;
    this.height = undefined;

    this.image = new Image();
    // Set the onload function.
    this.image.onload = this.onLoad(this);
    this.image.src = specArgs.image;

};

// This method returns the image object.
Background.prototype.GetImage = function () {
    return this.image;
};

Background.prototype.onLoad = function (that) {
    // A closure stores the class' instance "this""
    return function () {
        that.objectsLoaded += 1;
        that.completed = true;
        that.onCompletion();
    };
};


// This methods returns true if the point given belongs to this element.
Background.prototype.isInROI = function (x, y) {
    if ((x > this.xOrigin) && (y > this.yOrigin)) {
        if ((x < (this.xOrigin + this.width)) && (y < (this.yOrigin + this.height))) {
            //console.log(this.name, " ROI Handler: ", x, y, " is in ROI ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);
            return true;
        }
        //console.log(this.name, " ROI Handler: ", x, y, " is NOT in ROI ", this.xOrigin, this.yOrigin, this.xOrigin + this.width, this.yOrigin + this.height);
        return false;
    }
};

Background.prototype.refresh = function () {
    if (this.drawClass === undefined) {
        throw new Error("Error: drawClass is undefined!");
    }
    else {
        // Draw yourself!
        // console.log ("drawClass is drawing itself!");
        this.drawClass.draw(this.image, this.xOrigin, this.yOrigin);
    }
};

Background.prototype.onCompletion = function () {
    // Now, we can store width and height safely.
    this.width = this.image.width;
    this.height = this.image.height;

    // Now, we call the superclass
    Element.prototype.onCompletion.apply(this);

};