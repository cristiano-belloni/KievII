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
                    console.log (ls.status.id, " called back to say everything is loaded.");

                    // Update the element status
                    if (that.loaders[ls.status.id] !== undefined) {
                        that.loaders[ls.status.id].done = true;
                        that.loaders[ls.status.id].images = that.loaders[ls.status.id].imageArray.imagesArray;
                    }
                    else {
                        throw new Error("in loaders, " + ls.status.id + " is undefined");
                    }

                    // Check if every registered element is complete.
                    for (var element in that.loaders) {
                        if (that.loaders.hasOwnProperty(element)) {
                            if (that.loaders[element].done !== true) {
                                console.log ("status of element ", element, " is not true: ", that.loaders[element].done);
                                return;
                            }
                        }
                    }

                    that.onComplete (that.loaders);
                }
            }

    // Error & single; to be done


    /*{ID : "ztest_button_image_loader",
          imageNames: ["button1_1.png", "button1_2.png"],
          onComplete: loadingManager() }*/
    // {multipleImages: [{imageNames: [], id: ""}, {..}], onComplete: func, onError: func, onSingle: func};
    //throw Error ("multipleImages is not defined");
    this.multipleImages = args.multipleImages;
    this.onComplete = args.onComplete;
    this.onError = args.onError;
    this.onSingle = args.onSingle;
    this.loaders = {};

    //init the shit
    for (var i = 0; i < this.multipleImages.length; i += 1) {

        var loader = {};
        loader.imageArray = new loadImageArray ({ID : this.multipleImages[i].ID,
                                                 imageNames: this.multipleImages[i].imageNames,
                                                 onComplete: this.loadingManager()
                                                });
        loader.done = false;
        this.loaders[this.multipleImages[i].ID] = loader;
    }



}