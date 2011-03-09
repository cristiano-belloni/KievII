function loadImageArray (imageNames, onComplete, onSingle) {

    this.onCompletion = function () {

        // Call the callback if there's one.
        if (typeof (this.onComplete) === "function") {
            this.onComplete (this.imagesArray);
        }

        return;
    };

    this.onLoad = function (that) {
        return function () {
            that.objectsLoaded += 1;
            if (typeof(that.onSingle) === 'function') {
                that.onSingle();
            }
            if (that.objectsLoaded === that.objectsTotal) {
                that.onCompletion();
            }
        };
    };

    this.onComplete = onComplete;
    this.onSingle = onSingle;
    this.objectsLoaded = 0;
    this.objectsTotal = imageNames.length;
    this.imagesArray = [];

    // Load images from names
    for (var i = 0; i < this.objectsTotal; i += 1) {
        this.imagesArray[i] = new Image();
        this.imagesArray[i].onload = this.onLoad(this);
        this.imagesArray[i].src = imageNames[i];
    }
}