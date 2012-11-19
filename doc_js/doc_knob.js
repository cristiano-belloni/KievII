var knobExample = {
	
	name: 'knobExample',
	ui: null,
	
	main: function () {
	    
	    // !VIEWABLEDOCSTART
	    var img = this.imageLoader.imagesArray[0];
	    
	    var knobArgs = {
	        ID: "test_knob",
	        top: Math.floor ((this.viewWidth - img.width) / 2) ,
	        left: Math.floor ((this.viewHeight - img.height) / 2),
	        image : img,
	        sensitivity : 5000,
	        onValueSet: function (slot, value) {
	            this.ui.refresh();
	    	}.bind(this),
	        isClickable: true
	    };
	    
	    this.ui.addElement(new RotKnob(knobArgs));
	    this.ui.setValue({elementID: "test_knob", value: 0});
	    this.ui.refresh();
	    // !VIEWABLEDOCEND            
	},
	
	init: function (plugin_canvas) {
	
		var CWrapper = K2WRAPPER.createWrapper("CANVAS_WRAPPER",
		                                       {canvas: plugin_canvas}
		                                       );
		                                       
        this.viewWidth = plugin_canvas.width;
        this.viewHeight = plugin_canvas.height;
		
		this.ui = new UI (plugin_canvas, CWrapper);
		
		var imageLoader = new loadImageArray ({ID : "tuning",
		                                       imageNames: ["doc_img/White_big.png"],
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