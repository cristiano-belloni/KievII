K2.OSCClient = function (localClient, oscHandler) {
    
    this.oscHandler = oscHandler;
    this.clientID = localClient.clientID;
    this.oscCallback = localClient.oscCallback;
    this.isListening =  localClient.isListening || true;
};

K2.OSCClient.prototype.sendOSC = function (oscMessage, args) {
    // Encode it
    var binaryMsg = this.oscHandler.OSCEncoder.encode(oscMessage);
    var flags = args;
    
    if (typeof args === 'undefined') {
        flags = {sendRemote : true, sendLocal : true};
    }
    if (flags.sendRemote !== false) {
        if (this.oscHandler.proxyOK === true) {
            this.oscHandler.socket.emit('osc', { osc: binaryMsg });
        }
    }
    if (flags.sendLocal !== false) {
        this.oscHandler.sendLocalMessage.apply (this.oscHandler, [binaryMsg, this.clientID]);
    }
};

K2.OSCHandler = function (proxyServer, udpServers) {

    this.localClients = {};
    this.OSCDecoder = new K2.OSC.Decoder();
    this.OSCEncoder = new K2.OSC.Encoder();
    this.udpServers = udpServers || null;
    this.proxyServer = proxyServer || null;
    this.proxyOK = false;
    this.proxyConnected = false;
    
    if (this.proxyServer !== null) {
        
        try {
            this.socket = io.connect('http://' + this.proxyServer.host + ':' + this.proxyServer.port);
        }
        catch (e) {
            console.error ("io.connect failed. No proxy server?");
            return;
        }
        this.socket.on('admin', function (data) {
            
            // TODO check the version and the ID
            console.log("Received an admin message: ", data);
            // Let's assume everything is OK
            this.proxyOK = true;
            
            // Send the host list to the server, if any
            if (this.udpServers !== null) {
                this.socket.emit ('admin', {type: 'udphosts', content: this.udpServers});
            }
            
        }.bind(this));
        
        this.socket.on ('osc', function (data) {
            
            // OSC is received from the server
            // Transform it in an array
            var oscArray =  Array.prototype.slice.call(data.osc, 0);
            console.log ("received osc from the server: " + oscArray);
            
            // Send it to the local clients
            this.sendLocalMessage (oscArray);
        }.bind(this));
        
        this.socket.on ('disconnect', function (data) {
            
            console.log ("socket disconnected");
            this.proxyConnected = false;
            this.proxyOK = false;
            
        }.bind(this));
        
        this.socket.on ('connect', function (data) {
            
            console.log ("socket connected");
            this.proxyConnected = true;
            
        }.bind(this));
    }
};
/* localclient = {clientID, oscCallback, isListening} */
K2.OSCHandler.prototype.registerClient = function (localClient) {
    this.localClients[localClient.clientID] = new K2.OSCClient (localClient, this);
    return this.localClients[localClient.clientID];
};

K2.OSCHandler.prototype.unregisterClient = function (clientID) {
    delete this.localClients[clientID];
};

K2.OSCHandler.prototype.sendLocalMessage = function (oscMessage, clientID) {
    // Try to decode it
    var received = this.OSCDecoder.decode (oscMessage);
    console.log ("decoded OSC = " + received);
    
    // Send it to the callbacks, except for the clientID one
    for (var client in this.localClients) {
        if (this.localClients.hasOwnProperty(client)) {
            var currClient = this.localClients[client];
            if ((currClient.clientID !== clientID) && (currClient.isListening)) {
                if (typeof currClient.oscCallback === 'function') {
                    currClient.oscCallback(received);
                }
            }
        }
    }
};
