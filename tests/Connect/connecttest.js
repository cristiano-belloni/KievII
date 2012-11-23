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
        this.labelFontSize = Math.floor(this.gaugeDim / 5);
        this.labelBarFontSize = this.viewHeight / 3;
        this.labelBarOffset = this.barWOffset;
        
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
            thickness: Math.floor(this.barWidth / 20),
            height: Math.floor (this.viewHeight / 1),
            width: this.barWidth,
            barColor: 'red',
            transparency: 0.5,
            isListening: true
        };
        
        var gaugeLabelArgs = {
            ID: 'gaugeLabel',
            top: Math.floor(this.viewHeight / 2) - this.labelFontSize,
            left: this.gaugeWOffset + this.labelFontSize * 1.2,
            width: this.gaugeDim,
            height: this.labelFontSize,
            textColor: "white",
            transparency: 0.8,
            objParms: {
                font: this.labelFontSize + "pt Arial",
                textBaseline: "top",
                textAlign: "left"
            }
        };
        
        var barLabelArgs = {
            ID: 'barLabel',
            top: this.viewHeight / 10 - this.labelBarFontSize,
            left: this.labelBarOffset,
            width: 200,
            height: this.labelBarFontSize,
            textColor: "white",
            transparency: 0.8,
            objParms: {
                font: this.labelBarFontSize + "pt Arial",
                textBaseline: "top",
                textAlign: "left"
            }
        };
        
        this.ui.addElement(new K2.Bar(barArgs));
        this.ui.addElement(new K2.Gauge(gaugeArgs));
        this.ui.addElement(new K2.Label (gaugeLabelArgs));
        this.ui.addElement(new K2.Label (barLabelArgs));
        
		
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
       
       var filter_barLabel = function(value, connDetails) {
            // connDetails.sender: testBar connDetails.receiver: barLabel                               
            var numberValue = value[0];
            var labelValue = numberValue.toPrecision(3);
            labelValue = numberValue.toFixed(0) + '/' + Math.round(ConnectTest.barWidth) + ' pixels';
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
        this.ui.connectSlots("testBar", 'barPos', "barLabel", 'labelvalue', {
            'callback' : filter_barLabel
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