function Background(args) {
    if (arguments.length) {
        this.getready(args);
    }
}

extend(Background, Element);

Background.prototype.getready = function (args) {
    
    if (args === undefined) {
        throw new Error("Error: args is undefined!");
    }

    // Call the constructor from the superclass.
    Background.superclass.getready.call(this, args);

    // Override width and height, they'll be specified by the image.
    this.width = null;
    this.height = null;

    this.image = args.image;

    this.width = this.image.width;
    this.height = this.image.height;
    
    // Background saving is on by default.
    if ((args.preserveBg !== undefined) && (args.preserveBg === true)) {
        this.preserveBg = true;
        // As soon as we can, we want to save our background.
        this.backgroundSavePending = true;
    }

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

    if (this.drawClass !== undefined) {
        // Draw, if our draw class is already set.

        // Call the superclass.
        Background.superclass.refresh.call(this, this.drawClass.drawImage);

        if (this.isVisible === true) {
            this.drawClass.drawImage.draw(this.image, this.xOrigin, this.yOrigin);
        }
    }
    
};

Background.prototype.setGraphicWrapper = function (wrapper) {

    // Call the superclass.
    Background.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions
    this.drawClass = wrapper.initObject ([{objName: "drawImage",
                                           objParms: this.objParms}]);

};