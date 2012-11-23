var serverPorts = {
    K2Side : 1488,
    ControllerSide: 1489
};

var udpHosts = [];

// UDP server, listens to controllers.
var dgram = require("dgram");
var UDPserver = dgram.createSocket("udp4");
// socket.io, listening to K2
var K2IO = require('socket.io').listen(serverPorts.K2Side);

// Got messages on the server
UDPserver.on("message", function (msg, rinfo) {
  console.log("server got: " + msg + " from " +
    rinfo.address + ":" + rinfo.port);
    // Send them to the K2 clients
    console.log ("emitting on osc: " + msg);
    K2IO.sockets.emit('osc', {osc: msg});
});

UDPserver.on("listening", function () {
  var address = UDPserver.address();
  console.log("UDP server listening on " +
      address.address + ":" + address.port);
});

UDPserver.bind(serverPorts.ControllerSide);


K2IO.sockets.on('connection', function (socket) {
    
  // Tell who we are and our version
  socket.emit('admin', { id: 'K2OSCSERVER', version: 0.1});
  console.log ("Emitted ID and version on the admin channel")
  
  // K2 sent us OSC data
  socket.on('osc', function (data) {
    console.log ("Received data on the 'osc' channel: " + data);
    // Send data on each one of the UDP hosts
    var message = new Buffer(data.osc, 'binary');
    var client = dgram.createSocket("udp4");
    for (var i = 0; i < udpHosts.length; i+=1) {
        console.log ("Sending message to " + udpHosts[i].host + ":" + udpHosts[i].port);
        client.send(message, 0, message.length, udpHosts[i].port, udpHosts[i].host, function(err, bytes) {
            console.log ("err: ", err, "bytes: ", bytes);
            //client.close();
        });
    }
  });
  
  // K2 sent us admin data
  socket.on('admin', function (data) {
    console.log ("Received data on the 'admin' channel of type " + data.type);
    switch(data.type)
    {
    // UDP hosts on which we replicate the OSC messages
    case 'udphosts':
      udpHosts = data.content;
      break;
    default:
      console.error ("Unrecognized admin command: " + data.type);
    }
  });
});