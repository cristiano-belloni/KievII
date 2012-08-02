var BandTest = {
    
    name: 'BandTest',
    ui: null,
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        
        bandArgs = {
            ID: "testBand",
            left: 0,
            top : 0,
            height: this.viewHeight,
            width: this.viewWidth,
            onValueSet: function (slot, value) {
                this.ui.refresh();
            }.bind(this),
            color: 'black',
            isListening: true
        };
        
        this.ui.addElement(new K2.Band(bandArgs));
        
        this.ui.setValue ({elementID: 'testBand', slot: 'xOffset', value: 0});
        this.ui.setValue ({elementID: 'testBand', slot: 'yOffset', value: 20});
        this.ui.setValue ({elementID: 'testBand', slot: 'width', value: 100});
        this.ui.setValue ({elementID: 'testBand', slot: 'height', value: 200});
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