function loadImageArray (args) {

    this.onCompletion = function () {

        // Call the callback if there's one.
        if (typeof (this.onComplete) === "function") {
            var final_status = this.pollStatus();
            var retvalue = {
                imagesArray: this.imagesArray,
                status: final_status
            }
            this.onComplete (retvalue);
        }

        return;
    };

    this.onLoad = function (that) {
        return function () {
            that.objectsLoaded += 1;
            that.check (that.onSingle, this);
        }
    };
    
    this.onError = function (that) {
        return function () {
            that.objectsError += 1;
            that.check (that.onErr, this);
            }
        };

    this.check = function (callback, imageObj) {

        if (typeof(callback) === 'function') {
                var temp_status = this.pollStatus();
                callback ({
                    obj: imageObj,
                    status: temp_status
                });
            }
            if (this.objectsLoaded + this.objectsError === this.objectsTotal) {
                this.onCompletion();
            }
    }

    this.pollStatus = function () {
        return {
                id: this.ID,
                loaded: this.objectsLoaded,
                error: this.objectsError,
                total:  this.objectsTotal
                };
    }

    // The user will recognize this particular instance by ID
    this.ID = args.ID;

    // Optional callbacks
    this.onComplete = args.onComplete;
    this.onSingle = args.onSingle;
    this.onErr = args.onError;

    // Statistics
    this.objectsLoaded = 0;
    this.objectsError = 0;
    this.objectsTotal = args.imageNames.length;
    this.imagesArray = [];

    // Load images from names
    for (var i = 0; i < this.objectsTotal; i += 1) {
        this.imagesArray[i] = new Image();
        this.imagesArray[i].onload = this.onLoad(this);
        this.imagesArray[i].onerror = this.onError(this);
        this.imagesArray[i].src = args.imageNames[i];
    }
}

function loadMultipleImages (args) {

    this.loadingManager = function () {
        // Storage the closurage.
        var that = this;
        return function (loaderStatus) {
            var ls = loaderStatus;
                    // console.log (ls.status.id, " called back to say everything is loaded.");

                    // Update the element status
                    if (that.loaders[ls.status.id] !== undefined) {
                        that.loaders[ls.status.id].done = true;
                        that.loaders[ls.status.id].images = that.loaders[ls.status.id].imageArray.imagesArray;
                        // Call the singleArray callback
                        if (typeof (that.onSingleArray) === 'function') {
                            that.onSingleArray (loaderStatus);
                        }
                    }
                    else {
                        throw new Error("in loaders, " + ls.status.id + " is undefined");
                    }

                    // Check if every registered element is complete.
                    for (var element in that.loaders) {
                        if (that.loaders.hasOwnProperty(element)) {
                            if (that.loaders[element].done !== true) {
                                // console.log ("status of element ", element, " is not true: ", that.loaders[element].done);
                                // Return, we're not done yet.
                                return;
                            }
                        }
                    }

                    that.onComplete (that.loaders);
                }
            }

     this.errorManager = function () {
         // Storage the closurage.
        var that = this;
        return function (errorStatus) {
            if (typeof (that.onError) === 'function') {
                that.onError (errorStatus);
            }
        }
    }

     this.singleManager = function () {
         // Storage the closurage.
        var that = this;
        return function (singleStatus) {
            if (typeof (that.onSingle) === 'function') {
                that.onSingle (singleStatus);
            }
        }
    }


    this.multipleImages = args.multipleImages;
    this.onComplete = args.onComplete;
    this.onError = args.onError;
    this.onSingle = args.onSingle;
    this.onSingleArray = args.onSingleArray;
    this.loaders = {};

    // init as many loadImageArray as needed, by the mighty powers of object
    // composition.
    for (var i = 0; i < this.multipleImages.length; i += 1) {

        var loader = {};
        loader.imageArray = new loadImageArray ({ID : this.multipleImages[i].ID,
                                                 imageNames: this.multipleImages[i].imageNames,
                                                 onComplete: this.loadingManager(),
                                                 onError: this.errorManager(),
                                                 onSingle: this.singleManager()
                                                });
        loader.done = false;
        this.loaders[this.multipleImages[i].ID] = loader;
    }



}