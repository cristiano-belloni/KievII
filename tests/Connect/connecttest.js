var ConnectTest = {

    name : 'ConnectTest',
    ui : null,

    main : function() {
        
        this.gaugeWOffset = Math.floor(this.viewWidth / 24); // Gauge width offset: 1/24 width
        this.gaugeDim = Math.floor(this.viewWidth / 4 - this.gaugeWOffset * 2); // gauge dimensions : 5/24 width
        this.gaugeHOffset = (this.viewHeight - this.gaugeDim) / 2; 
        this.gaugeThickness = Math.floor(this.gaugeDim / 4);
        this.barWOffset = this.gaugeWOffset * 2 + this.gaugeDim; // Bar width offset: 3/4 width
        this.barWidth = this.viewWidth - this.barWOffset;
        
        var gaugeArgs = {
            ID : "testGauge",
            left : this.gaugeWOffset,
            top : this.gaugeHOffset,
            height : this.gaugeDim,
            width : this.gaugeDim,
            thickness: this.gaugeThickness,
            onValueSet : function(slot, value) {
                this.ui.refresh();
            }.bind(this),
            isListening : true
        };
		
        var barArgs = {
            ID: "testBar",
            left: this.barWOffset,
            top : 0,
            thickness: 8,
            height: Math.floor (this.viewHeight / 1),
            width: this.barWidth,
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
                            value: [0]});

        this.ui.addElement(new K2.Gauge(gaugeArgs));
        this.ui.setValue({
            elementID : 'testGauge',
            slot : 'gaugevalue',
            value : 0
        });
		
        var filter_fromGauge = function(value, connDetails) {
			
			if (connDetails.sender === 'testGauge') {								
				// sender: gauge receiver: bar
				var barValue = ConnectTest.barWidth *  value;
	            return [barValue, 0];
			}
	   };
	   
       var filter_fromBar = function(value, connDetails) {			
			if (connDetails.sender === 'testBar') {								
				// sender: bar receiver: gauge
				var gaugeValue = value[0] / ConnectTest.barWidth;
	            return gaugeValue;
			}
		};
			
        this.ui.connectSlots("testGauge", 'gaugevalue', "testBar", 'barPos', {
            'callback' : filter_fromGauge
        });
        this.ui.connectSlots("testBar", 'barPos', "testGauge", 'gaugevalue', {
            'callback' : filter_fromBar
        });
		
        this.ui.refresh();

    },

    init : function(canvas) {

        this.viewWidth = canvas.width;
        this.viewHeight = canvas.height;

        this.ui = new K2.UI({
            type : 'CANVAS2D',
            target : canvas
        });

        this.main();

    }
}