/* The K2 element! */
var K2 = {};

/* Some general-purpose function */
K2.extend = function (subClass, superClass) {
    var F = function() {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    subClass.superclass = superClass.prototype;
    if (superClass.prototype.constructor == Object.prototype.constructor) {
        superClass.prototype.constructor = superClass;
    }
};

K2.clone = function (obj) {
    var copy;
    
    // Handle the 3 simple types, and null or undefined
    if (null === obj || "object" !== typeof obj) return obj;
    
    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    
    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }
    
    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
    
    throw new Error("Unable to copy obj! Its type isn't supported.");
};

/**
 * merge 2 objects into a new object
 * @param   object  obj1
 * @param   object  obj2
 * @return  object  merged object
 */
K2.mergeObject = function(obj1, obj2) {
    var output = {};

    if(!obj2) {
        return obj1;
    }

    for (var prop in obj1) {
        if (prop in obj2) {
            output[prop] = obj2[prop];
        } else {
            output[prop] = obj1[prop];
        }
    }
    return output;
};

// This should fix "console not defined" problem.
if (typeof console === 'undefined') {
    console = {
        log: function(A) {
            var B=false;
            if(B) {
                alert(A);
                }
            }
    };
}