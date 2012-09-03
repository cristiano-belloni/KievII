var CurveTest = {
    
    name: 'CurveTest',
    ui: null,
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        
        var curveArgs = {
                ID: "hCos",
                top: 0,
                left: 0,
                width: 800,
                height:700,
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
                //points: [120, 280, 280, 130, 420, 280, 580, 130, 600, 140],
                points: [60, 280, 280, 130],
                isListening: true
            };
        
        curveArgs.onValueSet = function (slot, value, element) {
            console.log ("Element: ", element, ". onValueSet callback: slot is ", slot, " and value is ", value);
            CurveTest.ui.refresh();
        };

            var curveElement = new K2.Curve(curveArgs);
            
            curveArgs.ID = "smooth";
            curveArgs.curveType = "smooth";
            //curveArgs.paintTerminalPoints = 'first';
            curveArgs.points = [280, 130, 310, 180];
            
            var curveElement2 = new K2.Curve(curveArgs);
            
            curveArgs.ID = "bez4";
            curveArgs.curveType = "bezier";
            //curveArgs.paintTerminalPoints = 'all';
            curveArgs.points = [310, 180, 420, 280, 580, 130, 600, 140, 650, 210];
            var curveElement3 = new K2.Curve(curveArgs);
            
            curveArgs.ID = "line";
            curveArgs.curveType = "linear";
            curveArgs.paintTerminalPoints = 'all';
            curveArgs.points = [650, 210, 680, 100];
            var curveElement4 = new K2.Curve(curveArgs);
            
            /* curveArgs.ID = "curve_test_5";
            curveArgs.curveType = "hermite";
            curveArgs.points = [680, 100, 700, 110, 720, 160, 760, 88];
            var curveElement5 = new Curve(curveArgs); */
            
            this.ui.addElement(curveElement);
            this.ui.addElement(curveElement2);
            this.ui.addElement(curveElement3);
            this.ui.addElement(curveElement4);
            //ui.addElement(curveElement5);
            
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