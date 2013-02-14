var OSCHandlerTest = {

    init: function () {
        
        var proxyServer = {host: 'localhost', port: 1488};
        var udpHosts = [{host: 'localhost', port: 8806}];
        
        var handler = new K2.OSCHandler (proxyServer, udpHosts);
        
        /* localclient = {clientID, oscCallback, isListening} */
        var client1 = handler.registerClient ({clientID : "client1",
                                               oscCallback : function (message) {
                                                   console.log ("client1 received message: ", message);
                                               }
                                               });  
        var client2 = handler.registerClient ({clientID : "client2",
                                               oscCallback : function (message) {
                                                   console.log ("client2 received message: ", message);
                                               }
                                               });
        var client3 = handler.registerClient ({clientID : "client3",
                                                oscCallback : function (message) {
                                                    console.log ("client3 received message: ", message);
                                                }
                                            });
        var i = 0;
        
         var sendMessages = function ()  {
            var msg1 = new K2.OSC.Message('/lp/dest/1', 'oscTest', i, 55, 7.88787);
            var msg2 = new K2.OSC.Message('/lp/dest/2', 'oscTest', i, 55, 7.88787);
            var msg3 = new K2.OSC.Message('/lp/dest/3', 'oscTest', i, 55, 7.88787);
            client1.sendOSC(msg1);
            client2.sendOSC(msg2);
            client3.sendOSC(msg3);
            i+=1;
        };
        
        setInterval(sendMessages, 3000);
        
        
    }
    
}