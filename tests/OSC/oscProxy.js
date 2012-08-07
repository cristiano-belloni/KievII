var oscProxy = {

    init: function () {
        var OSCserver = new Server();
        var OSCclient = new Client();
        var udpData = [{host: 'localhost', port: 8806}];
        var socket = io.connect('http://localhost:1488');
        socket.on('admin', function (data) {
            console.log(data);
            
            // Send the host list to the server
            socket.emit ('admin', {type: 'udphosts', content: udpData});
            
            //Send a test message to the server, to be repeated to the hosts in the host list.
            var msg = new Message('/lp/dest', 'oscTest', 22, 55, 7.88787);
            var binaryMsg = OSCclient.send (msg);
            socket.emit('osc', { osc: binaryMsg });
            
        });
        socket.on ('osc', function (data) {
            
            // OSC is received from the server
            // Transform it in an array
            var oscArray =  Array.prototype.slice.call(data.osc, 0);
            console.log ("received osc from the server: " + oscArray);
            
            // Try to decode it
            var received = OSCserver.receive (oscArray);
            console.log ("decoded OSC = " + received);
            
        });
    }
    
}