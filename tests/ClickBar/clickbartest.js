var ClickBarTest = {
    
    name: 'ClickBarTest',
    ui: null,
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        
        var clickBarArgs = {
            ID: "testClickBar",
            left : this.viewWidth / 5,
            top : this.viewHeight / 5,
            height: this.viewHeight / 5 * 3,
            width: this.viewWidth / 5,
            onValueSet: function (slot, value) {
                console.log ("Event on slot " + slot + " with value " + value);
                this.ui.refresh();
            }.bind(this),
            color: 'black',
            isListening: true
        };
        
        this.ui.addElement(new K2.ClickBar(clickBarArgs));
        
        clickBarArgs.ID = "testClickBar2";
        clickBarArgs.left += this.viewWidth / 5 + 10;
        
        this.ui.addElement(new K2.ClickBar(clickBarArgs));
        
        this.ui.setValue ({elementID: 'testClickBar', slot: 'barvalue', value: 0.5});
        this.ui.setValue ({elementID: 'testClickBar2', slot: 'barvalue', value: 0.7});
        
        // !VIEWABLEDOCEND            
    },
    
    init: function (canvas) {
    
                                               
        this.viewWidth = canvas.width;
        this.viewHeight = canvas.height;
        
        this.ui = new K2.UI ({type: 'CANVAS2D', target: canvas});
        
        this.main();
        
    }
}