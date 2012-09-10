var GaugeTest = {
    
    name: 'GaugeTest',
    ui: null,
    
    redrawRandom: function () {
        var newValue = Math.random();
        GaugeTest.ui.setValue ({elementID: 'testGauge', slot: 'gaugevalue', value: newValue});
        newValue = Math.random(); 
        GaugeTest.ui.setValue ({elementID: 'testGauge', slot: 'midgaugevalue', value: newValue});
    },
    
    main: function () {
        
        // !VIEWABLEDOCSTART
        
        var gaugeArgs = {
            ID: "testGauge",
            left: Math.floor (this.viewWidth / 2 - this.viewWidth / 5),
            top : Math.floor (this.viewHeight / 2 - this.viewHeight / 5),
            height: 120, //Math.floor(this.viewHeight / 5),
            width: 120, //Math.floor(this.viewWidth / 5),
            onValueSet: function (slot, value) {
                console.log ("Event on slot " + slot + " with value " + value);
                this.ui.refresh();
            }.bind(this),
            /* transparency: 0.5, */
            isListening: true
        };
        
        this.ui.addElement(new K2.Gauge(gaugeArgs));
        
        //var loop = setInterval (this.redrawRandom, 3000);
        this.redrawRandom();
        
        // !VIEWABLEDOCEND            
    },
    
    init: function (canvas) {
    
                                               
        this.viewWidth = canvas.width;
        this.viewHeight = canvas.height;
        
        this.ui = new K2.UI ({type: 'CANVAS2D', target: canvas});
        
        this.main();
        
    }
}