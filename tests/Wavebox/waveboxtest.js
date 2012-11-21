var WaveboxTest = {

    name : 'WaveboxTest',
    ui : null,

    main : function() {

        // !VIEWABLEDOCSTART
        var waveboxArgs = {
            ID : "testWavebox",
            left : 0,
            top : 0,
            height : this.viewHeight,
            width : this.viewWidth,
            waveColor: '#CC0000',
            transparency: 0.8,
            onValueSet : function(slot, value) {
                this.ui.refresh();
            }.bind(this),
            isListening : true
        };
        
        var signalArray = [];
        for( var i = 0; i < this.viewWidth * 8; i++ ) {
            signalArray[i] = 0.5 * Math.cos(441 * i) * 0.9 * K2.MathUtils.linearRange(0, 1, -1, 1, Math.random());

        }

        this.ui.addElement(new K2.Wavebox(waveboxArgs));
        this.ui.setValue({
            elementID : 'testWavebox',
            slot : 'waveboxsignal',
            value : signalArray
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