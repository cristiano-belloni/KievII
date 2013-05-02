var RotKnobTest = {
    
    name: 'RotKnobTest',
    ui: null,
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        var img = this.imageLoader.imagesArray[0];
        
        var knobArgs = {
            ID: "test_knob",
            left: Math.floor ((this.viewWidth - img.width) / 2) ,
            top: Math.floor ((this.viewHeight - img.height) / 2),
            image : img,
            sensitivity : 5000,
            initAngValue: -90,
            startAngValue: 0,
            stopAngValue: 360,
            /* knobMethod: 'updown', */
            onValueSet: function (slot, value) {
                this.ui.refresh();
            }.bind(this),
            isListening: true
        };
        
        this.ui.addElement(new K2.RotKnob(knobArgs));
        this.ui.setValue({elementID: "test_knob", value: 0});
        this.ui.refresh();
        // !VIEWABLEDOCEND            
    },
    
    init: function (canvas, images) {
    
                                               
        this.viewWidth = canvas.width;
        this.viewHeight = canvas.height;
        
        this.ui = new K2.UI ({type: 'CANVAS2D', target: canvas});
        
        var imageLoader = new K2.loadImageArray ({ID : "rot_knobTestLoader",
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