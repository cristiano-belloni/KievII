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