var OSCTest = {
    
    name: 'OSCTest',
    ui1: null,
    ui2: null,
    canvasNumber: 0,
    canvasArr: [],
    
    init: function () {
        
        for (var i = 0; i < arguments.length; i+=1) {
            this.canvasArr.push(arguments[i]);
        }
        if (this.canvasArr.length < 2) {
            console.log ("Re-call init(), " + (2 - this.canvasArr.length) + ' arguments to go');
            return;
        }
        
        this.viewWidth1 = this.canvasArr[0].width;
        this.viewHeight1 = this.canvasArr[0].height;
        this.viewWidth2 = this.canvasArr[1].width;
        this.viewHeight2 = this.canvasArr[1].height;
        
        this.proxyServer = {host: 'localhost', port: 1488};
        this.udpHosts = [{host: 'localhost', port: 8806}];
        
        this.handler = new K2.OSCHandler (this.proxyServer, this.udpHosts);
        
        /* localclient = {clientID, oscCallback, isListening} */
        this.localClient1 = this.handler.registerClient ({clientID : "client1",
                                               oscCallback : function (message) {
                                                   console.log ("client1 received message: ", message);
                                                   // From curve to clickbar
                                                   // Message is like: ["/click/set/", 2, 0.4536423981189728]
                                                   var dest = message[0];
                                                   if (dest === '/click/set/') {
                                                       var elNumber = message[1];
                                                       var clValue = message[2];
                                                       OSCTest.ui1.setValue ({  slot: 'barvalue', value: clValue,
                                                                                elementID: 'testClickBar' + elNumber,
                                                                                fireCallback:false  });
                                                       OSCTest.ui1.refresh();
                                                   } 
                                               }
                                               });  
        this.localClient2 = this.handler.registerClient ({clientID : "client2",
                                               oscCallback : function (message) {
                                                   console.log ("client2 received message: ", message);
                                                   // From clickbar to curve 
                                                   // Message is like: ["/curve/set/", 0, 0.3013245165348053]
                                                   var dest = message[0];
                                                   if (dest === '/curve/set/') {
                                                       var elNumber = message[1];
                                                       var cuValue = message[2];
                                                       var pointValue = (( 1 - cuValue ) * OSCTest.viewHeight2);
                                                       if (!OSCTest.ui2.isElement('testCurve')) {
                                                           console.log ('Curve element not initialized yet, this is normal');
                                                           return;
                                                       }
                                                       var curveElement = OSCTest.ui2.getElement('testCurve');
                                                       var oldPoints =curveElement.values.points; 
                                                       oldPoints[elNumber][1] = pointValue;
                                                       OSCTest.ui2.setValue ({  slot: 'points', value: oldPoints,
                                                                                elementID: 'testCurve',
                                                                                fireCallback: false  });
                                                       OSCTest.ui2.refresh();
                                                   }
                                               }
                                               });
        
        this.ui1 = new K2.UI ({type: 'CANVAS2D', target: this.canvasArr[0]});
        this.ui2 = new K2.UI ({type: 'CANVAS2D', target: this.canvasArr[1]});
        
        var barWidth =  Math.floor(this.viewWidth1 / 40 * 8);
        var spaceWidth = Math.floor(this.viewWidth1 / 50 * 2);
        
        // clickBar template
        var clickBarArgs = {
            ID: "",
            left : 0,
            top : this.viewHeight1 / 5,
            height: this.viewHeight1 / 5 * 3,
            width: barWidth,
            onValueSet: function (slot, value, element) {
                var msg = new K2.OSC.Message('/curve/set/', parseInt(element['testClickBar'.length], 10), value);
                this.localClient1.sendOSC(msg);
                this.ui1.refresh();
            }.bind(this),
            isListening: true
        };

        var initialPoints = [0.4, 0.6, 0.2, 0.4]; 
        
        // Add 4 clickBars
        for (var i = 0; i < 4; i +=1) {
            clickBarArgs.ID = 'testClickBar' + i;  
            clickBarArgs.left = (i * barWidth + (i+1) * spaceWidth);
            this.ui1.addElement(new K2.ClickBar(clickBarArgs));
            this.ui1.setValue({
                elementID : clickBarArgs.ID,
                slot : 'barvalue',
                value : initialPoints[i]
            });
        }
        
        var curveArgs = {
            ID: "testCurve",
            top: 0,
            left: 0,
            width: this.viewWidth2,
            height: this.viewHeight2,
            curveType: "bezier",
            curveColor: "SteelBlue",
            thickness: this.viewWidth2 * 0.01,
            paintTerminalPoints: 'all',
            points: [this.viewWidth2 * 0.1 ,   this.viewHeight2 - this.viewHeight2 * initialPoints[0],
                     this.viewWidth2 * 0.3,    this.viewHeight2 - this.viewHeight2 * initialPoints[1],
                     this.viewWidth2 * 0.6,    this.viewHeight2 - this.viewHeight2 * initialPoints[2],
                     this.viewWidth2 * 0.9,    this.viewHeight2 - this.viewHeight2 * initialPoints[3],
                     ],
            onValueSet: function (slot, value, element) {
                if (slot === 'points') {
                    for (var i = 0; i < value.length; i+=1) {
                        var clValue = ((this.viewHeight2 - value[i][1]) / this.viewHeight2);
                        if (isNaN(clValue)) {
                            debugger;
                        }
                        console.log (value[i][1], this.viewHeight2, clValue);
                        var msg = new K2.OSC.Message('/click/set/', i, clValue);
                        this.localClient2.sendOSC(msg);
                    }
                }
                this.ui2.refresh();
            }.bind(this),
            isListening: true
        };
        
        this.ui2.addElement(new K2.Curve(curveArgs));
        
        this.ui1.refresh();
        this.ui2.refresh();
        
    }
    
}