var VSliderTest = {
    
    name: 'VSliderTest',
    ui: null,
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        var images = this.imageLoader.imagesArray;
        
        vSliderArgs = {
            ID: "vTestSlider",
            left: Math.floor ((this.viewWidth - images[1].width) / 2),
            top : Math.floor ((this.viewHeight - images[0].height) / 2),
            sliderImg: images[0],
            knobImg: images[1],
            onValueSet: function (slot, value) {
                this.ui.refresh();
            }.bind(this),
            type:"vertical",
            isListening: true
        };
        
        this.ui.addElement(new K2.Slider(vSliderArgs));
        this.ui.setValue({elementID: "vTestSlider", value: 0.5});
        this.ui.refresh();
        // !VIEWABLEDOCEND            
    },
    
    init: function (canvas, images) {
    
                                               
        this.viewWidth = canvas.width;
        this.viewHeight = canvas.height;
        
        this.ui = new K2.UI ({type: 'CANVAS2D', target: canvas});
        
        var imageLoader = new K2.loadImageArray ({ID : "v_sliderTestLoader",
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