var ButtonTest = {
    
    name: 'ButtonTest',
    ui: null,
    
    main: function (K2) {
        
        // !VIEWABLEDOCSTART
        var imgs = this.imageLoader.imagesArray;
        var img = this.imageLoader.imagesArray[0];
        
        var buttonArgs = {
            ID: "test_button",
            left: Math.floor ((this.viewWidth - img.width) / 2),
            top: Math.floor ((this.viewHeight - img.height) / 2),
            mode: 'persistent',
            imagesArray : imgs,
            onValueSet: function (slot, value) {
                this.ui.refresh();
            }.bind(this),
            isListening: true
        };
        
        this.ui.addElement(new K2.Button(buttonArgs));
        this.ui.refresh();
        // !VIEWABLEDOCEND            
    },
    
    init: function (canvas, images, K2) {
    
                                               
        this.viewWidth = canvas.width;
        this.viewHeight = canvas.height;
        
        this.ui = new K2.UI ({type: 'CANVAS2D', target: canvas});
        
        var imageLoader = new K2.loadImageArray ({ID : "buttonTestLoader",
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
            this.main(K2);
        }
        
    }
}