function Background(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

//inherit from the Element prototype
Background.prototype = new Element();
//put the correct constructor reference back (not essential)
Background.prototype.constructor = Background;

Background.prototype.getready = function (args) {
    //reference the getready method from the parent class
    this.tempReady = Element.prototype.getready;
    //and run it as if it were part of this object
    this.tempReady(args);

    // Override width and height, they'll be specified by the image.
    this.width = null;
    this.height = null;

    this.image = args.image;

    /* Get the wrapper primitive functions, unique to label */
    this.drawClass = args.wrapper.initObject ([{objName: "drawImage",
                                           objParms: args.objParms}]);

};

// This method returns the image object.
Background.prototype.GetImage = function () {
    return this.image;
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
        this.drawClass.drawImage.draw(this.image, this.xOrigin, this.yOrigin);
    }
};