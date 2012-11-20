var BarTest = {
    
    name: 'BarTest',
    ui: null,
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        var barArgs = {
            ID: "testBar",
            left: 0,
            top : 0,
            thickness: 8,
            height: this.viewHeight,
            width: this.viewWidth,
            onValueSet: function (slot, value) {
                this.ui.refresh();
            }.bind(this),
            barColor: 'red',
            transparency: 0.5,
            isListening: true
        };
        
        this.ui.addElement(new K2.Bar(barArgs));
        this.ui.setValue ( {elementID: 'testBar',
                            slot: 'barPos',
                            value: [this.viewWidth / 5, 0]});
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