var AreaTest = {
    
    name: 'AreaTest',
    ui: null,
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        
        areaArgs = {
            ID: "testArea",
            left: 0,
            top : 0,
            thickness:8,
            height: this.viewHeight,
            width: this.viewWidth,
            onValueSet: function (slot, value) {
                this.ui.refresh();
            }.bind(this),
            color: 'orange',
            borderColor: 'crimson',
            transparency: 0.9,
            drag: {top: true, bottom: true, right: true, left: true},
            isListening: true,
        };
        
        this.ui.addElement(new K2.Area(areaArgs));
        
        var w = this.viewWidth * 0.2, h = this.viewHeight * 0.2;
        var x = w, y = h * 2;
         
        this.ui.setValue ({elementID: 'testArea', slot: 'xOffset', value: x});
        this.ui.setValue ({elementID: 'testArea', slot: 'yOffset', value: y});
        this.ui.setValue ({elementID: 'testArea', slot: 'width', value: w});
        this.ui.setValue ({elementID: 'testArea', slot: 'height', value: h});
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