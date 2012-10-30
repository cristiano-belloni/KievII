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
                console.log ("Event on slot " + slot + " with value " + value);
                this.ui.refresh();
            }.bind(this),
            color: 'black',
            transparency: 0.5,
            isListening: true,
            /* move: 'y' */
        };
        
        this.ui.addElement(new K2.Area(areaArgs));
        
        this.ui.setValue ({elementID: 'testArea', slot: 'xOffset', value: 0});
        this.ui.setValue ({elementID: 'testArea', slot: 'yOffset', value: 20});
        this.ui.setValue ({elementID: 'testArea', slot: 'width', value: 100});
        this.ui.setValue ({elementID: 'testArea', slot: 'height', value: 200});
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