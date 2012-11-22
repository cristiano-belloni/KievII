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
		
		/* These functions don't refresh on callback, because cascade on
		 * connectSlots() is true by deafult */
        var barArgs = {
            ID: "testBar",
            left: this.barWOffset,
            top : 0,
            thickness: 8,
            height: Math.floor (this.viewHeight / 1),
            width: this.barWidth,
            barColor: 'red',
            transparency: 0.5,
            isListening: true
        };
        
        var gaugeLabelArgs = {
            ID: 'gaugeLabel',
            top: 10,
            left: 20,
            width: 200,
            height: 48,
            textColor: "white",
            objParms: {
                font: "12pt Arial",
                textBaseline: "top",
                textAlign: "left"
            }
        };
        
        this.ui.addElement(new K2.Bar(barArgs));
        this.ui.addElement(new K2.Gauge(gaugeArgs));
        this.ui.addElement(new K2.Label (gaugeLabelArgs));
        
		
        var filter_fromGauge = function(value, connDetails) {				
			// connDetails.sender: testGauge connDetails.receiver: testBar
			var barValue = ConnectTest.barWidth *  value;
            return [barValue, 0];
	   };
	   
       var filter_fromBar = function(value, connDetails) {										
			// connDetails.sender: testBar connDetails.receiver: testGauge
			var gaugeValue = value[0] / ConnectTest.barWidth;
            return gaugeValue;
		};
		
		var filter_gaugeLabel = function(value, connDetails) {
            // connDetails.sender: testGauge connDetails.receiver: gaugeLabel                               
            var numberValue = new Number(value * 100);
            var labelValue = numberValue.toPrecision(3);
            return labelValue;
       };
			
        /* Set the connection chain */
        this.ui.connectSlots("testGauge", 'gaugevalue', "gaugeLabel", 'labelvalue', {
            'callback' : filter_gaugeLabel
        });
        this.ui.connectSlots("testGauge", 'gaugevalue', "testBar", 'barPos', {
            'callback' : filter_fromGauge
        });
        this.ui.connectSlots("testBar", 'barPos', "testGauge", 'gaugevalue', {
            'callback' : filter_fromBar
        });
        
        /* This starts the connection chain */
		this.ui.setValue({
            elementID : 'testGauge',
            slot : 'gaugevalue',
            value : 0.146
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