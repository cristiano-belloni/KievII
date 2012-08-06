var oscEncDec = {
    init: function (){
        var OSCclient = new Client();
        var OSCserver = new Server();
        var msg = new Message('/lp/dest', 'oscTest');
        var binaryMsg = OSCclient.send (msg);
        var received = OSCserver.receive (binaryMsg);
        console.log ("received = " + received);
    }
}