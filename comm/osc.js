K2.OSC = {};

////////////////////
// OSC Message
////////////////////

K2.OSC.Message = function (address) {
    this.address = address;
    this.typetags = '';
    this.args = [];

    for (var i = 1; i < arguments.length; i++) {
        var arg = arguments[i];
        switch (typeof arg) {
        case 'object':
            if (arg.typetag) {
                this.typetags += arg.typetag;
                this.args.push(arg);
            } else {
                throw new Error("don't know how to encode object " + arg);
            }
            break;
        case 'number':
            if (Math.floor(arg) == arg) {
                this.typetags += K2.OSC.TInt.prototype.typetag;
                this.args.push(new K2.OSC.TInt(Math.floor(arg)));
            } else {
                this.typetags += K2.OSC.TFloat.prototype.typetag;
                this.args.push(new K2.OSC.TFloat(arg));
            }
            break;
        case 'string':
            this.typetags += K2.OSC.TString.prototype.typetag;
            this.args.push(new K2.OSC.TString(arg));
            break;
        default:
            throw new Error("don't know how to encode " + arg);
        }
    }
};

K2.OSC.Message.prototype = {
    toBinary: function () {
        var address = new K2.OSC.TString(this.address);
        var binary = [];
        var tempArray =  [];
        tempArray = address.encode();
        binary = binary.concat(tempArray);
        if (this.typetags) {
            var typetags = new K2.OSC.TString(',' + this.typetags);
            tempArray = typetags.encode();
            binary = binary.concat(tempArray);
            for (var i = 0; i < this.args.length; i++) {
                tempArray = this.args[i].encode();
                binary = binary.concat(tempArray);
            }
        }
        return binary;
    }
};

// Bundle does not work yet (uses message.append, which no longer exists)
K2.OSC.Bundle = function (address, time) {
    K2.OSC.Message.call(this, address);
    this.timetag = time || 0;
};

K2.OSC.Bundle.prototype.append = function (arg) {
    var binary;
    if (arg instanceof Message) {
        binary = new K2.OSC.TBlob(arg.toBinary());
    } else {
        var msg = new K2.OSC.Message(this.address);
        if (typeof(arg) == 'Object') {
            if (arg.addr) {
                msg.address = arg.addr;
            }
            if (arg.args) {
                msg.append.apply(arg.args);
            }
        } else {
            msg.append(arg);
        }
        binary = new K2.OSC.TBlob(msg.toBinary());
    }
    this.message += binary;
    this.typetags += 'b';
};

K2.OSC.Bundle.prototype.toBinary = function () {
    var binary = new K2.OSC.TString('#bundle');
    binary = binary.concat(new K2.OSC.TTimeTag(this.timetag));
    binary = binary.concat(this.message);
    return binary;
};

////////////////////
// OSC Encoder
////////////////////

K2.OSC.Encoder = function () {
};

K2.OSC.Encoder.prototype = {
    encode: function () {
        var binary;
        if (arguments[0].toBinary) {
            binary = arguments[0].toBinary();
        } else {
            // cheesy
            var message = {};
            K2.OSC.Message.apply(message, arguments);
            binary = K2.OSC.Message.prototype.toBinary.call(message);
        }
        return binary;
    }
};

////////////////////
// OSC Message encoding and decoding functions
////////////////////

K2.OSC.ShortBuffer = function (type, buf, requiredLength)
{
    this.type = "ShortBuffer";
    var message = "buffer [";
    for (var i = 0; i < buf.length; i++) {
        if (i) {
            message += ", ";
        }
        message += buf.charCodeAt(i);
    }
    message += "] too short for " + type + ", " + requiredLength + " bytes required";
    this.message = message;
};

K2.OSC.TString = function (value) { this.value = value; };
K2.OSC.TString.prototype = {
    typetag: 's',
    decode: function (data) {
        var end = 0;
        while (data[end] && end < data.length) {
            end++;
        }
        if (end == data.length) {
            throw Error("OSC string not null terminated");
        }
        
        //TODO
        //http://nodejs.org/docs/v0.4.7/api/buffers.html#buffer.toString
        //this.value = data.toString('ascii', 0, end);
        
        // This works in the browser
        this.value  = String.fromCharCode.apply(null, data.slice(0,end));
        
        var nextData = parseInt(Math.ceil((end + 1) / 4.0) * 4, 10);
        return data.slice(nextData);
    },
    encode: function () {
        var len = Math.ceil((this.value.length + 1) / 4.0, 10) * 4;
        var tempBuf = new Array (len);
        return Struct.PackTo('>' + len + 's', tempBuf, 0, [ this.value ]);
    }
};

K2.OSC.TInt = function (value) { this.value = value; };
K2.OSC.TInt.prototype = {
    typetag: 'i',
    decode: function (data) {
        if (data.length < 4) {
            throw new ShortBuffer('int', data, 4);
        }

        this.value = Struct.Unpack('>i', data.slice(0, 4))[0];
        return data.slice(4);
    },
    encode: function () {
        var tempArray = new Array(4);
        return Struct.PackTo('>i', tempArray, 0, [ this.value ]);
    }
};

K2.OSC.TTime = function (value) { this.value = value; };
K2.OSC.TTime.prototype = {
    typetag: 't',
    decode: function (data) {
        if (data.length < 8) {
            throw new ShortBuffer('time', data, 8);
        }
        this.value = Struct.Unpack('>LL', data.slice(0, 8))[0];
        return data.slice(8);
    },
    encode: function (buf, pos) {
        return Struct.PackTo('>LL', buf, pos, this.value);
    }
};

K2.OSC.TFloat = function (value) { this.value = value; };
K2.OSC.TFloat.prototype = {
    typetag: 'f',
    decode: function (data) {
        if (data.length < 4) {
            throw new ShortBuffer('float', data, 4);
        }

        this.value = Struct.Unpack('>f', data.slice(0, 4))[0];
        return data.slice(4);
    },
    encode: function () {
        var tempArray = new Array(4);
        return Struct.PackTo('>f', tempArray, 0, [ this.value ]);
    }
};

K2.OSC.TBlob = function (value) { this.value = value; };
K2.OSC.TBlob.prototype = {
    typetag: 'b',
    decode: function (data) {
        var length = Struct.Unpack('>i', data.slice(0, 4))[0];
        var nextData = parseInt(Math.ceil((length) / 4.0) * 4, 10) + 4;
        this.value = data.slice(4, length + 4);
        return data.slice(nextData);
    },
    encode: function (buf, pos) {
        var len = Math.ceil((this.value.length) / 4.0, 10) * 4;
        return Struct.PackTo('>i' + len + 's', buf, pos, [len, this.value]);
    }
};

K2.OSC.TDouble = function (value) { this.value = value; };
K2.OSC.TDouble.prototype = {
    typetag: 'd',
    decode: function (data) {
        if (data.length < 8) {
            throw new ShortBuffer('double', data, 8);
        }
        this.value = Struct.Unpack('>d', data.slice(0, 8))[0];
        return data.slice(8);
    },
    encode: function (buf, pos) {
        return Struct.PackTo('>d', buf, pos, [ this.value ]);
    }
};

// for each OSC type tag we use a specific constructor function to decode its respective data
K2.OSC.tagToConstructor = { 'i': function () { return new K2.OSC.TInt(); },
                         'f': function () { return new K2.OSC.TFloat(); },
                         's': function () { return new K2.OSC.TString(); },
                         'b': function () { return new K2.OSC.TBlob(); },
                         'd': function () { return new K2.OSC.TDouble(); } };
                         
K2.OSC.decodeBundle = function (data) {
    
    var bundle = [];
    var bundleElement = {time: null, args: []};
    
    // Decode the time tag
    var timeTag = new K2.OSC.TTime();
    data = timeTag.decode(data);
    bundleElement.time = timeTag.value;
    
    while (data.length > 0) { 
        // Get the data length
        var dataLen = new K2.OSC.TInt();
        data = dataLen.decode(data);
        
        // Decode the next message 
        var message = K2.OSC.decode(data.slice(0, dataLen.value));
        
        // push it into the bundleElement
        bundleElement.args.push(message);
        
        // advance in the data array
        data = data.slice(dataLen.value);
    }
    bundle.push(bundleElement);
    return bundle;
};

K2.OSC.decode = function (data) {
    // this stores the decoded data as an array
    var message = [];

    // we start getting the <address> and <rest> of OSC msg /<address>\0<rest>\0<typetags>\0<data>
    var address = new K2.OSC.TString();
    data = address.decode(data);

    message.push(address.value);
    
    if (address.value === "#bundle") {
        // A bundle was detected, let's parse it
        return K2.OSC.decodeBundle (data);
    }

    // if we have rest, maybe we have some typetags... let see...
    if (data.length > 0) {
        // now we advance on the old rest, getting <typetags>
        var typetags = new K2.OSC.TString();
        data = typetags.decode(data);
        typetags = typetags.value;
        // so we start building our message list

        if (typetags[0] != ',') {
            throw "invalid type tag in incoming OSC message, must start with comma";
        }
        for (var i = 1; i < typetags.length; i++) {
            var constructor = K2.OSC.tagToConstructor[typetags[i]];
            if (!constructor) {
                throw "Unsupported OSC type tag " + typetags[i] + " in incoming message";
            }
            var argument = constructor();
            data = argument.decode(data);
            message.push(argument.value);
        }
    }

    return message;
};

////////////////////
// OSC Decoder
////////////////////

K2.OSC.Decoder = function() {
    
    
};

K2.OSC.Decoder.prototype.decode = function (msg) {
    
    // we decode the message getting a beautiful array with the form:
    // [<address>, <typetags>, <values>*]
    var decoded = K2.OSC.decode(msg);
    try {
        if (decoded) {
            return decoded;
        }
    }
    catch (e) {
        console.log("can't decode incoming message: " + e.message);
    }
};
