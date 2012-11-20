var CurveTest = {
    
    name: 'CurveTest',
    ui: null,
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        var vW = this.viewWidth;
        var vH = this.viewHeight;
        
        var curveArgs = {
                ID: "hCos",
                top: 0,
                left: 0,
                width: vW,
                height: vH,
                curveType: "halfcosine",
                curveColor: "orange",
                thickness: vH * 0.01,
                paintTerminalPoints: 'first',
                points: [vW * 0.1, vH * 0.5, vW * 0.25, vH * 0.25],
                isListening: true
            };
        
        curveArgs.onValueSet = function (slot, value, element) {
            this.ui.refresh();
        }.bind(this);

        var curveElement = new K2.Curve(curveArgs);
        
        curveArgs.ID = "smooth";
        curveArgs.curveType = "smooth";
        curveArgs.points = [vW * 0.25, vH * 0.25, vW * 0.5, vH * 0.5]; 
        var curveElement2 = new K2.Curve(curveArgs);
        
        curveArgs.ID = "bez4";
        curveArgs.curveType = "bezier";
        curveArgs.paintTerminalPoints = 'all';
        curveArgs.points = [vW * 0.5, vH * 0.5, 
                            vW * 0.5 , vH * 0.75, 
                            vW * 0.625, vH * 0.125, 
                            vW * 0.75, vH * 0.875, 
                            vW * 0.9, vH * 0.5];
        var curveElement3 = new K2.Curve(curveArgs);
        
        this.ui.addElement(curveElement);
        this.ui.addElement(curveElement2);
        this.ui.addElement(curveElement3);

        this.ui.refresh();
        // !VIEWABLEDOCEND            
    },
    
    init: function (canvas) {
    
                                               
        this.viewWidth = canvas.width;
        this.viewHeight = canvas.height;
        
        this.ui = new K2.UI ({type: 'CANVAS2D', target: canvas});
        
        this.main();
        
    }
}