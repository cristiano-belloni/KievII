var GaugeTest = {

    name : 'GaugeTest',
    ui : null,

    main : function() {

        // !VIEWABLEDOCSTART
        var gaugeArgs = {
            ID : "testGauge",
            left : Math.floor(this.viewWidth * 0.5 - this.viewWidth * 0.2),
            top : Math.floor(this.viewHeight * 0.5 - this.viewHeight * 0.2),
            height : 120,
            width : 120,
            onValueSet : function(slot, value) {
                this.ui.refresh();
            }.bind(this),
            isListening : true
        };

        this.ui.addElement(new K2.Gauge(gaugeArgs));
        this.ui.setValue({
            elementID : 'testGauge',
            slot : 'gaugevalue',
            value : 0.2
        });
        this.ui.refresh();
        // !VIEWABLEDOCEND
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