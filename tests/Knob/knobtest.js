var KnobTest = {
    
    name: 'KnobTest',
    ui: null,
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        var images = this.imageLoader.imagesArray;
        
        var knobArgs = {
            ID: "test_knob",
            top: Math.floor ((this.viewWidth - 50) / 2) ,
            left: Math.floor ((this.viewHeight - 50) / 2),
            imagesArray : images,
            sensitivity : 5000,
            tileWidth: 50,
            tileHeight: 50,
            imageNum: 50,
            bottomAngularOffset: 33,
            onValueSet: function (slot, value) {
                this.ui.refresh();
            }.bind(this),
            isListening: true
        };
        
        this.ui.addElement(new K2.Knob(knobArgs));
        this.ui.setValue({elementID: "test_knob", value: 0});
        this.ui.refresh();
        // !VIEWABLEDOCEND            
    },
    
    init: function (canvas, images) {
    
                                               
        this.viewWidth = canvas.width;
        this.viewHeight = canvas.height;
        
        this.ui = new K2.UI ({type: 'CANVAS2D', target: canvas});
        
        var imageLoader = new loadImageArray ({ID : "knobTestLoader",
                                               imageNames: images,
                                               onComplete: imagesCompleted.bind(this),
                                               onSingle: imageSingle.bind(this),
                                               onError: imageError.bind(this)});
        
        function imageSingle (loaderStatus) {
            var st = loaderStatus.status;
            console.log ("Image number ", st.loaded, " on ", st.total," was loaded, src is ", loaderStatus.obj.src);
        }
        
        function imageError (loaderStatus) {
            var st = loaderStatus.status;
            console.log ("Image number ", st.error, " on ", st.total," has errors, src is ", loaderStatus.obj.src);
        }
        
        function imagesCompleted (imageLoader) {
            this.imageLoader = imageLoader;
            if (imageLoader.status.error !== 0) {
                throw new Error(imageLoader.status.error + " elements failed to load on loader " + imageLoader.status.id); }
            this.main();
        }
        
    }
}