var curveExample = {
	
	name: 'curveExample',
	ui: null,
	
	init : function (plugin_canvas) {
    
		var CWrapper = K2WRAPPER.createWrapper("CANVAS_WRAPPER",
		                                       {canvas: plugin_canvas}
		                                       );
		
		this.ui = new UI (plugin_canvas, CWrapper);
		
		var W = plugin_canvas.width;
        var H = plugin_canvas.height;
		
		// !VIEWABLEDOCSTART
		var mf = Math.floor;
		
		var curveArgs = {
		    ID: "hCos",
		    top: 0, left: 0, width: W, height : H,
		    curveType: "halfcosine",
		    thickness: 5,
		    curveColor: "02B51F",
		    handleColor: "A81B32",
		    helperColor: "gray",
		    curveLabels: true,
		    midPointSize: 8,
		    paintTerminalPoints: 'first',
		    terminalPointSize: 15,
		    terminalPointColor: 'black',
		    terminalPointFill: '015C10',
		    midPointFill: 'E6965A',
		    points: [0, H, mf(W / 4) , mf(H / 4)],
		    onValueSet: function (slot, value) {
		            this.ui.refresh();
		    	}.bind(this),
		    isClickable: true
		};
		// 1st curve, Half Cosine interpolation
		var curveElement = new Curve(curveArgs);
		
		// 2nd curve, smooth interpolation
		curveArgs.ID = "smooth";
		curveArgs.curveType = "smooth";
		curveArgs.points = [mf(W / 4), mf(H / 4), mf(W / 4) * 2, mf(H / 4) * 2];
		
		var curveElement2 = new Curve(curveArgs);
		
		// 3nd curve, 4th grade Bezier interpolation
		curveArgs.ID = "bez4";
		curveArgs.curveType = "bezier";
        curveArgs.points = [mf(W / 4) * 2, mf(H / 4) * 2,
                            mf(W / 4) * 2 + mf(W / 5), mf(H / 4) * 2 - mf(H / 5),
                            mf(W / 4) * 2 - mf(W / 5), mf(H / 4) * 2 + mf(H / 5),
                            mf(W / 4) * 2 + mf(W / 5) * 2, mf(H / 4) * 2 - mf(H / 5) * 2,
                            mf(W / 4) * 3, mf(H / 4) * 3];
		var curveElement3 = new Curve(curveArgs);
		
		// 4th curve, linear
		curveArgs.ID = "line";
		curveArgs.curveType = "linear";
		curveArgs.paintTerminalPoints = 'all';
		curveArgs.points = [mf(W / 4) * 3, mf(H / 4) * 3, W, H];
		
		var curveElement4 = new Curve(curveArgs);
    
        // Add the curves to the UI		    
        this.ui.addElement(curveElement);
        this.ui.addElement(curveElement2);
        this.ui.addElement(curveElement3);
        this.ui.addElement(curveElement4);
		    
        this.ui.refresh();
		// !VIEWABLEDOCEND 
	}
	
}