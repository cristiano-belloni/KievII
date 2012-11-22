var ClickBarTest = {
    
    name: 'ClickBarTest',
    ui: null,
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        var barWidth =  Math.floor(this.viewWidth / 80 * 8);
        var spaceWidth = Math.floor(this.viewWidth / 90 * 2);
        
        var clickBarArgs = {
            ID: "testClickBar",
            left : 0,
            top : this.viewHeight / 5,
            height: this.viewHeight / 5 * 3,
            width: barWidth,
            onValueSet: function (slot, value) {
                this.ui.refresh();
            }.bind(this),
            isListening: true
        };
        
        for (var i = 0; i < 8; i += 1) {
            clickBarArgs.ID = "testClickBar" + i;
            clickBarArgs.left = (i * barWidth + (i+1) * spaceWidth);
            this.ui.addElement(new K2.ClickBar(clickBarArgs));
            this.ui.setValue ({elementID: clickBarArgs.ID, slot: 'barvalue', value: (0.1 * i) + 0.1});
        }        
        // !VIEWABLEDOCEND            
    },
    
    init: function (canvas) {
    
                                               
        this.viewWidth = canvas.width;
        this.viewHeight = canvas.height;
        
        this.ui = new K2.UI ({type: 'CANVAS2D', target: canvas});
        
        this.main();
        
    }
}