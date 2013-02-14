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
K2.UIElement = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.UIElement.prototype.getready = function(args) {

    this.ID = args.ID;

    // This is true if the UIElement wants to be notified
    this.isListening = args.isListening;

    if (typeof (this.isListening) === 'undefined') {
        this.isListening = true;
    }

    if (typeof (this.isListening) !== 'boolean') {
        throw 'Property isListening for element ' + this.ID + ' is not boolean ' + this.isListening;
    }

    // Element is visible by default
    this.isVisible = args.isVisible;

    if (typeof (this.isVisible) === 'undefined') {
        this.isVisible = true;
    }

    if (typeof (this.isVisible) !== 'boolean') {
        throw 'Property isVisible for element ' + this.ID + ' is not boolean ' + this.isVisible;
    }

    // The element boundaries
    this.xOrigin = args.left;
    this.yOrigin = args.top;

    //set the ROI if defined
    if (typeof args.ROILeft !== 'undefined') {
        this.ROILeft = args.ROILeft;
    }
    else {
        this.ROILeft = this.xOrigin;
    }

    if (typeof args.ROITop !== 'undefined') {
        this.ROITop = args.ROITop;
    }
    else {
        this.ROITop = this.yOrigin;
    }

    this.ROIWidth = args.ROIWidth;
    this.ROIHeight = args.ROIHeight;

    // These are to be set later
    this.values = {};
    
    // Object transparency
    this.transparency = args.transparency || 1.0;

    // Specific parameters of the object
    this.objParms = args.objParms;

    // See if there is a callback to call when the value is set
    if (typeof args !== 'undefined') {
        this.onValueSet = args.onValueSet;
    }

};

// Private function
K2.UIElement.prototype.isInROI = function(x, y) {
    // This is the abstract class.
    return false;
};

K2.UIElement.prototype.getValues = function() {
    var tempArray = [],
        i;
    for (i in this.values) {
        if (this.values.hasOwnProperty(i)) {
            tempArray.push(i);
        }
    }
    // Returns the keys.
    return tempArray;
};

K2.UIElement.prototype.getXCoord = function() {
    return this.xOrigin;
};

K2.UIElement.prototype.getYCoord = function() {
    return this.yOrigin;
};

K2.UIElement.prototype.getWidth = function() {
    return this.width;
};

K2.UIElement.prototype.getHeight = function() {
    return this.height;
};

K2.UIElement.prototype.setHeight = function(height) {
    this.height = height;
    if (typeof this.ROIHeight === 'undefined') {
        this.ROIHeight = height;
    }
};

K2.UIElement.prototype.setWidth = function(width) {
    this.width = width;
    if (typeof this.ROIWidth === 'undefined') {
        this.ROIWidth = width;
    }
};

K2.UIElement.prototype.getValue = function(slot) {

    if (typeof this.values[slot] === 'undefined') {
        throw new Error('Slot ' + slot + ' not present or value undefined');
    }
    else {
        return this.values[slot];
    }
};

// Setters
K2.UIElement.prototype.setValue = function(slot, value) {

    if (typeof this.values[slot] === 'undefined') {
        throw new Error('Slot ' + slot + ' not present or value undefined');
    }

    if (value === this.values[slot]) {
        // Nothing to do.
        return;
    }

    this.values[slot] = value;


};

K2.UIElement.prototype.setListening = function(isListening) {
     if (typeof isListening === 'boolean') {
        this.isListening = isListening;
     }
     else {
        throw 'Property isListening for element ' + this.ID + ' is not boolean ' + isListening;
    }
};

K2.UIElement.prototype.getListening = function() {
    return this.isListening;
};

K2.UIElement.prototype.refresh = function(engine) {
    var callerFunc = 'call_' + engine.type;
    
    
        if (typeof this[callerFunc] === 'function') {
            this[callerFunc](engine);
        }
    
    else throw ('Element ' + this.ID + ' ' + callerFunc + ' is not a function. Its type is ' + typeof this[callerFunc]);
};

// Type-specific functions
K2.UIElement.prototype.call_CANVAS2D = function (engine) {
    
    var refreshFunc = 'refresh_' + engine.type;
    
    // Stuff every CANVAS2D element must do    
    engine.context.save();
    engine.context.globalAlpha = this.transparency;
    if (typeof this[refreshFunc] === 'function') {
        // Call the specific implementation
        this[refreshFunc](engine);
    }
    else {
        throw ('Element ' + this.ID + ' ' + refreshFunc + ' is not a function. Its type is ' + typeof this[refreshFunc]);
    }
    engine.context.restore();
    
};

K2.UIElement.prototype.getID = function() {
    return this.ID;
};

K2.UIElement.prototype.setDrawClass = function(drawClass) {
    this.drawClass = drawClass;
};

K2.UIElement.prototype.setVisible = function(isVisible) {
    if (typeof isVisible === 'boolean') {
        this.isVisible = isVisible;
    }
    else {
        throw 'Property isVisible for element ' + this.ID + ' is not boolean ' + isVisible;
    }

};

K2.UIElement.prototype.getVisible = function() {
    return this.isVisible;
};

K2.UIElement.prototype.setGraphicWrapper = function(wrapper) {
    this.wrapper = wrapper;
};

K2.UI = function(engine, parameters) {
    
    // Engine {type: 'CANVAS2D', target: "target", renderTarget: 'renderTarget', eventTarget: "eventTarget"}

    // <EVENT HANDLING>

	// http://stackoverflow.com/questions/12342438/find-coordinates-of-an-html5-canvas-click-event-with-borders/
	this.getEventPosition = function (e, obj) {
		
		var stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(obj, undefined).paddingLeft, 10) || 0;
		var stylePaddingTop = parseInt(document.defaultView.getComputedStyle(obj, undefined).paddingTop, 10) || 0;
		var styleBorderLeft = parseInt(document.defaultView.getComputedStyle(obj, undefined).borderLeftWidth, 10) || 0;
		var styleBorderTop = parseInt(document.defaultView.getComputedStyle(obj, undefined).borderTopWidth, 10) || 0;
		var html = document.body.parentNode;
		var htmlTop = html.offsetTop;
		var htmlLeft = html.offsetLeft;
		
		
	    var element = obj,
	        offsetX = 0,
	        offsetY = 0,
	        mx, my;
	
	    // Compute the total offset
	    if (element.offsetParent !== undefined) {
	        do {
	            offsetX += element.offsetLeft;
	            offsetY += element.offsetTop;
	        } while ((element = element.offsetParent));
	    }
	
	    // Add padding and border style widths to offset
	    // Also add the <html> offsets in case there's a position:fixed bar
	    offsetX += stylePaddingLeft + styleBorderLeft + htmlLeft;
	    offsetY += stylePaddingTop + styleBorderTop + htmlTop;
	
	    mx = e.pageX - offsetX;
	    my = e.pageY - offsetY;
		
		// this returns in element's css value
		// var cssWidth = window.getComputedStyle (obj, null).getPropertyValue("width");
		// var cssHeight = window.getComputedStyle (obj, null).getPropertyValue("height");
		
		var cssWidth  = obj.offsetWidth;
		var cssHeight = obj.offsetHeight;
		
		var attrWidth = obj.getAttribute("width");
		var attrHeight = obj.getAttribute("height");
		var widthScale = attrWidth / cssWidth;
		var heightScale = attrHeight / cssHeight;
		//console.log ('*** SCALE', widthScale, heightScale);
		
		mx *= widthScale;
		my *= heightScale;
	
	    // We return a simple javascript object (a hash) with x and y defined
	    return {
	        x: mx,
	        y: my
	    };
	};

    // Thanks for these two functions to the noVNC project. You are great.
    // https://github.com/kanaka/noVNC/blob/master/include/util.js#L121

    // Get DOM element position on page
    this.getPosition = function(obj) {
        var x = 0, y = 0;
        if (obj.offsetParent) {
            do {
                x += obj.offsetLeft;
                y += obj.offsetTop;
                obj = obj.offsetParent;
            } while (obj);
        }
        return {'x': x, 'y': y};
    };
    
    // Get mouse event position in DOM element (don't know how to use scale yet).
    /*this.getEventPosition = function(e, obj, aux_e, scale) {

		var evt, docX, docY, pos;

        evt = (e ? e : window.event);
        if (evt.pageX || evt.pageY) {
            docX = evt.pageX;
            docY = evt.pageY;
        } else if (evt.clientX || evt.clientY) {
            docX = evt.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            docY = evt.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }
        else if (typeof aux_e !== 'undefined') {
            docX = aux_e.touches[0].x;
            docY = aux_e.touches[0].y;
        }
        pos = this.getPosition(obj);
        if (typeof scale === 'undefined') {
            scale = 1;
        }
        return {'x': (docX - pos.x) / scale, 'y': (docY - pos.y) / scale};
    };*/
    
    // Event handlers

	// onMouse events
	this.onMouseEvent = function() {
        var that = this;
            return function(evt) {

            var event = evt;
            var type = evt.type;

			var realCoords = that.getEventPosition(event, that.domElement);

			if (type === 'mousedown') {
				that.mouseUp = false;
			}
			else if (type === 'mouseup') {
				that.mouseUp = true;
			}

			if (type === 'mousemove') {
				// Only if the mouse button is still down (This could be incomplete TODO).
                if (that.mouseUp === false) {
                    that.elementsNotifyEvent(realCoords.x, realCoords.y, type);
                }
            }
            //console.log ("About to notify a mouse event of type", type);
            that.elementsNotifyEvent(realCoords.x, realCoords.y, type);
        };
    };

    // hammer.js events
    this.onHammerEvent = function() {
        var that = this;
            return function(evt) {

            var event = evt.originalEvent;
            var type = evt.type;

            var realCoords = that.getEventPosition(event, that.domElement, evt);

            //console.log ("About to notify an Hammer event of type", type);

            that.elementsNotifyEvent(realCoords.x, realCoords.y, type);

        };
    };

    // Note: breakOnFirstEvent works only elements that share the same kind of
    // event handling mechanism (es: buttons with buttons).
    // Notify every element about the event.
    this.elementsNotifyEvent = function(x, y, event) {

        // For every element in Z-index array, in order
        for (var z = this.zMax; z >= this.zMin; z -= 1) {
            // The array has holes.
            if (typeof this.zArray[z] !== 'undefined') {
                for (var k = (this.zArray[z].length - 1); k >= 0; k -= 1) {
                    // If the element wants to be bothered with events
                    if (this.zArray[z][k].getListening()) {
                        // Notify the element, if the element has an handler
                        if (typeof this.zArray[z][k][event] === 'function') {
                            var ret = this.zArray[z][k][event](x, y);

	                        // See if the element changed its value
	                        if (typeof ret !== 'undefined') {
	                            if (ret instanceof Array) {
	                                // An element could change multiple slots of itself.
	                                for (var i = 0; i < ret.length; i += 1) {
	                                    this.setValue({elementID: this.zArray[z][k].ID, slot: ret[i].slot, value: ret[i].value});
	                                }
	                            }
	                            else {
	                                // console.log("UI: Element ", ID, " changed its value on event ", event);
	                                this.setValue({elementID: this.zArray[z][k].ID, slot: ret.slot, value: ret.value});
	                            }

	                            if (this.breakOnFirstEvent === true) {
	                                // One element has answered to an event, return.
	                                return;
	                            }
	                        }
                        }
                    }
                }
            }
        }

    };

    // <END OF EVENT HANDLING>

	// <CONSTRUCTOR>
	var eventTarget = engine.eventTarget || engine.target;
	var renderTarget = engine.renderTarget || engine.target;
    
    this.domElement = eventTarget;
    
    var isEventSupported = (function(){
    var TAGNAMES = {
      'select':'input','change':'input',
      'submit':'form','reset':'form',
      'error':'img','load':'img','abort':'img'
	};
    function isEventSupported(eventName) {
      var el = document.createElement(TAGNAMES[eventName] || 'div');
      eventName = 'on' + eventName;
      var isSupported = (eventName in el);
      if (!isSupported) {
        el.setAttribute(eventName, 'return;');
        isSupported = typeof el[eventName] == 'function';
      }
      el = null;
      return isSupported;
    }
    return isEventSupported;
  })();

	// Hammer.js is present
	if (typeof Hammer === 'undefined') {
		throw ("Hammer.js needed!");
	}
	
	this.hammer = new Hammer(this.domElement, {drag_min_distance: 2});
	this.hammer.ondragstart = this.onHammerEvent();
	this.hammer.ondrag = this.onHammerEvent();
	this.hammer.ondragend = this.onHammerEvent();
	this.hammer.onswipe = this.onHammerEvent();
	this.hammer.ontap = this.onHammerEvent();
	this.hammer.ondoubletap = this.onHammerEvent();
	this.hammer.onhold = this.onHammerEvent();
	this.hammer.ontransformstart = this.onHammerEvent();
	this.hammer.ontransform = this.onHammerEvent();
	this.hammer.ontransformend = this.onHammerEvent();
	this.hammer.onrelease = this.onHammerEvent();
	
	if (isEventSupported('touchstart')) {
		this.domElement.addEventListener('touchstart', this.onMouseEvent(), true);
		console.log ("touchstart supported");
	}
    else {
		this.domElement.addEventListener('mousedown', this.onMouseEvent(), true);
		console.log ("no touchstart, supporting mousedown");
	}
	if (isEventSupported('touchend')) {
		this.domElement.addEventListener('touchend', this.onMouseEvent(), true);
		console.log ("touchend supported");
    }
    else {
		this.domElement.addEventListener('mouseup', this.onMouseEvent(), true);
		console.log ("no touchend, supporting mouseup");
    }
    // TODO see if it's not superseded by ondrag
    this.domElement.addEventListener('mousemove', this.onMouseEvent(), true);

    // Add listeners for mouseover and mouseout
    this.domElement.addEventListener('mouseover', this.onMouseEvent(), true);
    this.domElement.addEventListener('mouseout', this.onMouseEvent(), true);

    this.mouseUp = true;

    var ret;

    // Elements in this UI.
    this.elements = {};

    // Connection between elements
    this.connections = {};

    // Z-index lists.
    this.zArray = [];

    // get the engine from the engine factory
    this.engine = K2.ENGINE.engineFactory (engine.type, {'target': renderTarget});

    // Break on first
    if (typeof parameters !== 'undefined') {
        this.breakOnFirstEvent = parameters.breakOnFirstEvent || false;
    }

    // </CONSTRUCTOR>

    // <ELEMENT HANDLING>

    // Add and remove elements
    this.addElement = function(element, elementParameters) {
        var slot,
            slots;

        if (typeof this.elements[element.ID] !== 'undefined') {
            throw new Error('Conflicting / Duplicated ID in UI: ' + element.ID + ' (IDs are identifiers and should be unique)');
        }

        // Store the parameters
        var zIndex = 0;

        if ((typeof elementParameters !== 'undefined') && (typeof elementParameters.zIndex !== 'undefined')) {
            zIndex = elementParameters.zIndex;
        }

        if ((zIndex < 0) || (typeof(zIndex) !== 'number')) {
                throw new Error('zIndex ' + zIndex + ' invalid');
        }

        // Create the element to insert
        var tempEl = {'element': element, 'zIndex': zIndex};

        this.elements[element.ID] = tempEl;

        // Get the slots available from the element.
        slots = element.getValues();

        // if it's the first element having this zIndex, create the subarray.
        if (typeof this.zArray[zIndex] === 'undefined') {
            this.zArray[zIndex] = [];
        }
        // Update the maximum and minimum z index.
        this.zArray[zIndex].push(this.elements[element.ID].element);
        if ((typeof this.zMin === 'undefined') || (this.zMin > zIndex)) {
            this.zMin = zIndex;
        }
        if ((typeof this.zMax === 'undefined') || (this.zMax < zIndex)) {
            this.zMax = zIndex;
        }

    };

    this.removeElement = function(elementID) {
        if (typeof this.elements[elementID] !== 'undefined') {
            var elZIndex = this.elements[elementID].zIndex;
            var elZArray = this.zArray[elZIndex];
            // Delete the element in the zIndex subarray
            for (var i = 0; i < elZArray.length; i += 1) {
                if (elZArray[i].ID === elementID) {
                    elZArray.splice(i, 1);
                    break;
                }
            }
            // Delete the element in the elements array
            delete this.elements[elementID];
            // TODO delete the element in the connection matrix?
        }
    };
    
    this.isElement = function (elementId) {

        if (typeof this.elements[elementId] !== 'undefined') {
            return true;
        }
        return false;
    };

    // Z-Index getter and setter
    this.setZIndex = function(elementID, zIndex) {
        if (typeof this.elements[elementID] !== 'undefined') {
            var elZIndex = this.elements[elementID].zIndex;
            // if zIndexes differ
            if (elZIndex !== zIndex) {
                // if it's the first element having this zIndex, create the subarray.
		        if (typeof this.zArray[zIndex] === 'undefined') {
		            this.zArray[zIndex] = [];
		        }
		        // Update the maximum and minimum z index.
		        if ((typeof this.zMin === 'undefined') || (this.zMin > zIndex)) {
		            this.zMin = zIndex;
		        }
		        if ((typeof this.zMax === 'undefined') || (this.zMax < zIndex)) {
		            this.zMax = zIndex;
		        }
		        // Get the old and new zIndex subarrays
                var oldZArray = this.zArray[elZIndex];
                var newZArray = this.zArray[zIndex];
                // Delete the element in the old zIndex subarray
                for (var i = 0; i < oldZArray.length; i += 1) {
                    if (oldZArray[i].ID === elementID) {
                        oldZArray.splice(i, 1);
                        break;
                    }
                }
                // Add the element to the new zIndex subarray
                newZArray.push(this.elements[elementID].element);
                // Change the element zIndex
                this.elements[elementID].zIndex = zIndex;
            }
        }
        else throw ('Could not find element ID: ' + elementID);
    };

    this.getZIndex = function(elementID) {
        if (typeof this.elements[elementID] !== 'undefined') {
            return this.elements[elementID].zIndex;
        }
        else throw ('Could not find element ID: ' + elementID);
    };

    // Properties getter and setter
    this.setProp = function(elementID, prop, value) {
        if (typeof this.elements[elementID] !== 'undefined') {
            this.elements[elementID].element[prop] = value;
        }
        else throw ('Could not find ID: ' + elementID + ' property: ' + prop);
    };

    this.getProp = function(elementID, prop) {
        if (typeof this.elements[elementID] !== 'undefined') {
            return this.elements[elementID].element[prop];
        }
        else throw ('Could not find ID: ' + elementID + ' property: ' + prop);
    };
    
    // Element getter
    this.getElement = function(elementID) {
		return this.elements[elementID].element;
    };
    // </ELEMENT HANDLING>


    // <CONNECTION HANDLING>

    // Connect slots, so that one element can "listen" to the other
    this.connectSlots = function(senderElement, senderSlot, receiverElement, receiverSlot, connectParameters) {

        //Check for the elements.
        if ((typeof this.elements[senderElement] !== 'undefined') && (typeof this.elements[receiverElement] !== 'undefined')) {
            // //Check for the slots.
            if ((typeof this.elements[senderElement].element.values[senderSlot] === 'undefined') ||
                (typeof this.elements[receiverElement].element.values[receiverSlot] === 'undefined')) {
                throw new Error('Slot ' + senderSlot + ' or ' + receiverSlot + ' not present.');
            }

            else {

                //The sender & receiver element & slot exist. Do the connection.
                var receiverHash = {'recvElement' : receiverElement, 'recvSlot': receiverSlot};

                //Check if there are optional parameters
                if (typeof connectParameters !== 'undefined') {
                    // Is there a callback?
                    if (typeof(connectParameters.callback) === 'function') {
                        receiverHash.callback = connectParameters.callback;
                    }
                    // Should the connection setValue fire cascading setValue callbacks?
                    // By default, yes.
                    receiverHash.cascade = true;
                    if (typeof connectParameters.cascade !== 'undefined') {
                        receiverHash.cascade = connectParameters.cascade;
                    }
                }

                // Push the destination element/slot in the connections matrix.
                // Create the slot object if it doesn't exist yet.
                if (typeof this.connections[senderElement] === 'undefined') {
                    this.connections[senderElement] = {};
                }
                if (typeof this.connections[senderElement][senderSlot] === 'undefined') {
                    this.connections[senderElement][senderSlot] = [];
                }
                this.connections[senderElement][senderSlot].push(receiverHash);
            }

        }
        else {
            throw new Error('Element ' + senderElement + ' or ' + receiverElement + ' not present.');
        }
    };

    this.resetSlots = function() {
        this.connections = {};
    };

    this.unconnectSlots = function(senderElement, senderSlot, receiverElement, receiverSlot) {
        // TODO
    };

    this.resetSenderSlot = function(senderElement) {
        // TODO
    };

    //</CONNECTION HANDLING>


    // <VALUE HANDLING>

    // This method handles one set value event and propagates it in the connections matrix
    //this.setValue ({slot: sl, value: val, elementID: id, fireCallback:false, history:undefined});
    this.setValue = function(setParms) {
        var hist = [],
            receiverHash,
            recvElementID,
            recvSlot,
            i,
            RECURSIONMAX = 1000,
            elementID,
            value,
            slot,
            fireCallback,
            history,
            recvValue;

        // Default parameters
        if (typeof setParms.elementID === 'undefined') {
            throw ('ID is undefined');
        }
        else elementID = setParms.elementID;

        if (typeof setParms.value === 'undefined') {
            throw ('value is undefined');
        }
        else value = setParms.value;

        if (typeof setParms.fireCallback === 'undefined') {
            fireCallback = true;
        }
        else fireCallback = setParms.fireCallback;

        history = setParms.history;
        // End of defaults

        if (typeof this.elements[elementID] !== 'undefined') {

            // Get the default slot here, if no one specified a slot
            if (typeof setParms.slot === 'undefined') {
                slot = this.elements[elementID].element.defaultSlot;
                if (typeof slot === undefined) {
                    throw 'Default slot is undefined!';
                }
            }
            else slot = setParms.slot;

            // First of all, check history if it is present.
            if (typeof history !== 'undefined') {
                hist = history;
                // Is this an infinite loop?
                for (var k = 0; k < hist.length; k += 1) {
                    // This is for precaution.
                    if (hist.length > RECURSIONMAX) {
                        throw new Error('Recursion exceeded');
                    }
                    if ((hist[k].element === elementID) && (hist[k].slot === slot)) {
                        // Loop is infinite; bail out!
                        // console.log ("Broke recursion!");
                        return;
                    }
                }
            }
            // Element is present an there's no need to break a loop
            // really set value.
            this.elements[elementID].element.setValue(slot, value);

            // Finally, call the callback if there is one and we're allowed to.
            if ((typeof (this.elements[elementID].element.onValueSet) === 'function') && (fireCallback !== false)) {
                this.elements[elementID].element.onValueSet(slot, this.elements[elementID].element.values[slot], elementID);
            }

            // This element has been already set: update history
            hist.push({'element' : elementID, 'slot' : slot});
        }

        else {
            throw new Error('Element ' + elementID + ' not present.');
        }

        // Check if this element has connections
        if ((typeof this.connections[elementID] !== 'undefined') && (typeof this.connections[elementID][slot] !== 'undefined')) {

            // For every connection the element has
            for (i in this.connections[elementID][slot]) {

                if (this.connections[elementID][slot].hasOwnProperty(i)) {

                    // Retrieve the other connection end and the connection parameters.
                    receiverHash = this.connections[elementID][slot][i];

                    recvElementID = receiverHash.recvElement;
                    recvSlot = receiverHash.recvSlot;

                    // Check the callback here.
                    if (typeof(receiverHash.callback) === 'function') {
                        var connDetails = { 'sender': elementID,
                                            'sendSlot': slot,
                                            'recv': recvElementID,
                                            'recvSlot': recvSlot,
                                            'ui': this};
                        // We have a callback to call.
                        recvValue = receiverHash.callback(value, connDetails);
                    }

                    // Check if consequent setValue()s should have cascading
                    // consequences (i.e. fire the callbacks)
                    var fire_conn_callback;
                    if (receiverHash.cascade === false) {
                        fire_conn_callback = false;
                    }
                    else {
                        fire_conn_callback = true;
                    }

                    // Recursively calls itself, keeping an history in the stack
                    this.setValue({elementID: recvElementID, slot: recvSlot, value: recvValue, history: hist, fireCallback: fire_conn_callback});
                }
            }
        }
    };
    // </VALUE HANDLING>

    // <VISIBILITY, RECEIVING EVENTS>

    // These two functions are complementary.

    this.hideElement = function(elementID) {

        var visibilityState;

        if (typeof this.elements[elementID] !== 'undefined') {
            visibilityState = this.elements[elementID].element.getVisible();
            if (visibilityState === true) {
                // Set the element's visibility
                this.elements[elementID].element.setVisible(false);
                // When hidden, the element is also not listening to events
                this.elements[elementID].element.setListening(false);

            }

        }

        else {
            throw new Error('Element ' + elementID + ' not present.');
        }

    };

    this.unhideElement = function(elementID) {

        var visibilityState;

        if (typeof this.elements[elementID] !== 'undefined') {
            visibilityState = this.elements[elementID].element.getVisible();
            if (visibilityState === false) {

                // Set the element's visibility
                this.elements[elementID].element.setVisible(true);
                // When unhidden, the element starts listening to events again.
                this.elements[elementID].element.setListening(true);

            }

        }

        else {
            throw new Error('Element ' + elementID + ' not present.');
        }
    };

    this.setHidden = function(elementID, value) {
        this.setVisible(elementID, !value);
    };

    this.setVisible = function(elementID, value) {
        var visibilityState;

        if (typeof this.elements[elementID] !== 'undefined') {
            visibilityState = this.elements[elementID].element.getVisible();
            if (visibilityState !== value) {

                // Set the element's visibility
                this.elements[elementID].element.setVisible(value);
                // When unhidden, the element starts listening to events again.
                this.elements[elementID].element.setListening(value);

            }

        }

        else {
            throw new Error('Element ' + elementID + ' not present.');
        }
    };

    this.setListening = function(elementID, value) {
        var state;

        if (typeof this.elements[elementID] !== 'undefined') {
            state = this.elements[elementID].element.getListening();
            if (state !== value) {

                // When unhidden, the element starts listening to events again.
                this.elements[elementID].element.setListening(value);

            }

        }

        else {
            throw new Error('Element ' + elementID + ' not present.');
        }
    };

    // </VISIBILITY, RECEIVING EVENTS>


    // <REFRESH HANDLING>
    this.refreshZ = function(z) {
        //Refresh every layer, starting from z to the last one.
        for (var i = z, length = this.zArray.length; i < length; i += 1) {
            if (typeof(this.zArray[i]) === 'object') {
                for (var k = 0, z_length = this.zArray[i].length; k < z_length; k += 1) {
                    if (this.zArray[i][k].getVisible() === true) {
                        this.zArray[i][k].refresh(this.engine);
                    }
                }
            }
        }
    };

    this.refresh = function(doReset) {
        // Reset everything
        if (doReset !== false) {
            this.reset();
        }

        // Then refresh everything from the smallest z-value, if there is one.
        if (typeof this.zMin !== 'undefined') {
            this.refreshZ(this.zMin);
        }
    };

    this.reset = function() {
        // Reset the graphic frontend
        this.engine.reset();
    };
};
    // </REFRESH HANDLING>

K2.Area = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Area, K2.UIElement);


K2.Area.prototype.getready = function(args) {

    var valueName, i;

     // Call the constructor from the superclass.
    K2.Area.superclass.getready.call(this, args);

    // A Area has its starting point, height, width and color.
    this.values = { 'width'     : 0,
                    'height'    : 0,
                    'selected'  : [],
                    'xOffset'   : 0,
                    'yOffset'   : 0,
                    'doubletap'	: [],
                    'held'		: []
                    };

    this.defaultSlot = 'height';
    
    this.color = args.color || 'black';
    this.borderColor = args.borderColor || 'green';
    
    this.proximity = Math.floor(args.proximity) || 10;
    this.thickness = Math.floor(args.thickness) || this.proximity;
    
    if (args.thickness === 0) {
		this.thickness = 0;
    }
    
    // Can paint the borders
    this.borders = args.borders || {top: true, bottom: true, right: true, left: true};
    // Can drag the borders
    this.dragBorders = args.dragBorders || {top: true, bottom: true, right: true, left: true};
    // Move can be 'none', 'x', 'y', 'all'
    this.move = args.move || 'all';
    
    this.xMonotone = args.xMonotone || false;
    this.yMonotone = args.yMonotone || false;
    
    
    // TODO ROI
    
    var height = args.height || 0;
    var width = args.width || 0;
    
    this.values.width = width;
    this.values.height = height;
    
    var xOffset = args.left || 0;
    var yOffset = args.top || 0;
    
    this.values.xOffset = xOffset;
    this.values.yOffset = yOffset;

};

K2.Area.prototype.isInArea = function (x,y) {
    var xInside = false;
    var yInside = false;
    
    if (this.values.width > 0) {
        if ((x > this.values.xOffset) && (x < this.values.xOffset + this.values.width)) {
            xInside = true;
        }
    }
    else {
        if ((x < this.values.xOffset) && (x > this.values.xOffset + this.values.width)) {
            xInside = true;
        }
    }
    
    if (this.values.height > 0) {
        if ((y > this.values.yOffset) && (y < this.values.height + this.values.yOffset)) {
            yInside = true;
        }
    }
    else {
        if ((y < this.values.yOffset) && (y > this.values.height + this.values.yOffset)) {
            yInside = true;
        }
    }
    
    if (xInside && yInside) {
        return true;
    }
    else {
        return false;
    }
    
};

K2.Area.prototype.tap = K2.Area.prototype.dragstart = function(x, y) {
    
    /*if (this.isInROI(x, y)) {*/
        
        var left_min_prox = this.values.xOffset - this.proximity;
        var left_max_prox = this.values.xOffset + this.proximity;
        var right_min_prox = this.values.xOffset + this.values.width - this.proximity;
        var right_max_prox = this.values.xOffset + this.values.width + this.proximity;
        var bottom_max_prox = this.values.height + this.values.yOffset + this.proximity;
        var bottom_min_prox = this.values.height + this.values.yOffset - this.proximity;
        var top_max_prox = this.values.yOffset + this.proximity;
        var top_min_prox = this.values.yOffset - this.proximity;
        
        // Test side proximity
        if ((x > left_min_prox) &&  x < (left_max_prox) && this.dragBorders.left === true) {
            // We're next to the left side
            this.leftSide = true;
            console.log ("Left side click detected");
        }
        if ((x > right_min_prox) &&  x < (right_max_prox) && this.dragBorders.right === true) {
            // We're next to the right side
            this.rightSide = true;
            console.log ("Right side click detected");
        }
        if ((y > bottom_min_prox) &&  y < (bottom_max_prox) && this.dragBorders.bottom === true) {
            // We're next to the bottom side
            this.bottomSide = true;
            console.log ("Bottom side click detected");
        }
        if ((y > top_min_prox) &&  y < (top_max_prox) && this.dragBorders.top === true) {
            // We're next to the top side
            this.topSide = true;
            console.log ("Top side click detected");
        }
        
        if (this.isInArea (x,y)) {
            console.log ("clicked inside!");
            this.inside = true;
            this.startPoint = [x,y];
        }
        else this.inside = false;
};

K2.Area.prototype.drag /*= K2.Area.prototype.mousemove =*/ =  function(curr_x, curr_y) {

    var ret = [];
    var newWidth, newHeight;
       
    if (this.leftSide && this.borders.left) {
        
        newWidth = this.values.width - (curr_x - this.values.xOffset);
        var newX = curr_x;
        
        if ((this.xMonotone) && (newWidth < 0)) {
            newWidth = 0;
            newX = this.values.xOffset;
        }
        
        ret.push ({slot: 'width', value : newWidth});
        ret.push ({slot : 'xOffset', value : newX});
    }
    
    if (this.rightSide && this.borders.right && !this.leftSide) {
        newWidth = curr_x - this.values.xOffset;
        
        if ((this.xMonotone) && (newWidth < 0)) {
            newWidth = 0;
        }
        
        ret.push ({slot : 'width', value : newWidth});
    }
    
    if (this.bottomSide && this.borders.bottom) {
        
        newHeight = (this.values.height + (curr_y - (this.values.yOffset + this.values.height)));
        
        if ((this.yMonotone) && (newHeight < 0)) {
            newHeight = 0;
        }
        
        ret.push ({slot: 'height', value : newHeight});
    }
    
    if (this.topSide && this.borders.top && !this.bottomSide) {
        
        newHeight = this.values.height + (this.values.yOffset - curr_y);
        var newY = curr_y;
        
        if ((this.yMonotone) && (newHeight < 0)) {
            newHeight = 0;
            newY = this.values.yOffset;
        }
        
        ret.push ({slot : 'yOffset', value : newY});
        ret.push ({slot : 'height', value : newHeight});
    }
    
    if (ret.length > 0) {
        // return here, do not move
        return ret;
    }
    
    // Move the element
    if (this.inside) {
        if (this.move !== 'none') {
            
            var xDelta = curr_x - this.startPoint[0];
            var yDelta = curr_y - this.startPoint[1];
            this.startPoint = [curr_x, curr_y];

            if (this.move === 'all') {
                return ([{slot : 'xOffset', value : this.values.xOffset + xDelta}, {slot : 'yOffset', value : this.values.yOffset + yDelta}]);
            }
            else if (this.move === 'x') {
                return ({slot : 'xOffset', value : this.values.xOffset + xDelta});
            }
            else if (this.move === 'y') {
                return ({slot : 'yOffset', value : this.values.yOffset + yDelta});
            } 
        }
    }

};

K2.Area.prototype.release = K2.Area.prototype.dragend = K2.Area.prototype.mouseup = function(x, y) {
    
    var ret;
    
    // Drag guards are reset to false
    this.leftSide = this.rightSide =  this.bottomSide = this.topSide = false;
    
    // Clicked in and out inside the object. the object is selected
    if (this.inside) {
        if (this.isInArea (x,y)) {
           ret = {slot : 'selected', value : [x, y]}; 
        }
    }
    this.inside = false;
    
    return ret; 
    
};

K2.Area.prototype.hold = function(x, y) {
	if (this.isInArea(x, y)) {
		//Area is held
	    var ret = {'slot' : 'held', 'value' : [x, y]};
	    return ret;
   }
};

K2.Area.prototype.doubletap = function(x, y) {
	if (this.isInArea(x, y)) {
		return {'slot' : 'doubletap', 'value' : [x, y]};
	}
};

K2.Area.prototype.setValue = function(slot, value) {
    // Superclass
    K2.Area.superclass.setValue.call(this, slot, value);

};


K2.Area.prototype.refresh_CANVAS2D = function(engine) {

    if (this.isVisible === true) {
        
        engine.context.fillStyle = this.color;
        engine.context.strokeStyle = this.borderColor;
        engine.context.lineWidth = this.thickness;
        var halfThickness = Math.floor (this.thickness / 2);
        engine.context.fillRect (this.xOrigin + this.values.xOffset + halfThickness,
                                 this.values.yOffset + halfThickness,
                                 this.values.width - halfThickness * 2,
                                 this.values.height - halfThickness * 2);
        if (this.thickness > 0) {
			engine.context.strokeRect (	this.xOrigin + this.values.xOffset,
										this.values.yOffset,
										this.values.width,
										this.values.height);
		}
    }
};

K2.Area.prototype.getXCoord = function() {
    return this.values.xOrigin;
};

K2.Area.prototype.getYCoord = function() {
    return this.values.yOrigin;
};

K2.Area.prototype.getWidth = function() {
    return this.values.width;
};

K2.Area.prototype.getHeight = function() {
    return this.values.height;
};

K2.Area.prototype.setHeight = function(height) {
    this.values.height = height;
    if (typeof this.ROIHeight === 'undefined') {
        this.ROIHeight = height;
    }
};

K2.Area.prototype.setWidth = function(width) {
    this.values.width = width;
    if (typeof this.ROIWidth === 'undefined') {
        this.ROIWidth = width;
    }
};

K2.Curve = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Curve, K2.UIElement);

K2.Curve.prototype.getready = function(args) {

    // Call the constructor from the superclass.
    K2.Curve.superclass.getready.call(this, args);

    this.values = {	'points' : [],
					'selected' : [],
					'held' : [],
					'doubletap_c' : [],
					'doubletap_h' : []};

    this.defaultSlot = 'points';

    this.setWidth(args.width);
    this.setHeight(args.height);
    this.curveType = args.curveType || 'bezier';
    this.thickness = args.thickness || 2;
    this.curveColor = args.curveColor || 'black';
    this.helperColor = args.helperColor || '#CCCCCC';
    this.handleColor = args.handleColor || 'red';
    this.curveLabels = (typeof args.curveLabels === 'boolean') ? args.curveLabels : false;
    this.terminalPointStyle = args.terminalPointStyle || 'rect';
    this.paintTerminalPoints = args.paintTerminalPoints || 'all';
    this.midPointStyle = args.midPointStyle || 'circle';
    this.terminalPointSize = args.terminalPointSize || 16;
    this.midPointSize = args.midPointSize || 8;
    this.terminalPointColor = args.terminalPointColor || this.handleColor;
    this.midPointColor = args.midPointColor || this.handleColor;
    this.terminalPointFill = args.terminalPointFill || null;
    this.midPointFill = args.midPointFill || null;
    this.xMonotone = args.xMonotone || false;
    // handleSize is the tolerance when dragging handles
    this.handleSize = args.handleSize || (this.terminalPointSize > this.midPointSize) ? this.terminalPointSize : this.midPointSize;

    //internals
    this.handleClicked = null;
    this.supportPoints = [];
    this.selectStart = false;
    this.whereHappened = [];


    // Check for correct number of arguments
    switch (args.curveType) {
		case 'bezier':
			if (args.points.length % 2 !== 0 || args.points.length < 4) {
				throw 'Incorrect number of points ' + args.points.length;
			}
		break;
		case 'halfcosine':
		case 'smooth':
		case 'linear':
			if (args.points.length !== 4) {
				throw 'Incorrect number of points ' + args.points.length;
			}
		break;
		/* TODO these aren't working
		case "cubic":
		case "catmull":
		case "hermite" :
			if(args.points.length !== 8) {
				throw "Incorrect number of points " + args.points.length;
			}
		break; */
		default:
			throw 'Unknown curve type ' + args.curveType;
    }

    //transform initial arguments into an {Array} of [x,y] coordinates
    var initialPoints = [];
    for (var i = 0; i < args.points.length; i = i + 2) {
        initialPoints.push([args.points[i], args.points[i + 1]]);
    }

    this.values.points = initialPoints;

};

K2.Curve.prototype.isInCurve = function(x, y) {
	for (i = 0; i < this.supportPoints.length; i += 1) {
		if ((x > this.supportPoints[i][0] - this.thickness) && (x < this.supportPoints[i][0] + this.thickness)) {
				if ((y > this.supportPoints[i][1] - this.thickness) && (y < this.supportPoints[i][1] + this.thickness)) {
					// Curve selected
					return true;
				}
			}
		}
		return false;
};

K2.Curve.prototype.isInHandle = function(x, y) {
	var points = this.values.points;
	for (var i = 0; i < points.length; i += 1) {
		if ((x > (points[i][0] - this.handleSize)) && (x < (points[i][0] + this.handleSize))) {
			if ((y > (points[i][1] - this.handleSize)) && (y < (points[i][1] + this.handleSize))) {
				// We clicked on a curve handle
				return i;
			}
		}
	}
	return null;
};

// This methods returns true if the point given belongs to this element.
// TODO to reflect the bounding box of the element ?
K2.Curve.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

K2.Curve.prototype.tap = K2.Curve.prototype.dragstart = K2.Curve.prototype.mousedown = function(x, y) {

    var points = this.values.points;

    if (this.isInROI(x, y)) {

        var handleNum;
		if ((handleNum = this.isInHandle(x, y)) !== null) {
			// Handle was tapped.
			this.handleClicked = handleNum;
            if ((handleNum === 0) || (handleNum === points.length - 1)) {
                // caught a terminal handle!
                return;
            }
		}
	    // Check if Curve was tapped/clicked
	    // and save a guard (this might be inefficient when t is small and plain wrong when t is big)
	    if (this.isInCurve(x, y)) {
			//Curve is selected
			this.selectStart = true;
			return;
		}
    }
};

K2.Curve.prototype.xMonotoneFunc  = function (points) {
	
	if (points[0][0] > points[points.length-1][0]) {
		
		if (points[0][0] > this.values.points[0][0]) {
			// First point is moving
			points[0][0] = points[points.length-1][0];
		}
		else {
			// Last point is moving
			points[points.length-1][0] = points[0][0];
		}
	}
				
};

K2.Curve.prototype.drag = function(curr_x, curr_y) {

    var ret = {},
        points;

    if (this.handleClicked !== null) {
        // Copy the array before modifying it
        points = K2.GenericUtils.clone (this.values.points);
        
        // Button is activated when cursor is still in the element ROI, otherwise action is void.
        if (this.isInROI(curr_x, curr_y)) {
            // Click on button is completed, the button is no more triggered.
            this.triggered = false;
                        
            points[this.handleClicked][0] = curr_x;
            points[this.handleClicked][1] = curr_y;
                        
        }
        else {
            // Out of ROI
            // Calculate where to stop
            points[this.handleClicked][0] = curr_x;
            points[this.handleClicked][1] = curr_y;
            
            if (curr_x > (this.ROILeft + this.ROIWidth)) {
                points[this.handleClicked][0] = this.ROILeft + this.ROIWidth;
            }
            if (curr_x < this.ROILeft) {
                points[this.handleClicked][0] = this.ROILeft;
            }
            
            if (curr_y > (this.ROITop + this.ROIHeight)) {
                points[this.handleClicked][1] = this.ROITop + this.ROIHeight;
            }
            if (curr_y < this.ROITop) {
                points[this.handleClicked][1] = this.ROITop;
            }

        }
        this.whereHappened = [points[this.handleClicked][0], points[this.handleClicked][1]];
        ret = {'slot' : 'points', 'value' : points};
        return ret;
    }

    // Action is void, button was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;

};

K2.Curve.prototype.dragend = K2.Curve.prototype.swipe = function (x,y) {
    if ((x < 0) && (y < 0)) {
        // This seems to be an Hammer.js bug in mobile. Need to investigate
        return;
    }
    var ret = this.drag (x,y);
    this.handleClicked = null;
    return ret;
};

K2.Curve.prototype.release = K2.Curve.prototype.mouseup = function(x, y) {
	this.handleClicked = null;
	// check the selection-end
	// check if the point is "on" the curve plot
	// if the saved guard is true
	// reset the guard and trigger a selected event
	if (this.selectStart === true) {
		if (this.isInCurve(x, y)) {
			//Curve is selected
			this.selectStart = false;
			var ret = {'slot' : 'selected', 'value' : [x, y]};
			return ret;
			}
	}
};

K2.Curve.prototype.hold = function(x, y) {
	if (this.isInROI(x, y)) {
		if (this.isInCurve(x, y)) {
			//Curve is held
		    var ret = {'slot' : 'held', 'value' : [x, y]};
		    return ret;
	   }
	}
};

K2.Curve.prototype.doubletap = function(x, y) {
	if (this.isInROI(x, y)) {

		var handleNum;
		if ((handleNum = this.isInHandle(x, y)) !== null) {
			// Handle is double-tapped. This has precedence
			return {'slot' : 'doubletap_h', 'value' : [[x, y], handleNum]};
		}
		if (this.isInCurve(x, y)) {
			//Curve is double-tapped
			return {'slot' : 'doubletap_c', 'value' : [x, y]};
		}
	}
};

K2.Curve.prototype.setValue = function(slot, value) {
	var equal = true;
	
	if (slot === 'points') {
		
		var oldValue = this.values[slot];
		for (var i = 0; i < value.length; i += 1) {
			for (var k = 0; k < value.length; k += 1) {
				if (value[i][k] !== oldValue[i][k]) {
					equal = false;
					break;
				}
			}
			if (equal === false) {
				break;
			}
		}
	}
	else {
		equal = false;
	}
	
	if (this.xMonotone) {
	   this.xMonotoneFunc(value);
	   }
	
	if (!equal) {
		// Now, we call the superclass
	    K2.Curve.superclass.setValue.call(this, slot, value);
	  }

};

K2.Curve.prototype.refresh_CANVAS2D = function(engine) {

        if (this.isVisible === true) {
            
            var context = engine.context;
            var initialPoints = this.values.points;
            var parameters = {
                thickness: this.thickness,
                curveColor: this.curveColor,
                helperColor: this.helperColor,
                handleColor: this.handleColor,
                handleSize: this.handleSize,
                curveLabels: this.curveLabels
            };

            this.genericCurve(this.values.points, this.curveType);
            this.paintCurve(context);
            this.paintPoints(context, this.values.points, parameters);
        }
    
};

K2.Curve.prototype.getCurvePoints = function (numPoints) {
        // Returns an array of numPoints x,y coordinates
        
        var step = 1 / numPoints;
        var temp = [];
        for (var t = 0; t <= 1; t = t + step) {
            var p = this[this.curveType].P(t, this.values.points);
            temp.push(p);
        }
        return temp;
};

K2.Curve.prototype.getCurveYPoints = function (numPoints, mulFactor) {
        // Returns an array of numPoints y coordinates     
        
        if (typeof mulFactor === 'undefined') {
            mulFactor = 1;
        }
        
        var step = 1 / numPoints;
        var temp = [];
        for (var t = 0; t <= 1; t = t + step) {
            var p = this[this.curveType].P(t, this.values.points)[1] * mulFactor;
            temp.push(p);
        }
        return temp;
};

K2.Curve.prototype.getPoint = function(index) {
	return this.supportPoints[index];
};

K2.Curve.prototype.getnumPoints = function() {
	return this.supportPoints.length;
};

//Non-interface functions

K2.Curve.prototype.halfcosine = {

	/*
     *Computes a point's coordinates for a value of t
     *@param {Number} t - a value between 0 and 1
     *@param {Array} points - an {Array} of [x,y] coodinates. The initial points
    */

    P: function(t, points) {
        // http://paulbourke.net/miscellaneous/interpolation/
        var mu2 = (1 - Math.cos(t * Math.PI)) / 2;

        var r = [0, 0];
        r[0] = points[0][0] + (points[1][0] - points[0][0]) * t;
        r[1] = (points[0][1] * (1 - mu2) + points[1][1] * mu2);
        return r;
    }
};

K2.Curve.prototype.smooth = {
    P: function(t, points) {
        // http://codeplea.com/simple-interpolation
        var tSmooth = t * t * (3 - 2 * t);

        var r = [0, 0];
        r[0] = points[0][0] + (points[1][0] - points[0][0]) * t;
        r[1] = points[0][1] + tSmooth * (points[1][1] - points[0][1]);

        return r;
    }
};

K2.Curve.prototype.linear = {

    P: function(t, points) {
        var r = [0, 0];
        r[0] = points[0][0] + (points[1][0] - points[0][0]) * t;
        r[1] = points[0][1] * (1 - t) + points[1][1] * t;

        return r;
    }
};


K2.Curve.prototype.cubic = {

    P: function(t, points) {
        var r = [0, 0];

        r[0] = points[0][0] + (points[3][0] - points[0][0]) * t;

        var mu = t;
        var mu2 = t * t;

        var a0 = points[3][1] - points[2][1] - points[0][1] + points[1][1];
        var a1 = points[0][1] - points[1][1] - a0;
        var a2 = points[2][1] - points[0][1];
        var a3 = points[1][1];

        r[1] = (a0 * mu * mu2 + a1 * mu2 + a2 * mu + a3);

        return r;
    }
};

K2.Curve.prototype.catmull = {

    P: function(t, points) {
        var r = [0, 0];

        r[0] = points[0][0] + (points[3][0] - points[0][0]) * t;

        var mu = t;
        var mu2 = t * t;
        var y0 = points[0][1];
        var y1 = points[1][1];
        var y2 = points[2][1];
        var y3 = points[3][1];

        var a0 = -0.5 * y0 + 1.5 * y1 - 1.5 * y2 + 0.5 * y3;
        var a1 = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3;
        var a2 = -0.5 * y0 + 0.5 * y2;
        var a3 = y1;

        r[1] = (a0 * mu * mu2 + a1 * mu2 + a2 * mu + a3);

        return r;
    }
};


/*
   Tension: 1 is high, 0 normal, -1 is low
   Bias: 0 is even,
         positive is towards first segment,
         negative towards the other
*/
K2.Curve.prototype.hermite = {

	  P: function(t, points, tension_, bias_) {

		var r = [0, 0];
		r[0] = points[0][0] + (points[3][0] - points[0][0]) * t;

		var bias = bias_ || 0;
		var tension = tension_ || 0;
		var m0, m1, mu2, mu3;
		var a0, a1, a2, a3;
		var mu = t;

		var y0 = points[0][1];
        var y1 = points[1][1];
        var y2 = points[2][1];
        var y3 = points[3][1];

		mu2 = mu * mu;
		mu3 = mu2 * mu;
		m0 = (y1 - y0) * (1 + bias) * (1 - tension) / 2;
		m0 += (y2 - y1) * (1 - bias) * (1 - tension) / 2;
		m1 = (y2 - y1) * (1 + bias) * (1 - tension) / 2;
		m1 += (y3 - y2) * (1 - bias) * (1 - tension) / 2;
		a0 = 2 * mu3 - 3 * mu2 + 1;
		a1 = mu3 - 2 * mu2 + mu;
		a2 = mu3 - mu2;
		a3 = -2 * mu3 + 3 * mu2;

		r[1] = (a0 * y1 + a1 * m0 + a2 * m1 + a3 * y2);
		return r;
	}
};

//N grade bezier curve, adapted from http://html5tutorial.com/how-to-draw-n-grade-bezier-curve-with-canvas-api/
K2.Curve.prototype.bezier = {

        /**Computes a point's coordinates for a value of t
        *@param {Number} t - a value between o and 1
        *@param {Array} points - an {Array} of [x,y] coodinates. The initial points
        **/
        P: function(t, points) {

            /**Computes factorial iteratively*/
	        var fact = function(k) {
	            var rval = 1;
                for (var i = 2; i <= k; i++)
                    rval = rval * i;
                return rval;
	        };

	        /**Computes Bernstain
	        *@param {Integer} i - the i-th index
	        *@param {Integer} n - the total number of points
	        *@param {Number} t - the value of parameter t , between 0 and 1
	        **/
	        function B(i,n,t) {
	            //if(n < i) throw "Wrong";
	            var fact_funct = fact;
	            if (typeof fact_lookup === 'function') {
                    fact_funct = fact_lookup;
	            }
	            return fact_funct(n) / (fact_funct(i) * fact_funct(n - i)) * Math.pow(t, i) * Math.pow(1 - t, n - i);
	        }

            var r = [0, 0];
            var n = points.length - 1;
            for (var i = 0; i <= n; i++) {
                r[0] += points[i][0] * B(i, n, t);
                r[1] += points[i][1] * B(i, n, t);
            }
            return r;
        }

};

K2.Curve.prototype.genericCurve = function(initialPoints, type) {

    function distance(a, b) {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

    // Compute the incremental step
    function computeIncrementalStep(points) {
	    var tLength = 0;
	    for (var i = 0; i < points.length - 1; i++) {
	        tLength += distance(points[i], points[i + 1]);
	    }
	    var step = 1 / tLength;
	    return step;
	}

	function computeSupportPoints(points, curveObj) {
        //Compute the support points
        var step = computeIncrementalStep(points);
	    var temp = [];
	    for (var t = 0; t <= 1; t = t + step) {
	        var p = curveObj.P(t, points);
	        temp.push(p);
	    }
	    return temp;
	}

    // Memorize the curve (support) points.
    this.supportPoints = computeSupportPoints(initialPoints, this[type]);
};


// Internal paint functions
// TODO PER-ELEMENT ALPHA https://developer.mozilla.org/en/Drawing_Graphics_with_Canvas

K2.Curve.prototype.paintHandle = function(ctx, point, terminal) {
		if (terminal === true) {
			this.paintPoint(ctx, point, this.terminalPointStyle, this.terminalPointFill, this.terminalPointColor, this.terminalPointSize);
		}
		else {
			this.paintPoint(ctx, point, this.midPointStyle, this.midPointFill, this.midPointColor, this.midPointSize);
		}
	};

// Paint an handle point
K2.Curve.prototype.paintPoint = function(ctx, point, style, fill, color, size) {

		if (style === 'rect') {
			// Stroked rectangle
			ctx.save();
			ctx.strokeStyle = color;
			ctx.lineWidth = Math.round(size / 5);
			ctx.strokeRect(point[0] - Math.round(size / 2) , point[1] - Math.round(size / 2), size, size);
			if (fill !== null) {
				ctx.fillStyle = fill;
                ctx.fillRect((point[0] - Math.ceil(size / 2)) + Math.floor(ctx.lineWidth / 2) , (point[1] - Math.ceil(size / 2)) + Math.floor(ctx.lineWidth / 2), size - ctx.lineWidth + 1, size - ctx.lineWidth + 1);
            }
			ctx.restore();
		}
		else if (style === 'circle') {
			// Stroked circle
			ctx.save();
			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.lineWidth = Math.round(size / 5);
			ctx.arc(point[0], point[1], size, 0, 2 * Math.PI, false);
			if (fill !== null) {
				ctx.fillStyle = fill;
                ctx.fill();
            }
			ctx.stroke();
			ctx.restore();
		}
		else if (style === 'none') {
			// noop
		}
		else {
			throw 'Unknown handle style: ' + style;
		}
	};

// Paint the curve support / control points / labels
K2.Curve.prototype.paintPoints = function(ctx, parameters) {

	var points = this.values.points;
	var i;

    ctx.save();
    //paint lines
    ctx.strokeStyle = this.helperColor;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();

    //control points
    for (i = 0; i < points.length; i++) {

        // See if the point being painted is a terminal one
        var terminal = false;
        if ((i === 0) || (i === (points.length - 1))) {
            terminal = true;
        }

        // Paint the handle and labels only according to paintTerminalPoints strategy
        var pTT = this.paintTerminalPoints;
        if (terminal === true) {
			if ((pTT === 'all') || ((pTT === 'first') && (i === 0)) || ((pTT === 'last') && (i === (points.length - 1)))) {
                this.paintHandle(ctx, points[i], terminal);
                // Paint the curve labels
		        if (this.curveLabels) {
                    ctx.fillText(this.ID + ' (' + i + ')' + ' [' + points[i][0] + ',' + points[i][1] + ']', points[i][0], points[i][1] - 10);
		        }
	        }
	    }

	    else {
            // Paint the midpoints
            this.paintHandle(ctx, points[i], terminal);
            // Paint the curve labels
			if (this.curveLabels) {
				ctx.fillText(this.ID + ' (' + i + ')' + ' [' + points[i][0] + ',' + points[i][1] + ']', points[i][0], points[i][1] - 10);
			}
	    }
    ctx.restore();
	}
};

// Generic paint curve method
K2.Curve.prototype.paintCurve = function(ctx) {

	var points = this.supportPoints;
	var thickness = this.thickness;
	var color = this.curveColor;

    ctx.save();
	ctx.lineWidth = thickness;
	ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
    ctx.restore();
};

K2.Bar = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Bar, K2.UIElement);

K2.Bar.prototype.getready = function(args) {

    // Call the constructor from the superclass.
    K2.Bar.superclass.getready.call(this, args);

    this.values = {'barPos' : [],
                   'dragStart': [],
                   'dragEnd': []
                   };
    this.defaultSlot = 'barPos';

    this.setWidth(args.width);
    this.setHeight(args.height);
    this.orientation = args.orientation || 0;
    this.barColor = args.barColor || 'black';
    this.thickness = args.thickness || 1;

};

// This methods returns true if the point given belongs to this element.
K2.Bar.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

K2.Bar.prototype.isInROIX = function(x) {
    if ((x > this.ROILeft) && (x < (this.ROILeft + this.ROIWidth))) {
            return true;
        }
    return false;
};

K2.Bar.prototype.isInROIY = function(y) {
    if ((y > this.ROITop) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    return false;
};

K2.Bar.prototype.commonDrag = function (curr_x, curr_y) {
    var retVal;
    
    var tempValue = this.values.barPos;
    
    if (this.orientation === 0) {
        if (! this.isInROIY (curr_y)) {
            return;
        }
        retVal = [curr_x - this.xOrigin, tempValue[1]];
        if (retVal[0] > this.width) {
            retVal[0] = this.width;
        }
        if (retVal[0] < 0) {
            retVal[0] = 0;
        }
    }

    else if (this.orientation === 1) {
        if (! this.isInROIY (curr_x)) {
            return;
        }
        retVal = [tempValue[0], curr_y - this.yOrigin];
        if (retVal[1] > this.height) {
            retVal[1] = this.height;
        }
        if (retVal[1] < 0) {
            retVal[1] = 0;
        }
    }
    
    return retVal;
};

K2.Bar.prototype.mousedown = K2.Bar.prototype.touchstart = function (curr_x, curr_y) {
    // Must be (strictly) in ROI
    if (! this.isInROI (curr_x, curr_y)) {
        return;
    }
    
    this.started = true;
    
    var retVal = this.commonDrag (curr_x, curr_y);
    
    if (typeof retVal !== 'undefined') {
        ret = {'slot' : 'barPos', 'value' : retVal};
        return ret;
    }
};

K2.Bar.prototype.drag = function(curr_x, curr_y) {

    if (!this.started) {
        return;
    }
    var retVal = this.commonDrag (curr_x, curr_y);
    
    if (typeof retVal !== 'undefined') {
        ret = {'slot' : 'barPos', 'value' : retVal};
        return ret;
    }
};

K2.Bar.prototype.dragend = K2.Bar.prototype.swipe = function(curr_x, curr_y) {
    
    if (!this.started) {
        return;
    }
    this.started = false;
    
    var retVal = this.commonDrag (curr_x, curr_y);
    
    if (typeof retVal !== 'undefined') {
        ret = [{'slot' : 'barPos', 'value' : retVal}, {'slot' : 'dragEnd', 'value' : [curr_x - this.xOrigin, curr_y - this.yOrigin]}];
        return ret;
    }
};

K2.Bar.prototype.dragstart = function(curr_x, curr_y) {
    if (this.isInROI(curr_x, curr_y)) {
        ret = {'slot' : 'dragStart', 'value' : [curr_x - this.xOrigin, curr_y - this.yOrigin]};
        return ret;
    }
};

K2.Bar.prototype.setValue = function(slot, value) {

	console.log('Setting ' + slot + ' to ' + value);

    if (slot == 'barPos') {
        if (value[0] <= this.width) {
            this.values.barPos[0] = value[0];
        }
        if (value[1] <= this.height) {
            this.values.barPos[1] = value[1];
        }
    }
    else this.values[slot] = value;
};

K2.Bar.prototype.refresh_CANVAS2D = function(engine) {
    
    if (this.isVisible === true) {

    var context = engine.context;
        context.lineWidth = this.thickness;
        context.strokeStyle = this.barColor;

	    // Draw the bar
	    //TODO there must be a less-repetitive way of handling orientations
	    
        context.beginPath();
	    
        if (this.orientation === 0) {
            var x = this.xOrigin + this.values.barPos[0];
            context.moveTo(x, this.yOrigin + this.height);
			context.lineTo(x, this.yOrigin);
		}
		else if (this.orientation === 1) {
            context.moveTo(this.xOrigin + this.width, this.yOrigin + this.values.barPos[1]);
			context.lineTo(this.xOrigin, this.yOrigin + this.values.barPos[1]);
		}
		
		context.stroke();
		context.closePath();  
    }
    
};

K2.Button = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Button, K2.UIElement);

K2.Button.prototype.getready = function(args) {

    if (args === undefined) {
        throw new Error('Error: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Button.superclass.getready.call(this, args);

    // Now that all required properties have been inherited
    // from the parent class, define extra ones from this class
    // Value 0 by default
    this.values = {'buttonvalue' : 0};
    this.defaultSlot = 'buttonvalue';

    this.triggered = false;

    this.mode = args.mode || 'persistent';
    this.imagesArray = args.imagesArray;

    if (this.imagesArray.length < 1) {
        throw new Error('Invalid images array length, ' + this.imagesArray.length);
    }

    this.nButtons = this.imagesArray.length;

    for (var i = 0; i < this.nButtons; i += 1) {
        this.setWidth(this.imagesArray[i].width);
        this.setHeight(this.imagesArray[i].height);
    }


};

// This method returns true if the point given belongs to this button.
K2.Button.prototype.isInROI = function(x, y) {
    if ((x >= this.ROILeft) && (y >= this.ROITop)) {
        if ((x <= (this.ROILeft + this.ROIWidth)) && (y <= (this.ROITop + this.ROIHeight))) {
            //console.log ("Point ", x, ",", y, " in ROI: ", this.ROILeft, ",", this.ROITop, this.ROIWidth, "x", this.ROIHeight);
            return true;
        }
        /*jsl:pass*/
    }
    //console.log ("Point ", x, ",", y, " NOT in ROI: ", this.ROILeft, ",", this.ROITop, this.ROIWidth, "x", this.ROIHeight);
    return false;
};

K2.Button.prototype.mousedown = K2.Button.prototype.touchstart = function(x, y) {

    //console.log ("Click down on ", x, y);

    if (this.isInROI(x, y)) {
        this.triggered = true;
        if (this.mode === 'persistent') {
            return undefined;
        }
        else if (this.mode === 'immediate') {
            //Simply add 1 to the button value until it rolls back.
            to_set = (this.values.buttonvalue + 1) % this.nButtons;
            ret = {'slot' : 'buttonvalue', 'value' : to_set};
            return ret;
        } 
    }
    
};

/*K2.Button.prototype.touchstart = function(x, y) {

    //console.log ("Click down on ", x, y);

    if (this.isInROI(x, y)) {
        
    //Simply add 1 to the button value until it rolls back.
    to_set = (this.values.buttonvalue + 1) % this.nButtons;
    ret = {'slot' : 'buttonvalue', 'value' : to_set};
    
    return ret;
    }
};*/

K2.Button.prototype.mouseup = K2.Button.prototype.touchend = function(curr_x, curr_y) {

    var to_set = 0,
        ret = {};

    if (this.mode === 'persistent') {
        if (this.triggered) {
            // Button is activated when cursor is still in the element ROI, otherwise action is void.
            if (this.isInROI(curr_x, curr_y)) {
    
                //Simply add 1 to the button value until it rolls back.
                to_set = (this.values.buttonvalue + 1) % this.nButtons;
                ret = {'slot' : 'buttonvalue', 'value' : to_set};
    
                // Click on button is completed, the button is no more triggered.
                this.triggered = false;
    
                return ret;
            }
        }
    }
    
    else if (this.mode === 'immediate') {
        if (this.triggered) {
            to_set = (this.values.buttonvalue - 1) % this.nButtons;
            ret = {'slot' : 'buttonvalue', 'value' : to_set};
            // Click on button is completed, the button is no more triggered.
            this.triggered = false;
            return ret;
        }
    } 

    // Action is void, button was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;

};

K2.Button.prototype.mouseout = function (curr_x, curr_y) {
    // On immediate, this count as a mouseup (undo)
    // On persistent, this counts as nothing (undo)
    if (this.mode === 'immediate') {
        return this.mouseup (curr_x, curr_y);
    }
};

// Setters
K2.Button.prototype.setValue = function(slot, value) {

    if ((value < 0) || (value > this.nButtons)) {
        return;
    }

    // Now, we call the superclass
    K2.Button.superclass.setValue.call(this, slot, value);

};

K2.Button.prototype.refresh_CANVAS2D = function(engine) {
    // Draw, if the element is visible.
    if (this.isVisible === true) {
        engine.context.drawImage(this.imagesArray[this.values.buttonvalue], this.xOrigin, this.yOrigin);
    }
    
};

K2.Button.prototype.setStatesNumber = function(number) {
    this.nButtons = number;
};

K2.Button.prototype.getStatesNumber = function() {
    return this.nButtons;
};

K2.Background = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Background, K2.UIElement);

K2.Background.prototype.getready = function(args) {

    if (typeof args === 'undefined') {
        throw new Error('Error: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Background.superclass.getready.call(this, args);

    /* TODO implement these */
    this.values = { 'selected'  : [],
                    'held'      : [],
                    'doubletap' : [],
                    'tap'       : []
                  };
                  
    this.defaultSlot = 'selected';

    this.image = args.image;

    this.setWidth(this.image.width);
    this.setHeight(this.image.height);


};

// This method returns the image object.
K2.Background.prototype.GetImage = function() {
    return this.image;
};

// This methods returns true if the point given belongs to this element.
K2.Background.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
        return false;
    }
};

K2.Background.prototype.mousedown = function(x, y) {

    if (this.isInROI(x, y)) {
        this.triggered = true;
    }
    return undefined;
};

K2.Background.prototype.mouseup = function(curr_x, curr_y) {

    var to_set = 0,
        ret = {};

    if (this.triggered) {

        if (this.isInROI(curr_x, curr_y)) {

            ret = {'slot' : 'selected', 'value' : [curr_x, curr_y]};

            // Click on bg is completed.
            this.triggered = false;

            return ret;
        }
    }

    // Action is void, button was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;

};

K2.Background.prototype.refresh_CANVAS2D = function(engine) {

    // Draw, if the element is visible.
    if (this.isVisible === true) {
        engine.context.drawImage(this.image, this.xOrigin, this.yOrigin);
    }

};


K2.ClickBar = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.ClickBar, K2.UIElement);


K2.ClickBar.prototype.getready = function(args) {

    var valueName, i;

     // Call the constructor from the superclass.
    K2.ClickBar.superclass.getready.call(this, args);

    // A ClickBar has its starting point, height, width and color.
    this.values = { 'barvalue': null
                  };
                  
    this.prevValue = null;

    this.defaultSlot = 'barvalue';
    
    this.color = args.color || 'orangered';
    this.lightColor = args.diffColor || 'darkorange';
    this.lighterColor = args.prevColor || 'orange';
    this.lightestColor = args.prevColor || '#FFBE00';
    this.landingHeight = args.landingHeight || 20;

    var height = args.height || 0;
    var width = args.width || 0;
    this.maxValue = args.maxValue || 1;
    this.minValue = args.minValue || 0;
     
    this.setWidth(width);
    this.setHeight(height);

};

K2.ClickBar.prototype.isInROI = function(x, y) {

    console.log ('y = ', y, "roitop = ", this.ROITop);
    if ((x >= this.ROILeft) && (y >= this.ROITop - this.landingHeight)) {
            console.log ("1st");
        if ((x <= (this.ROILeft + this.ROIWidth)) && (y <= (this.ROITop + this.ROIHeight + this.landingHeight))) {
            console.log ("In ROI!");
            return true;
        }
    }

    return false;
};

K2.ClickBar.prototype.calculateValue = function (x,y) {
    
    var clickedHeigth = y - this.yOrigin;
    console.log ("heigth on click is ", clickedHeigth, " pixels"); 
    var clickedValue = 1 - (clickedHeigth / this.height);
    console.log ("for a value of ", clickedValue, " (", clickedHeigth, " / ", this.height, ")");
        
    if (clickedValue > this.maxValue) {
        clickedValue = this.maxValue;
    }
        
    if (clickedValue < this.minValue) {
        clickedValue = this.minValue;
    }
    return clickedValue;
    
};


K2.ClickBar.prototype.tap = K2.ClickBar.prototype.touchstart = K2.ClickBar.prototype.mousedown = function(x, y) {
    
        if (this.isInROI (x,y)) {
            
            //if (!this.triggered) {
                //this.prevValue = this.values.barvalue;
                this.triggered = true;
            //}
            
            var clickedValue = this.calculateValue (x,y);
            
            if (clickedValue === this.values.barvalue) {
                return;
            }            
            //this.prevValue = this.values.barvalue;
            return {slot : 'barvalue', value : clickedValue};
       }
        
        
};

K2.ClickBar.prototype.drag = function(x, y) {

        if (this.isInROI (x,y)) {
            
            if (!this.triggered) {
                this.prevValue = this.values.barvalue;
                this.triggered = true;
            }
            
            var clickedValue = this.calculateValue (x, y);
            
            if (clickedValue === this.values.barvalue) {
                return;
            }
            
            return {slot : 'barvalue', value : clickedValue};
        }

};


K2.ClickBar.prototype.release = K2.ClickBar.prototype.dragend = K2.ClickBar.prototype.mouseup = function(x, y) {
    
    this.triggered = false;

    // ClickBar reacts on any release event. Check if the value has changed
    if (this.prevValue !== this.values.barvalue) {
        this.prevValue = this.values.barvalue;
        return {slot : 'barvalue', value : this.values.barvalue};
    }
    
};


K2.ClickBar.prototype.setValue = function(slot, value) {
    // Superclass
    K2.ClickBar.superclass.setValue.call(this, slot, value);

};

K2.ClickBar.prototype.refresh_CANVAS2D = function(engine) {

    if (this.isVisible === true) {
        
        if (this.triggered) {
            
            if (this.values.barvalue < this.prevValue) {
                engine.context.fillStyle = this.lightestColor;
                engine.context.fillRect (this.xOrigin, this.yOrigin + (1 - this.prevValue) * this.height,
                                 this.width,
                                 this.prevValue * this.height);
                engine.context.fillStyle = this.lightColor;
                engine.context.fillRect (this.xOrigin, this.yOrigin + (1 - this.values.barvalue) * this.height,
                                 this.width,
                                 this.values.barvalue * this.height);
            }
            else {
                engine.context.fillStyle = this.lightColor;
                engine.context.fillRect (this.xOrigin, this.yOrigin + (1 - this.values.barvalue) * this.height,
                                 this.width,
                                 this.values.barvalue * this.height);
                engine.context.fillStyle = this.lighterColor;
                engine.context.fillRect (this.xOrigin, this.yOrigin + (1 - this.prevValue) * this.height,
                                 this.width,
                                 this.prevValue * this.height);
            }
                             
        }
        else {
            // Value, in color
            engine.context.fillStyle = this.color;
            engine.context.fillRect (this.xOrigin, this.yOrigin + (1 - this.values.barvalue) * this.height,
                                 this.width,
                                 this.values.barvalue * this.height);
                             }
    }
};

K2.Gauge = function(args) {
	if (arguments.length) {
		this.getready(args);
	}
};

K2.extend(K2.Gauge, K2.UIElement);

K2.Gauge.prototype.getready = function(args) {

	if ( typeof args === 'undefined') {
		throw new Error('Error: args is undefined!');
	}

	// Call the constructor from the superclass.
	K2.Gauge.superclass.getready.call(this, args);

	this.values = {
		'gaugevalue' : null,
		'midgaugevalue' : null,
		'selected' : [],
		'held' : [],
		'doubletap' : [],
		'tap' : []
	};

	this.defaultSlot = 'gaugevalue';

	this.prevValue = this.values.gaugevalue;

	this.setWidth(args.width);
	this.setHeight(args.height);

	this.color = args.color || ["#47D147","#70DB70","#99E699"];
	this.bgColor = args.bgColor || "#222";

	this.radius = args.radius || ((this.width < this.height) ? Math.floor(this.width / 2) : Math.floor(this.height / 2));
	this.thickness = args.thickness || ((this.width < this.height) ? Math.floor(this.width / 3) : Math.floor(this.height / 3));

	this.animationInterval = null;

};

// This methods returns true if the point given belongs to this element.
K2.Gauge.prototype.isInROI = function(x, y) {
	return true;
};

K2.Gauge.prototype.calculateAngle = function (x,y) {
	
	var centerX = this.xOrigin + this.width / 2;
	var centerY = this.yOrigin + this.height / 2;
	
	console.log ("Point is: ", x, y, "Center is: ", centerX, centerY);
	
	var radtan = Math.atan2 (x - centerX, y - centerY);
	console.log('radiant atan ', radtan);
	
	var degreetan = radtan * (180 / Math.PI);
	degreetan = 180 - degreetan;
	console.log('degree atan ', degreetan);
	
	var range_val = K2.MathUtils.linearRange(0, 360, 0, 1, Math.floor(degreetan));
	return range_val;
	
};

K2.Gauge.prototype.tap = K2.Gauge.prototype.mousedown = K2.Gauge.prototype.touchstart = function(x, y) {
	
	var dist = K2.MathUtils.distance(x, y, this.xOrigin + this.width / 2, this.yOrigin + this.height / 2);
	console.log("dist is, ", dist, " radius is ", this.radius, " thickness is ", this.thickness);
	
	if ((dist > this.radius - this.thickness / 2) && (dist < this.radius + this.thickness / 2)) {
		
		console.log("down / tapped Inside the dial");
		this.triggered = true;

		var range_val = this.calculateAngle (x,y);
		
		this.prevValue = this.values.gaugevalue;
		var ret = {'slot' : 'gaugevalue', 'value' : range_val};
		
		return ret;
	}

	return undefined;
};

K2.Gauge.prototype.drag = K2.Gauge.prototype.mousemove = function (x, y) {
	
	if (this.triggered) {
		console.log ("triggered mousemove");
		var range_val = this.calculateAngle (x,y);
		//this.prevValue = this.values.gaugevalue;
		var ret = {'slot' : 'gaugevalue', 'value' : range_val};
		return ret;
	}
};

K2.Gauge.prototype.release = K2.Gauge.prototype.dragend = K2.Gauge.prototype.mouseup = function(curr_x, curr_y) {

	if (this.triggered) {
		this.triggered = false;
		this.prevValue = this.values.gaugevalue;
		var ret = {'slot' : 'gaugevalue', 'value' : this.values.gaugevalue};
		return ret;
	}

};

K2.Gauge.prototype.setValue = function(slot, value) {

	// Call the superclass
	K2.Gauge.superclass.setValue.call(this, slot, value);

};

K2.Gauge.prototype.refresh_CANVAS2D = function(engine) {
	// Draw, if the element is visible.
	if (this.isVisible === true) {
		var ctx = engine.context;

		ctx.beginPath();

		// Background arc, 360 degrees
		this.drawGauge(ctx, 1, this.bgColor);

		// Accessory arcs
		if (this.triggered) {
			
			if (this.values.gaugevalue <= this.prevValue) {
				this.drawGauge(ctx, this.prevValue, this.color[2]);
				this.drawGauge(ctx, this.values.gaugevalue, this.color[1]);
			}
			else {
				this.drawGauge(ctx, this.values.gaugevalue, this.color[2]);
				this.drawGauge(ctx, this.prevValue, this.color[1]);
			}
			
		}
		
		else {
			// Foreground (gauge) arc, degrees [0,360] linearly interpolated from gaugevalue [0,1]
			this.drawGauge(ctx, this.values.gaugevalue, this.color[0]);
		}

	}
};

K2.Gauge.prototype.drawGauge = function(ctx, value, color) {

	var degrees, radians;

	degrees = K2.MathUtils.linearRange(0, 1, 0, 360, value);
	radians = degrees * Math.PI / 180;

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = this.thickness;

	if (value === 1) {
		ctx.arc(this.xOrigin + this.width / 2, this.yOrigin + this.height / 2, this.radius, 0, Math.PI * 2, false);
	} else {
		//The arc starts from the rightmost end. If we deduct 90 degrees from the angles
		//the arc will start from the topmost end
		ctx.arc(this.xOrigin + this.width / 2, this.yOrigin + this.height / 2, this.radius, -90 * Math.PI / 180, radians - 90 * Math.PI / 180, false);
	}
	ctx.stroke();
}; 
K2.Grid = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Grid, K2.UIElement);

K2.Grid.prototype.getready = function(args) {

    if (args === undefined) {
        throw new Error('Error: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Grid.superclass.getready.call(this, args);

    this.setWidth(args.width);
    this.setHeight(args.height);

    // Now that all required properties have been inherited
    // from the parent class, define extra ones from this class
    this.values = {'selected' : []};
    this.defaultSlot = '';

    this.triggered = false;

    this.rows = args.rows || 4;
    this.columns = args.columns || 4;
    // line or dashed
    this.style = args.style || 'line';
    // line color
    this.lineColor = args.lineColor || "#eee";
    // bg color
    this.bgColor = args.bgColor || "white";
    // Dashed array
    this.dashArray = args.dashArray;
    // line width
    this.lineWidth = args.lineWidth || 0.1; 

    if ((this.rows < 0) || (this.columns < 0)) {
        throw new Error('Invalid number of row / columns ' + this.rows + ' / ' + this.columns);
    }

};

// This method returns true if the point given belongs to this Grid.
K2.Grid.prototype.isInROI = function(x, y) {
    if ((x >= this.ROILeft) && (y >= this.ROITop)) {
        if ((x <= (this.ROILeft + this.ROIWidth)) && (y <= (this.ROITop + this.ROIHeight))) {
            return true;
        }
        /*jsl:pass*/
    }
    return false;
};

K2.Grid.prototype.mousedown = function(x, y) {

    //console.log ("Click down on ", x, y);

    if (this.isInROI(x, y)) {
        this.triggered = true;
    }
    return undefined;
};

K2.Grid.prototype.mouseup = function(curr_x, curr_y) {

    if (this.triggered) {
        // Grid is activated when cursor is still in the element ROI, otherwise action is void.
        if (this.isInROI(curr_x, curr_y)) {

            // Click on Grid is completed, the Grid is no more triggered.
            this.triggered = false;

            return {slot: 'selected', value: [curr_x, curr_y]};
        }
    }

    // Action is void, Grid was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;

};

// Setters
K2.Grid.prototype.setValue = function(slot, value) {

	K2.Grid.superclass.setValue.call(this, slot, value);

};

K2.Grid.prototype.refresh_CANVAS2D = function(engine) {
    
    if (this.isVisible === true) {

        var context = engine.context;

        var rowSpace = Math.floor(this.height / this.rows);
        var columnSpace = Math.floor(this.width / this.columns);
        
        // Draw background
        context.fillStyle = this.bgColor;
        context.fillRect(this.xOrigin, this.yOrigin, this.width, this.height);

		context.beginPath();
		// Draw grid lines
		context.lineWidth = this.lineWidth;
		
        // Draw horizontal lines
        for (var x = this.xOrigin + 0.0; x < this.xOrigin + this.width; x += columnSpace) {
			
			if (this.style === 'line') {
				context.moveTo(x, this.yOrigin);
				context.lineTo(x, this.yOrigin + this.height);
			}
			else if (this.style === 'dashed') {
				context.dashedLine(x, this.yOrigin, x, this.yOrigin + this.height, this.dashArray);
			}
		}
		// Draw vertical lines
		for (var y = this.yOrigin + 0.0; y < this.yOrigin + this.height; y += rowSpace) {

            if (this.style === 'line') {
                context.moveTo(this.xOrigin, y);
                context.lineTo(this.xOrigin + this.width, y);
            }
            else if (this.style === 'dashed') {
                context.dashedLine(this.xOrigin, y, this.xOrigin + this.width, y, this.dashArray);
            }
		}

		context.strokeStyle = this.lineColor;
		context.stroke();
		context.closePath();
    }
    
};
K2.Knob = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Knob, K2.UIElement);

K2.Knob.prototype.getready = function(args) {

    if (args === undefined) {
        throw new Error('Error: specArgs is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Knob.superclass.getready.call(this, args);

    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class

    //Default value is 0
    this.values = {'knobvalue' : 0};
    this.defaultSlot = 'knobvalue';

    this.sensitivity = args.sensitivity || 2000;
    this.imagesArray = args.imagesArray || null;
    
    // Can be 'atan' or 'updown'
    this.knobMethod = args.knobMethod || 'atan';
    
    // In degrees, only important when knobMethod is 'atan'
    this.bottomAngularOffset = args.bottomAngularOffset;
    
    var width = 0,
        height = 0;

    if (this.imagesArray.length < 1) {
        throw new Error('Invalid images array length, ' + this.imagesArray.length);
    }
    
    if (this.imagesArray.length == 1) {
        width = args.tileWidth;
        height = args.tileHeight;
        this.imageNum = args.imageNum;
    }

    else {
        this.imageNum = this.imagesArray.length;
        // Calculate maximum width and height.
        for (var i = 0, len = this.imagesArray.length; i < len; i += 1) {
            if (this.imagesArray[i].width > width) {
                width = this.imagesArray[i].width;
            }
            if (this.imagesArray[i].height > height) {
                height = this.imagesArray[i].height;
            }
        }
    }

    // Set them.
    this.setWidth(width);
    this.setHeight(height);

};


// This method returns an image index given the knob value.
K2.Knob.prototype.getImageNum = function() {
    if ((this.values.knobvalue < 0) || (this.values.knobvalue > 1)) {
        // Do nothing
        return undefined;
    }
    var ret = Math.round(this.values.knobvalue * (this.imageNum - 1));
    return ret;
};

K2.Knob.prototype.getImage = function() {

    var ret = this.getImageNum();
    return this.imagesArray[ret];
};

K2.Knob.prototype.calculateAngle = function (x,y) {
    
    // IMPORTANT: THE FIRST KNOB IMAGE MUST BE THE 0 POSITION
    // 0 POSITION IS THE BOTTOM INTERSECTION WITH THE UNITARY CIRCUMFERENCE
	// TODO MAKE IT PARAMETRIC
	
	var centerX = this.xOrigin + this.width / 2;
	var centerY = this.yOrigin + this.height / 2;
	
	console.log ("Point is: ", x, y, "Center is: ", centerX, centerY);
	
	var radtan = Math.atan2 (x - centerX, y - centerY);
	console.log('radiant atan ', radtan);
	// normalize arctan
	if (radtan < 0) {
        radtan += (2 * Math.PI);
    }
	console.log ('radiant atan, normalized, is ', radtan);
	
	var degreetan = radtan * (180 / Math.PI);
	console.log('degree atan is', degreetan);
	
	// now we have a value from 0 to 360, where 0 is the lowest 
	// intersection with the circumference. degree increases anticlockwise
	// Make it clockwise:
	degreetan = 360 - degreetan;
	
	if (typeof this.bottomAngularOffset !== 'undefined') {
	    // Knob starts and ends with an (angular) symmetrical offset, calculated
	    // from the 0 degrees intersection 
	    // This is quite common in audio knobs
	    degreetan = K2.MathUtils.linearRange(0, 360, -this.bottomAngularOffset, 360 + this.bottomAngularOffset, degreetan);
	    if (degreetan < 0) {
	        degreetan = 0;
	    }
	    if (degreetan > 360) {
	        degreetan = 360;
	    }
	}
	
	var range_val = K2.MathUtils.linearRange(0, 360, 0, 1, Math.floor(degreetan));
	console.log ('value is', range_val);
	return range_val;
	
};

// This method returns true if the point given belongs to this knob.
K2.Knob.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

K2.Knob.prototype.dragstart = K2.Knob.prototype.mousedown = K2.Knob.prototype.touchstart = function(x, y) {

    var inROI = this.isInROI(x, y);
    // Save the starting point if event happened in our ROI.
    if (inROI) {
        this.start_x = x;
        this.start_y = y;
        
        if (this.knobMethod === 'atan') {
            var range_val = this.calculateAngle (x,y);
            var ret = {'slot' : 'knobvalue', 'value' : range_val};
            return ret;
        }
    }
    
    // No value has been changed.
    return undefined;
};

K2.Knob.prototype.dragend = K2.Knob.prototype.mouseup = function(x, y) {

    // Reset the starting point.
    this.start_x = undefined;
    this.start_y = undefined;

    // No value has been changed
    return undefined;

};

K2.Knob.prototype.drag = K2.Knob.prototype.mousemove = function(curr_x, curr_y) {

	var ret;

	if (this.knobMethod === 'updown') {
		// TODO null or typeof
	    if ((this.start_x !== undefined) && (this.start_y !== undefined)) {
	
	        // This means that the mouse is currently down.
	        var deltaY = 0,
	            temp_value,
	            to_set;
	
	        deltaY = curr_y - this.start_y;
	
	        temp_value = this.values.knobvalue;
	
	        // Todo set sensitivity.
	        to_set = temp_value - deltaY / this.sensitivity;
	
	        if (to_set > 1) {
	            to_set = 1;
	        }
	        if (to_set < 0) {
	            to_set = 0;
	        }
	
	        ret = {'slot' : 'knobvalue', 'value' : to_set};
	
	        return ret;
	    }
	}
	
	else if (this.knobMethod === 'atan') {
		if ((this.start_x !== undefined) && (this.start_y !== undefined)) {
			var range_val = this.calculateAngle (curr_x, curr_y);
			ret = {'slot' : 'knobvalue', 'value' : range_val};
			return ret;
		}
	}
	

    // The mouse is currently up; ignore the event notify.
    return undefined;

};

// Setters
K2.Knob.prototype.setValue = function(slot, value) {
    var temp_value = value;

    if ((temp_value < 0) || (temp_value > 1)) {
        // Out of range; do not set
        return;
    }

    // Call the superclass
    K2.Knob.superclass.setValue.call(this, slot, value);

};

K2.Knob.prototype.refresh_CANVAS2D = function(engine) {

    // Draw if visible.
    if (this.isVisible === true) {
        if (this.imagesArray.length > 1) {
            // Get the image to draw
            var imageNum = this.getImageNum();
            // Draw the image on the canvas
            engine.context.drawImage(this.imagesArray[imageNum], this.xOrigin, this.yOrigin);
        }
        else if (this.imagesArray.length == 1) {
            var sx = 0;
            var sy = this.height * this.getImageNum();
            engine.context.drawImage(this.imagesArray[0], sx, sy, this.width, this.height, this.xOrigin, this.yOrigin, this.width, this.height);
        }
    }
    
};
K2.Label = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Label, K2.UIElement);

K2.Label.prototype.getready = function(args) {

    // Call the constructor from the superclass.
    K2.Label.superclass.getready.call(this, args);

    this.values = {'labelvalue' : ''};
    this.defaultSlot = 'labelvalue';

    this.textColor = args.textColor || 'black';
    
    this.setWidth(args.width);
    this.setHeight(args.height);

};

// This methods returns true if the point given belongs to this element.
K2.Label.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

// Setters
K2.Label.prototype.setValue = function(slot, value) {
    K2.Label.superclass.setValue.call(this, slot, value);
};

K2.Label.prototype.refresh_CANVAS2D = function(engine) {

    var text;

    if (this.isVisible === true) {

        if (typeof this.objParms !== 'undefined') {
            
            if (typeof this.objParms.textBaseline !== 'undefined') {
                engine.context.textBaseline =  this.objParms.textBaseline;
            }
            if (typeof this.objParms.textAlign !== 'undefined') {
                engine.context.textAlign =  this.objParms.textAlign;
            }
            if (typeof this.objParms.font !== 'undefined') {
                engine.context.font =  this.objParms.font;
            }
            
        }
        engine.context.fillStyle = this.textColor;
        engine.context.fillText(this.values.labelvalue, this.xOrigin, this.yOrigin);
    }
};
K2.RotKnob = function (args) {
    if (arguments.length) {
        this.getready(args);
    }
};

// TODO should it extend Knob? Or maybe we should make a GenericKnob class?
K2.extend(K2.RotKnob, K2.UIElement);

K2.RotKnob.prototype.getready = function(args) {

    if (typeof args === 'undefined') {
        throw ('RotKnob constructor: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.RotKnob.superclass.getready.call(this, args);

    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class

    //Default value is 0
    this.values = {'knobvalue' : 0,
                   'realknobvalue' : 0};

    this.defaultSlot = 'knobvalue';

    // Init angular value. Describes the orientation of the rotary part image,
    // relative to the angular 0 point.
    if (args.initAngValue === undefined) {
        this.initAngValue = 0;
    }
    else {
        this.initAngValue = args.initAngValue;
    }

    // Defines the rotation direction in relation to the movement type.
    if (args.moveDirection == 'anticlockwise') {
        this.moveDirection = -1;
    }
    else {
        // Default, clockwise.
        this.moveDirection = 1;
    }

    // Start angular value. Defines the start point of the knob.
    this.startAngValue = args.startAngValue || 0;

    // Stop angular value. Defines the stop point of the knob.
    this.stopAngValue = args.stopAngValue || 360;

    // Steps. Defines the number of discrete steps of the knob. Infinite if
    // left undefined.
    this.angSteps = args.angSteps;

    var sens = args.sensitivity || 2000;
    // Scale sensivity according to the knob angle.
    this.sensitivity = Math.round((sens / 360) * (Math.abs(this.stopAngValue - this.startAngValue)));

    // Can be 'atan' or 'updown'
    this.knobMethod = args.knobMethod || 'atan';

    this.image = args.image;

    this.setWidth(this.image.width);
    this.setHeight(this.image.height);
    
    this.start_x = null;
    this.start_y = null;
};


// This method returns a rotating amount given the RotKnob value.
K2.RotKnob.prototype.getRotateAmount = function() {
    if ((this.values.knobvalue < 0) || (this.values.knobvalue > 1)) {
        // Do nothing
        return undefined;
    }

    // value in degrees.
    var angularValue = this.values.knobvalue * 360;
    //console.log ("angularValue: ", angularValue);

    // Linear interpolation between startAngValue and stopAngValue
    var rangedAngularValue = 360 - (angularValue * (this.startAngValue - this.stopAngValue) / 360 + this.stopAngValue) % 360;
    //console.log ("rangedAngularValue: ", rangedAngularValue);

    // Add the angular offset, if any.
    var offsetAngularValue = (360 - this.initAngValue + rangedAngularValue) % 360;

    // Convert to radians
    var ret = offsetAngularValue * Math.PI / 180;
    return ret;
};

K2.RotKnob.prototype.getRangedAmount = function (angle) {
        
    var endAngOffset = this.stopAngValue - this.initAngValue;
    var startAngOffset = this.startAngValue - this.initAngValue;
    
    console.log ("start -> end", startAngOffset, endAngOffset);
    
    if ((angle > this.initAngValue) && (startAngOffset < 0)) {
        console.log ("Angle now is", angle);
        angle = -(360 - angle);
    }
    
    var rangedAng = K2.MathUtils.linearRange(startAngOffset, endAngOffset, 0, 1, angle);
    
    console.log ("knob value", rangedAng);
    
    if (rangedAng < 0) {
        rangedAng = 0;
    }
    if (rangedAng > 1) {
        rangedAng = 1;
    }
    
    return rangedAng;
    
    
};

// This method returns true if the point given belongs to this RotKnob.
K2.RotKnob.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

K2.RotKnob.prototype.calculateAngle = function (x,y) {
    
    var centerX = this.xOrigin + this.width / 2;
    var centerY = this.yOrigin + this.height / 2;
    
    console.log ("Point is: ", x, y, "Center is: ", centerX, centerY);
    
    var radtan = Math.atan2 (x - centerX, y - centerY);
    console.log('radiant atan ', radtan);
    
    var degreetan = radtan * (180 / Math.PI);
    degreetan = 180 - degreetan;
    
    // Calculate it relative to initAngValue
    var degreeOffset = (degreetan - this.initAngValue);
    
    if (degreeOffset < 0) {
        degreeOffset = 360 + degreeOffset;
    }
    var degreeMod = (degreetan - this.initAngValue) % 360;
    
    console.log('degreetan -> offset', degreetan, degreeOffset, degreeMod);
    
    var range_val = this.getRangedAmount (Math.floor(degreeOffset));
    
    return range_val;
    
};

K2.RotKnob.prototype.dragstart = K2.RotKnob.prototype.mousedown = K2.RotKnob.prototype.touchstart = function(x, y) {

    var inROI = this.isInROI(x, y);
    // Save the starting point if event happened in our ROI.
    if (inROI) {
        this.start_x = x;
        this.start_y = y;
        
        if (this.knobMethod === 'atan') {
            var range_val = this.calculateAngle (x,y);
            var ret = {'slot' : 'knobvalue', 'value' : range_val};
            return ret;
        }
        
    }
    
    // No value has been changed.
    return undefined;
};

K2.RotKnob.prototype.dragend = K2.RotKnob.prototype.mouseup = K2.RotKnob.prototype.touchend = function(x, y) {

    // Reset the starting point.
    this.start_x = null;
    this.start_y = null;

    // No value has been changed
    return undefined;

};

K2.RotKnob.prototype.drag = K2.RotKnob.prototype.mousemove = function(curr_x, curr_y) {
    
    var ret;

    if (this.knobMethod === 'updown') {
        if ((this.start_x !== null) && (this.start_y !== null)) {
    
            // This means that the mouse is currently down.
            var deltaY = 0,
                temp_value,
                to_set;
    
            deltaY = curr_y - this.start_y;
    
            temp_value = this.values.realknobvalue;
    
            to_set = temp_value - ((deltaY / this.sensitivity) * this.moveDirection);
    
            if (to_set > 1) {
                to_set = 1;
            }
            if (to_set < 0) {
                to_set = 0;
            }
    
            ret = {'slot' : 'knobvalue', 'value' : to_set};
    
            return ret;
        }
    }
    
    else if (this.knobMethod === 'atan') {
        if (this.isInROI(curr_x, curr_y)) {
            if ((this.start_x !== null) && (this.start_y !== null)) {
                var range_val = this.calculateAngle (curr_x, curr_y);
                ret = {'slot' : 'knobvalue', 'value' : range_val};
                return ret;
            }
        } 
    }

    // The mouse is currently up; ignore the event notify.
    return undefined;

};

// Setters
K2.RotKnob.prototype.setValue = function(slot, value) {
    var stepped_new_value;

    if ((value < 0) || (value > 1)) {
        //Just do nothing.
        //console.log("RotKnob.prototype.setValue: VALUE INCORRECT!!");
        return;
    }

    if (this.values[slot] === undefined) {
        throw new Error('Slot ' + slot + ' not present or value undefined');
    }

    if ((value === this.values[slot]) || (value === this.values['real' + slot])) {
        // Nothing to do.
        return;
    }

    this.values['real' + slot] = value;

    if ((this.angSteps) !== undefined) {

        var single_step = 1 / this.angSteps;
        stepped_new_value = Math.floor(value / single_step) * single_step;

        // No change in step -> no change in state or representation. Return.
        if (stepped_new_value === this.values[slot]) {
            return;
        }
    }

    else {
        stepped_new_value = value;
    }

    console.log('Value is: ', stepped_new_value);

    // Now, we call the superclass
    K2.RotKnob.superclass.setValue.call(this, slot, stepped_new_value);

};

K2.RotKnob.prototype.refresh_CANVAS2D = function(engine) {

    // Draw if visible.
    if (this.isVisible === true) {
        var rot = this.getRotateAmount();
        K2.CanvasUtils.drawRotate(engine.context, {image: this.image, x: this.xOrigin, y: this.yOrigin, rot: rot});
    }
    
};
K2.Slider = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Slider, K2.UIElement);

K2.Slider.prototype.getready = function(args) {

    if (typeof args === 'undefined') {
        throw ('Slider error: args is undefined!');
    }

    // Call the constructor from the superclass.
    K2.Slider.superclass.getready.call(this, args);

    //now that all required properties have been inherited
    //from the parent class, define extra ones from this class

    // Default value is 0
    this.values = {'slidervalue' : 0};
    this.defaultSlot = 'slidervalue';

    this.width = 0;
    this.height = 0;

    this.sliderImage = args.sliderImg;
    this.knobImage = args.knobImg;
    this.type = args.type;

    if ((this.type !== 'horizontal') && (this.type !== 'vertical')) {
        // Default
        this.type = 'vertical';
    }

    this.calculateDimensions();

};


// This method returns an x position given the Slider value.
K2.Slider.prototype.getKnobPosition = function() {
    var ret;

    if ((this.values.slidervalue < 0) || (this.values.slidervalue > 1)) {
        // Do nothing
        return undefined;
    }
    // We must take in account the half-knob thing, here.
    switch (this.type) {

      case 'horizontal':
          ret = Math.round(this.values.slidervalue * this.width + this.zeroLimit);
      break;

      case 'vertical':
          ret = Math.round(this.values.slidervalue * this.height + this.zeroLimit);
      break;

      default:
          throw new Error('Error: Slider orientation is undefined!');
      }

    return ret;
};

// This method returns true if the point given belongs to this Slider.
K2.Slider.prototype.isInROI = function(x, y) {
    switch (this.type) {
        case 'horizontal':
            if ((x > this.getKnobPosition()) && (y > this.ROITop)) {
                if ((x < (this.getKnobPosition() + this.kWidth)) && (y < (this.ROITop + this.kHeight))) {
                    return true;
                }
            }
        break;

        case 'vertical':
            if ((y > this.getKnobPosition()) && (x > this.ROILeft)) {
                if ((y < (this.getKnobPosition() + this.kHeight)) && (x < (this.ROILeft + this.kWidth))) {
                    return true;
                }
            }
        break;

        default:
          throw new Error('Error: Slider orientation is undefined!');
      }

    // Slider is in ROI if and only if we drag the knob.
    return false;
};

K2.Slider.prototype.dragstart = K2.Slider.prototype.mousedown = function(x, y) {
    if (this.isInROI(x, y)) {
        this.triggered = true;
        // This remembers the difference between the current knob start and
        // the point where we started dragging.
        switch (this.type) {

            case 'horizontal':
                this.drag_offset = x - this.getKnobPosition();
            break;

            case 'vertical':
                this.drag_offset = y - this.getKnobPosition();
            break;

            default:
              throw new Error('Error: Slider orientation is undefined!');
          }
    }
    return undefined;
};

K2.Slider.prototype.dragend = K2.Slider.prototype.mouseup = function(x, y) {
    this.triggered = false;
    this.drag_offset = undefined;
    return undefined;
};

K2.Slider.prototype.drag = K2.Slider.prototype.mousemove = function(curr_x, curr_y) {

        if (this.triggered === true) {
            var to_set,
                ret;

            // We must compensate for the point where we started to drag if
            // we want a seamless drag animation.
            switch (this.type) {
                case 'horizontal':
                    to_set = (curr_x - this.zeroLimit - this.drag_offset) / (this.width);
                break;

                case 'vertical':
                    to_set = (curr_y - this.zeroLimit - this.drag_offset) / (this.height);
                break;

                default:
                  throw new Error('Error: Slider orientation is undefined!');
              }

            if (to_set > 1) {
                to_set = 1;
            }
            if (to_set < 0) {
                to_set = 0;
            }

            ret = {'slot' : 'slidervalue', 'value' : to_set};

            return ret;
        }

        return undefined;
    };

// Setters
K2.Slider.prototype.setValue = function(slot, value) {

    if ((value < 0) || (value > 1)) {
        // Can happen if the user drags too much.
        return;
    }

    // Now, we call the superclass
    K2.Slider.superclass.setValue.call(this, slot, value);

};

K2.Slider.prototype.refresh_CANVAS2D = function(engine) {

    if (this.isVisible === true) {
        
        engine.context.drawImage (this.sliderImage, this.xOrigin, this.yOrigin);
    
        switch (this.type) {
            case 'horizontal':
                engine.context.drawImage (this.knobImage, this.getKnobPosition(), this.yOrigin);
            break;
    
            case 'vertical':
                engine.context.drawImage (this.knobImage, this.xOrigin, this.getKnobPosition());
            break;
    
            default:
              throw new Error('Error: Slider orientation unknown: ', this.type);
        }
    }

    
};

K2.Slider.prototype.calculateDimensions = function() {

    // The length of the slider knob.
    this.kWidth = this.knobImage.width;
    this.kHeight = this.knobImage.height;

    //TODO Maybe we should override this function, to set the ROI to the fader.
    this.setWidth(this.sliderImage.width);
    this.setHeight(this.sliderImage.height);

    // The fader can stick out by an half of its length at the two extremes of the
    // slider. Let's store some useful variables.
        switch (this.type) {
        case 'horizontal':
            this.totalStride = this.width + this.kWidth;
            this.additionalEndSpace = Math.round(this.kWidth / 2);
            this.zeroLimit = this.xOrigin - this.additionalEndSpace;
            this.oneLimit = this.xOrigin + this.width + this.additionalEndSpace;
        break;

        case 'vertical':
            this.totalStride = this.height + this.kHeight;
            this.additionalEndSpace = Math.round(this.kHeight / 2);
            this.zeroLimit = this.yOrigin - this.additionalEndSpace;
            this.oneLimit = this.yOrigin + this.height + this.additionalEndSpace;
        break;

        default:
          throw new Error('Error: Slider orientation is undefined!');
      }

};

K2.Slider.prototype.setGraphicWrapper = function(wrapper) {

    // Call the superclass.
    K2.Slider.superclass.setGraphicWrapper.call(this, wrapper);

    // Get the wrapper primitive functions
    this.drawClass = wrapper.initObject([{objName: 'drawImage',
                                           objParms: this.objParms}]);

};

K2.Wavebox = function(args) {
    if (arguments.length) {
        this.getready(args);
    }
};

K2.extend(K2.Wavebox, K2.UIElement);

K2.Wavebox.prototype.getready = function(args) {

    // Call the constructor from the superclass.
    K2.Wavebox.superclass.getready.call(this, args);

    this.values = {'waveboxposition' : 0,
                   'startsample' : 0,
                   'endsample' : null,
                   'waveboxsignal' : [],
                   'xPos' : 0,
                   'yPos' : 0
               };
    this.defaultSlot = 'waveboxposition';

    this.setWidth(args.width);
    this.setHeight(args.height);
    this.binMethod = args.binMethod || 'minmax';
    this.orientation = args.orientation || 0;
    this.waveColor = args.waveColor || 'black';

};

// This methods returns true if the point given belongs to this element.
K2.Wavebox.prototype.isInROI = function(x, y) {
    if ((x > this.ROILeft) && (y > this.ROITop)) {
        if ((x < (this.ROILeft + this.ROIWidth)) && (y < (this.ROITop + this.ROIHeight))) {
            return true;
        }
    }
    return false;
};

K2.Wavebox.prototype.tap = K2.Wavebox.prototype.mousedown = function(x, y) {

    //console.log ("Click down on ", x, y);

    if (this.isInROI(x, y)) {
        this.triggered = true;
    }
    return undefined;
};

K2.Wavebox.prototype.release = K2.Wavebox.prototype.mouseup = function(curr_x, curr_y) {

    var to_set = 0,
        ret = {};

    if (this.triggered) {
        // Button is activated when cursor is still in the element ROI, otherwise action is void.
        if (this.isInROI(curr_x, curr_y)) {

            if (this.orientation === 0) {
                ret = {'slot' : 'xPos', 'value' : curr_x};
            }

            else if (this.orientation === 1) {
                ret = {'slot' : 'yPos', 'value' : curr_y};
            }

            else {
                console.error('orientation invalid, this will probably break something');
            }

            // Click on button is completed, the button is no more triggered.
            this.triggered = false;

            return ret;
        }
    }

    // Action is void, button was upclicked outside its ROI or never downclicked
    // No need to trigger anything, ignore this event.
    return undefined;

};

K2.Wavebox.prototype.setValue = function(slot, value) {

	console.log('Setting ' + slot + ' to ' + value);

    // Won't call the parent: this element has a custom way to set values.

    if (this.values[slot] === undefined) {
        throw new Error('Slot ' + slot + ' not present or value undefined');
    }

    if (this.values[slot] === value) {
        //Nothing changed.
        return;
    }

    // Check some boundaries.

    if ((slot === 'startsample') || (slot === 'endsample')) {
        if (value < 0) {
            throw new Error('Error: Trying to set ', slot, ' less than 0: ', value);
        }
        if (typeof this.values.waveboxsignal !== 'undefined') {
            if (value > this.values.waveboxsignal.length) {
                throw new Error('Error: Trying to set ', slot, ' bigger than signal length: ', value, ' > ', this.values.waveboxsignal.length);
            }
        }
    }

    if (slot === 'startsample') {
        if (value > this.values.endsample) {
                throw new Error('Error: Trying to set startsample > endsample: ', value, ' > ', this.values.endsample);
            }
    }

    if (slot === 'endsample') {
        if (value < this.values.startample) {
                throw new Error('Error: Trying to set endsample < startsample: ', value, ' < ', this.values.startsample);
            }
    }

    this.values[slot] = value;

    // When we change the signal, we know we must reset the whole thing.
    if (slot === 'waveboxsignal') {
        //Take the whole waveform
        this.values.endsample = this.values.waveboxsignal.length;
        this.values.startsample = 0;
    }

    if (slot == 'xPos') {
        if (value <= this.width) {
            this.values.xPos = value;
        }
    }

    if (slot == 'yPos') {
        if (value <= this.height) {
            console.log('Setting yPos to ' + value);
            this.values.yPos = value;
        }
        else {
            console.log('NOT setting yPos to ' + value + ' because height is ' + this.height);
        }
    }
};

K2.Wavebox.prototype.refresh_CANVAS2D = function(engine) {

		//TODO there must be a less-repetitive way of handling orientations

        if (this.isVisible === true) {

            var context = engine.context;
            context.fillStyle = this.waveColor;

            var y_point,
                x_point,
                bin_size,
                bin_value;

            // Default
            var dim1 = this.width;
            var dim2 = this.height;

            if (this.orientation === 1) {
                dim1 = this.height;
                dim2 = this.width;
            }

            var binFunction;

            if (this.binMethod == 'minmax') {
                binFunction = this.calculateBinMix;
            }
            else if (this.binMethod == 'none') {
                binFunction = this.calculateBinNone;
            }
            else {
                console.log('Error: no binMethod!');
            }

            var i = 0;
            // One bin per pixel
            bin_size = parseInt(((this.values.endsample - this.values.startsample) / dim1), 10);

            if (true) {

				context.beginPath();
				//Start from the middle
				if (this.orientation === 0) {
                    context.moveTo(this.xOrigin, dim2 * 0.5 + this.yOrigin);
                }
                else if (this.orientation === 1) {
                    context.moveTo(this.xOrigin + dim2 * 0.5, this.yOrigin);
                }

                for (i = 0; i < dim1; i += 1) {

                    bin_value = binFunction(i, bin_size, this.values);

                    if (this.orientation === 0) {
	                    y_point = (dim2 - (((bin_value.max + 1) * (dim2)) / 2)) + this.yOrigin;
	                    x_point = i + this.xOrigin;
                    }
                    else if (this.orientation === 1) {
                        y_point = i + this.yOrigin;
                        x_point = (dim2 - (((bin_value.max + 1) * (dim2)) / 2)) + this.xOrigin;
                    }

                    context.lineTo(x_point, y_point);

                }
                if (this.orientation === 0) {
                    context.lineTo(dim1 + this.xOrigin, dim2 * 0.5 + this.yOrigin);
                }
                else if (this.orientation === 1) {
                    context.lineTo(dim2 * 0.5 + this.xOrigin, dim1 + this.yOrigin);
                }

               context.fill();
               context.closePath();

               context.beginPath();

				if (this.orientation === 0) {
                    context.moveTo(this.xOrigin, dim2 * 0.5 + this.yOrigin);
                }
                else if (this.orientation === 1) {
                    context.moveTo(this.xOrigin + dim2 * 0.5, this.yOrigin);
                }

                for (i = 0; i < dim1; i += 1) {

                    bin_value = binFunction(i, bin_size, this.values);

                    if (this.orientation === 0) {
	                    y_point = (dim2 - (((bin_value.min + 1) * (dim2)) / 2)) + this.yOrigin;
	                    x_point = i + this.xOrigin;
                    }
                    if (this.orientation === 1) {
                        y_point = i + this.yOrigin;
                        x_point = (dim2 - (((bin_value.min + 1) * (dim2)) / 2)) + this.xOrigin;
                    }

                    context.lineTo(x_point, y_point);
                }

                if (this.orientation === 0) {
                    context.lineTo(dim1 + this.xOrigin, dim2 * 0.5 + this.yOrigin);
                }
                else if (this.orientation === 1) {
                    context.lineTo(dim2 * 0.5 + this.xOrigin, dim1 + this.yOrigin);
                }

                context.fill();
                context.closePath();
            }

            if (false) {

                // TODO this doesn't work with orientations

                for (i = 0; i < dim1; i += 1) {
                    bin_value = binFunction(i, bin_size, this.values);

                   //NewValue = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin

                   var y = (dim2 - (((bin_value.max + 1) * (dim2)) / 2)) + this.yOrigin;
                   var y1 = (dim2 - (((bin_value.min + 1) * (dim2)) / 2)) + this.yOrigin;
                   var x = i + this.xOrigin;
                   var width = 1;
                   var height = y1 - y;

                   //this.drawClass.drawRect.draw(x, y, width, height, 0);

               }

           }

        }
};

//Non-interface functions
K2.Wavebox.prototype.calculateBinMix = function(bin_index, bin_size, values) {
    var wave = values.waveboxsignal;
    var start = values.startsample + bin_index * bin_size;
    var end = values.startsample + ((bin_index + 1) * bin_size);
    if (end > values.endsample) {
        end = values.endsample;
    }

    var bin_min = wave[start];
    var bin_max = wave[start];

    for (var i = 1; i < bin_size; i++) {
        if (wave[start + i] < bin_min) {
            bin_min = wave[start + i];
        }
        if (wave[start + i] > bin_max) {
            bin_max = wave[start + i];
        }
    }

    var bin_res = {
        'max' : bin_max,
        'min' : bin_min
    };

    return bin_res;
};

K2.Wavebox.prototype.calculateBinNone = function(bin_index, bin_size, values) {

    var start = values.startsample + bin_index * bin_size;

    // In the middle of the bin
    var middle = parseInt((bin_size / 2), 10);
    var sample_val = values.waveboxsignal[start + middle];

    var bin_res = {
        'max' : sample_val,
        'min' : (-sample_val)
    };

    return bin_res;

};


K2.Wavebox.prototype.calculateBinAvg = function(bin_index, bin_size) {

    var wave = this.values.waveboxsignal;
    var start = this.values.startsample + bin_index * bin_size;
    var end = start + ((bin_index + 1) * bin_size);
    if (end > this.values.endsample) {
        end = this.values.endsample;
    }

    var bin = wave.subarray(start, end);

    // Moving average
    var bin_avg = 0;
    var len = bin.length;
    for (var i = 0; i < (len - 1); i++) {
        bin_avg = (bin[i + 1] + i * bin_avg) / (i + 1);
    }

    return bin_avg;
};

var CurveEditor = function(parameters) {
    
    this.setVisible = function (value) {
        
        for (var i = 0; i < this.status.curveArray.length; i += 1) {
            this.ui.setVisible(this.status.curveArray[i], value);
        }
        
    };
    
    this.setzIndex = function (value) {
        
        this.Z_OFFSET = value;
        this.reorganizeElements();
        
        this.ui.refresh();
        
    };
    
    this.setTransparency = function (value) {
        
        for (var i = 0; i < this.status.curveArray.length; i += 1) {
            var element = this.ui.getElement (this.status.curveArray[i]);
            element.transparency = value;
        }
        this.ui.refresh();
    };
    
    this.setListening = function (value) {
        for (var i = 0; i < this.status.curveArray.length; i += 1) {
            this.ui.setListening (this.status.curveArray[i], value);
        }
    };
    
    this.reorganizeElements = function() {
        var filter_func = function(value, connDetails) {
            // last point of the receiver is first point of the sender
            var recvPoints = K2.GenericUtils.clone(connDetails.ui.getProp(connDetails.recv, 'values').points);
            var sendPoints = K2.GenericUtils.clone(connDetails.ui.getProp(connDetails.sender, 'values').points);
            recvPoints[recvPoints.length - 1] = sendPoints[0];
            return recvPoints;
        };
        // Reset the connections
        this.ui.resetSlots();

        // Set the z-Indexes & the connections
        for (var i = 0; i < this.status.curveArray.length; i += 1) {
            this.ui.setZIndex(this.status.curveArray[i], i + this.Z_OFFSET);
            // If it's not the last curve, connect the next curve to this one
            if (i < this.status.curveArray.length - 1) {
                this.ui.connectSlots(this.status.curveArray[i + 1], 'points', this.status.curveArray[i], 'points', {
                    'callback' : filter_func, 'cascade': false
                });
            }
        }
        
        if (this.xMonotone) {
            // If xMonotone, set the elements' ROI
            for (i = 0; i < this.status.curveArray.length - 1; i += 1) {
                // The current element: ROI width 'til the next element starts
                var currElement = this.ui.getElement(this.status.curveArray[i]);
                var nextElement = this.ui.getElement(this.status.curveArray[i+1]);
                currElement.ROIWidth = nextElement.values.points[0][0] - currElement.ROILeft;
                // The next element: ROI left 'til the current element starts
                nextElement.ROILeft = currElement.values.points[0][0];
            }
        }
    };

    // One callback for all
    this.callback = function() {
        var that = this;
        return function(slot, value, element) {
            console.log("Element: ", element, ". onValueSet callback: slot is ", slot, " and value is ", value, " while that is ", that);
            
            // Call the optional callback
            if (typeof that.externalCallback === 'function') {
				that.externalCallback(slot, value, element);
            }
            
            if (slot === 'selected') {
                // See which element are we selecting
                for (var i = 0; i < that.status.curveArray.length; i += 1) {
                    if (that.status.curveArray[i] === element) {
                        that.ui.setProp(element, 'curveColor', that.selectedCurveColor);
                        that.status.selected = i;
                    } else {
                        that.ui.setProp(that.status.curveArray[i], 'curveColor', that.curveArgsTemplate.curveColor);
                    }
                }
            }
            if (slot === 'held') {
                /* TODO maybe a context menu or something */
            }
            if (slot === 'doubletap_c') {
                /* Set the last point of the selected curve to x,y, then create another curve
                * and set its initial point to x,y, then its final point to the initial point of the next
                * curve. Then insert the new curve in the right point of the array with splice() */

                // PLEASE KEEP IN MIND that getProp does return a reference and not an hard copy! Be careful changing these values!
                var currentPoints = (that.ui.getProp(element, 'values')).points;

                // Get a deep copy of the template object
                var newCurveArgs = K2.GenericUtils.clone(that.curveArgsTemplate);

                // Linear by default (for now?)
                newCurveArgs.curveType = "linear";
                newCurveArgs.ID = 'curve' + that.status.nextNumber++;

                if (that.status.selected < that.status.curveArray.length - 1) {
                    newCurveArgs.paintTerminalPoints = 'first';
                    // The selected curve ends at the double-click value
                    currentPoints[currentPoints.length - 1] = value;
                    // Get the next curve
                    var nextID = that.status.curveArray[that.status.selected + 1];
                    var nextPoints = (that.ui.getProp(nextID, 'values')).points;
                    // The new curve starts at the double-click value, ends at the first point of the next curve
                    newCurveArgs.points = [value[0], value[1], nextPoints[0][0], nextPoints[0][1]];
                } else {
                    // Set the former last curve's terminal points draw strategy as 'first'
                    that.ui.setProp(element, 'paintTerminalPoints', 'first');

                    newCurveArgs.paintTerminalPoints = 'all';
                    // Deep copy of the final object
                    var finalPoints = K2.GenericUtils.clone(currentPoints[currentPoints.length - 1]);
                    // The former last curve ends at the double-click value
                    currentPoints[currentPoints.length - 1] = value;
                    // The new last curve starts at the double-click value, ends at the former last points
                    newCurveArgs.points = [value[0], value[1], finalPoints[0], finalPoints[1]];
                }

                var curveElement = new K2.Curve(newCurveArgs);
                that.ui.addElement(curveElement);

                that.status.curveArray.splice(that.status.selected + 1, 0, newCurveArgs.ID);
            }
            console.log("Reorganizing elements");
            that.reorganizeElements();
            that.ui.refresh();
        };
    };

    this.clearCurve = function() {
        for (var i = 0; i < this.status.curveArray.length; i += 1) {
            // Remove the element from the UI
            this.ui.removeElement(this.status.curveArray[i]);
        }
        // Remove the element from the array
        this.status.curveArray = [];
        this.status.selected = null;
        this.ui.refresh();
    };

    this.addCurve = function(curveType, grade, first_point, last_point) {
        console.log("Adding a curve");
        var lastElementID;

        // Get a deep copy of the template object
        // var newCurveArgs = JSON.parse(JSON.stringify(this.curveArgsTemplate));
        var newCurveArgs = K2.GenericUtils.clone(this.curveArgsTemplate);

        newCurveArgs.ID = 'curve' + this.status.nextNumber++;

        var bezierN = grade;

        var firstPoint, lastPoint, midPoints = [];

        newCurveArgs.paintTerminalPoints = 'all';
        // Calculate terminal points type and first, last point
        if (typeof first_point !== 'undefined') {
			firstPoint = first_point;
        }
        
        else {
	        if (this.status.curveArray.length === 0) {
	            // Lower left
	            firstPoint = [0, this.height];
	        } else {
	            // Appending: calculate the terminal point
	            lastElementID = this.status.curveArray[this.status.curveArray.length - 1];
	            //Get the values from the element
	            var coordinates = (this.ui.getProp(lastElementID, 'values')).points;
	            firstPoint = [coordinates[coordinates.length - 1][0], coordinates[coordinates.length - 1][1]];
	            // Set the curve to paint only its first handle
	            this.ui.setProp(lastElementID, 'paintTerminalPoints', 'first');
	        }
	    }

        var xInc = Math.round(this.width / 8);
        var yInc = -Math.round(this.height / 8);

		if (typeof last_point !== 'undefined') {
				lastPoint = last_point; 
			}
			
		else {	
	        // Calculate the next "landing" point
	        lastPoint = [firstPoint[0] + xInc, firstPoint[1] + yInc];
	
	        if (lastPoint[0] > this.width) {
	            lastPoint[0] = this.width;
	        }
	        if (lastPoint[1] < 0) {
	            lastPoint[1] = 0;
	        }
	
	        if ((lastPoint[0] === this.lastCalculatedPoint[0]) && (lastPoint[1] === this.lastCalculatedPoint[1])) {
	            // Set the curve to paint only its first handle
	            console.log("Remove something before adding stuff");
	            // Undo the previous paintTerminalPoints inference
	            this.ui.setProp(lastElementID, 'paintTerminalPoints', 'all');
	            return;
	        }
       }

        this.lastCalculatedPoint[0] = lastPoint[0];
        this.lastCalculatedPoint[1] = lastPoint[1];

        switch (curveType) {
            case 'linear':
            case 'smooth':
            case 'halfcosine':
                // Two point curve
                newCurveArgs.points = firstPoint.concat(lastPoint);
                break;
            case 'bezier':
                var midPoint = firstPoint.slice();
                for (var i = 1; i < bezierN; i += 1) {
                    // TODO remove the magic numbers
                    midPoint[0] += 20;
                    midPoint[1] -= 20;
                    midPoints = midPoints.concat(midPoint);
                }
                newCurveArgs.points = firstPoint.concat(midPoints, lastPoint);
        }

        newCurveArgs.curveType = curveType;

        var curveElement = new K2.Curve(newCurveArgs);
        this.ui.addElement(curveElement);
        this.status.curveArray.push(newCurveArgs.ID);
        this.reorganizeElements();
        this.ui.refresh();
    };

    this.removeCurve = function() {
        var prevID;
        
        if (this.status.selected !== null) {
            console.log("Deleting selected curve " + this.status.selected);

            //arr = arr.filter(function(){return true});

            // Change the (selected + 1) array initial point
            if ((this.status.selected !== 0) && (this.status.selected < this.status.curveArray.length - 1)) {
                var nextID = this.status.curveArray[this.status.selected + 1];
                prevID = this.status.curveArray[this.status.selected - 1];

                var nextValues = this.ui.getProp(nextID, 'values');
                var prevValues = this.ui.getProp(prevID, 'values');

                // PLEASE KEEP IN MIND that getProp does return a reference and not an hard copy! Be careful changing these values!
                // TODO maybe they should be cloned inside the UI (r/o copy)
                var newValues = K2.GenericUtils.clone(nextValues);
                newValues.points[0][0] = prevValues.points[prevValues.points.length - 1][0];
                newValues.points[0][1] = prevValues.points[prevValues.points.length - 1][1];

                this.ui.setProp(nextID, 'values', newValues);

            }

            if ((this.status.selected === this.status.curveArray.length - 1) && (this.status.selected !== 0)) {
                // Paint the final point in the previous curve
                prevID = this.status.curveArray[this.status.selected - 1];
                this.ui.setProp(prevID, 'paintTerminalPoints', 'all');
            }

            // Remove the element from the UI
            this.ui.removeElement(this.status.curveArray[this.status.selected]);

            // Remove the element from the array
            this.status.curveArray.splice(this.status.selected, 1);

            this.status.selected = null;

            this.reorganizeElements();
            this.ui.refresh();
        }
    };

    this.modifyCurve = function(curveType, grade) {
        var i;
        if (this.status.selected !== null) {

            console.log("Transforming selected curve " + this.status.selected);

            var bezierN = grade;

            var curveNow = this.ui.getProp(this.status.curveArray[this.status.selected], 'curveType');
            var curveValues = K2.GenericUtils.clone(this.ui.getProp(this.status.curveArray[this.status.selected], 'values'));
            var curvePoints = curveValues.points;
            var curveGrade = curvePoints.length - 1;

            if (curveNow === curveType) {
                if (curveType !== 'bezier') {
                    console.log("Identical type, doing nothing");
                    return;
                } else {
                    if (bezierN === curveGrade) {
                        console.log("Identical type and grade, doing nothing");
                        return;
                    }
                }
            }

            // We really have to change the curve
            // Take the first points
            var startPoint = curvePoints[0];
            var midPoints = [];
            var midPoint = [startPoint[0], startPoint[1]];
            // Calculate the midpoints, optionally
            if (curveType === 'bezier') {
                for (i = 1; i < bezierN; i += 1) {
                    // TODO remove the magic numbers
                    midPoint[0] += 20;
                    midPoint[1] -= 20;
                    midPoints = midPoints.concat(midPoint);
                }
            }
            var endPoint = curvePoints[curvePoints.length - 1];
            var newPoints = startPoint.concat(midPoints, endPoint);

            //transform initial arguments into an {Array} of [x,y] coordinates
            var newPointsCoordArray = [];
            for (i = 0; i < newPoints.length; i = i + 2) {
                newPointsCoordArray.push([newPoints[i], newPoints[i + 1]]);
            }

            // set curveType and new points
            curveValues.points = newPointsCoordArray;
            this.ui.setProp(this.status.curveArray[this.status.selected], 'curveType', curveType);
            this.ui.setProp(this.status.curveArray[this.status.selected], 'values', curveValues);

            this.reorganizeElements();
            this.ui.refresh();
        }
    };

    this.ui = parameters.ui;
    this.plugin_canvas = parameters.canvas;

    this.status = {
        curveArray : [],
        selected : null,
        nextNumber : 0
    };

    this.Z_OFFSET = parameters.zOffset || 0;

    this.width = parameters.width || parameters.canvas.width;
    this.height = parameters.height || parameters.canvas.height;

    this.lastCalculatedPoint = [];
    
    this.selectedCurveColor = parameters.selectedCurveColor || 'red';
    this.externalCallback = parameters.callback;
    
    this.xMonotone = parameters.xMonotone;

    //curve template
    this.curveArgsTemplate = {
        ID : '',
        top : 0,
        left : 0,
        width : this.width,
        height : this.height,
        thickness : parameters.thickness || 5,
        curveColor : parameters.curveColor || "02B51F",
        handleColor : parameters.handleColor || "A81B32",
        helperColor : parameters.helperColor || "gray",
        curveLabels : parameters.curveLabels || true,
        midPointSize : parameters.midPointSize || 8,
        terminalPointSize : parameters.terminalPointSize || 15,
        terminalPointColor : parameters.terminalPointColor || 'black',
        terminalPointFill : parameters.terminalPointFill || '015C10',
        midPointFill : parameters.midPointFill || 'E6965A',
        isListening : parameters.isListening || true,
        transparency : parameters.transparency || 0.8,
        xMonotone: parameters.xMonotone,
        onValueSet : this.callback()
    };

};
var AreaEditor = function(parameters) {

    this.reorganizeElements = function() {
        var filter_func = function(value, connDetails) {
            // last point of the receiver is first point of the sender
            var recvPoints = K2.GenericUtils.clone(connDetails.ui.getProp(connDetails.recv, 'values').points);
            var sendPoints = K2.GenericUtils.clone(connDetails.ui.getProp(connDetails.sender, 'values').points);
            recvPoints[recvPoints.length - 1] = sendPoints[0];
            return recvPoints;
        };
        // Reset the connections
        this.ui.resetSlots();

        // Set the z-Indexes & the connections
        for (var i = 0; i < this.status.areaArray.length; i += 1) {
            this.ui.setZIndex(this.status.areaArray[i], i + this.Z_OFFSET);
            // If it's not the last area, connect the next area to this one
            if (i < this.status.areaArray.length - 1) {
                this.ui.connectSlots(this.status.areaArray[i + 1], 'points', this.status.areaArray[i], 'points', {
                    'callback' : filter_func, 'cascade': false
                });
            }
        }
        
        if (this.xMonotone) {
            // If xMonotone, set the elements' ROI
            for (i = 0; i < this.status.areaArray.length - 1; i += 1) {
                // The current element: ROI width 'til the next element starts
                var currElement = this.ui.getElement(this.status.areaArray[i]);
                var nextElement = this.ui.getElement(this.status.areaArray[i+1]);
                currElement.ROIWidth = nextElement.values.points[0][0] - currElement.ROILeft;
                // The next element: ROI left 'til the current element starts
                nextElement.ROILeft = currElement.values.points[0][0];
            }
        }
    };

    // One callback for all
    this.callback = function() {
        var that = this;
        return function(slot, value, element) {
            console.log("Element: ", element, ". onValueSet callback: slot is ", slot, " and value is ", value, " while that is ", that);
            
            // Call the optional callback
            if (typeof that.externalCallback === 'function') {
				that.externalCallback(slot, value, element);
            }
            
            if (slot === 'selected') {
                // See which element are we selecting
                for (var i = 0; i < that.status.areaArray.length; i += 1) {
                    if (that.status.areaArray[i] === element) {
                        that.ui.setProp(element, 'color', that.selectedAreaColor);
                        that.status.selected = i;
                    } else {
                        that.ui.setProp(that.status.areaArray[i], 'color', that.areaArgsTemplate.color);
                    }
                }
            }
            if (slot === 'held') {
                /* TODO maybe a context menu or something */
            }
            if (slot === 'doubletap') {
                
                // Split the area                
                var currentElement = that.ui.getElement(element);
                var currentxOffset = currentElement.values.xOffset;
                var currentWidth = currentElement.values.width;

                // Get a deep copy of the template object
                var newAreaArgs = K2.GenericUtils.clone(that.areaArgsTemplate);

                newAreaArgs.ID = 'area' + that.status.nextNumber++;
                    
                // new area offset and width
                newAreaArgs.xOffset = value [0];
                newAreaArgs.width = currentWidth - (value [0] - currentxOffset);
                //newAreaArgs.height = that.height - value [1];
                //newAreaArgs.yOffset = currentElement.values.yOffset - (currentElement.values.height - newAreaArgs.height);
                newAreaArgs.height = currentElement.height;
                newAreaArgs.yOffset = currentElement.values.yOffset;
                
                // selected area offset and width
                currentElement.values.width = value [0] - currentxOffset;
                //currentHeight = value [1];

                var areaElement = new K2.Area(newAreaArgs);
                that.ui.addElement(areaElement);
                
                // Insert the element into the status array
                that.status.areaArray.splice(that.status.selected + 1, 0, newAreaArgs.ID);
            }
            //console.log("Reorganizing elements");
            //that.reorganizeElements();
            that.ui.refresh();
        };
    };

    this.clearAreas = function() {
        for (var i = 0; i < this.status.areaArray.length; i += 1) {
            // Remove the element from the UI
            this.ui.removeElement(this.status.areaArray[i]);
        }
        // Remove the element from the array
        this.status.areaArray = [];
        this.status.selected = null;
        this.ui.refresh();
    };

    this.addArea = function(width, height) {
        console.log("Adding an area");
        var lastElement;

        // Get a deep copy of the template object
        var newAreaArgs = K2.GenericUtils.clone(this.areaArgsTemplate);
        
        newAreaArgs.width = width || newAreaArgs.width;
        newAreaArgs.height = height || newAreaArgs.height; 
	
        newAreaArgs.ID = 'area' + this.status.nextNumber++;
        
        // Create the Area element and refresh.
        var areaElement = new K2.Area(newAreaArgs);
        
        if (this.status.areaArray.length !== 0) {
            // Not the first area; calculate x placement
            lastElement = this.ui.getElement(this.status.areaArray[this.status.areaArray.length - 1]);
            // Get xOffset from the previous element
            var prev_xOffset = lastElement.values.xOffset;
            var prev_width = lastElement.values.width;
            areaElement.values.xOffset = prev_xOffset + prev_width;
        }
        
        this.ui.addElement(areaElement);
        this.status.areaArray.push(newAreaArgs.ID);
        //this.reorganizeElements();
        this.ui.refresh();
       
    };

    this.removeArea = function() {
        var prevID;
        
        if (this.status.selected !== null) {
        }
            
    };

    
    this.ui = parameters.ui;
    this.plugin_canvas = parameters.canvas;

    this.status = {
        areaArray : [],
        selected : null,
        nextNumber : 0
    };

    this.Z_OFFSET = parameters.zOffset || 0;

    this.width = parameters.width || parameters.canvas.width;
    this.height = parameters.height || parameters.canvas.height;

    this.lastCalculatedPoint = [];
    
    this.selectedAreaColor = parameters.selectedAreaColor || 'red';
    this.externalCallback = parameters.callback;

    // area template
    this.areaArgsTemplate = {
        ID : '',
        top : Math.floor(this.height / 2),
        left : 0,
        width : parameters.defaultWidth || Math.floor(this.height / 10),
        height : parameters.defaultHeight || Math.floor(this.height / 2),
        thickness : parameters.thickness || 5,
        color : parameters.color || "black",
        borders: parameters.borders || {top: true, bottom: true, right: true, left: true},
        move: parameters.move || 'x',
        dragBorders: {top: true, bottom: false, right: true, left: true},
        xMonotone: true,
        yMonotone: true,
        isListening : parameters.isListening || true,
        transparency : parameters.transparency || 0.8,
        onValueSet : this.callback()
    };

};
var BarSelect = function (parameters) {
	
	this.setVisible = function () {
		var value, element;
		if (arguments.length === 1) {
			// set visibility to both elements
			value = arguments[0];
			this.ui.setVisible ('tempArea', value);
			this.ui.setVisible ('selectBar', value);
		}
		else if (arguments.length === 2) {
		    // set visibility separately
			element = arguments[0];
			value = arguments[1];
			this.ui.setVisible (element, value);
		}
	};
	
	this.setTransparency = function (value) {
        
        // set transparency to both elements
        this.areaArgsTemplate.transparency = value;
        this.barArgs.transparency = value;
        var bar = this.ui.getElement ("selectBar");
        bar.transparency = value;
        var tempArea = this.ui.getElement ("tempArea");
        tempArea.transparency = value;
        
    };
    
    this.setzIndex = function (value) {
        
        // set zIndex to both elements
        this.zIndex = value;
        
        this.ui.setZIndex("tempArea", value);
        this.ui.setZIndex("selectBar", value + 1);
        
    };
    
    this.setListening = function (value) {
        this.ui.setListening ('tempArea', value);
        this.ui.setListening ('selectBar', value);
    };
	
    // One callback for all
    this.callback = function() {
        var that = this;
        return function(slot, value, element) {
            console.log("Element: ", element, ". onValueSet callback: slot is ", slot, " and value is ", value, " while that is ", that);
            var width;
            
            if (slot === 'dragStart') {
                console.log ('Storing dragStart value ', value);
                that.dragStart = value;
                
                if (that.areaElement === null) {
					if (that.ui.isElement(that.areaArgsTemplate.ID)) {
						that.ui.removeElement(that.areaArgsTemplate.ID);
					}
	                var newArea = K2.GenericUtils.clone(that.areaArgsTemplate);
	                that.areaElement = new K2.Area(newArea);
                }
                
                that.areaElement.values.xOffset = that.dragStart[0];
                that.areaElement.values.width = 0;
                
                that.selectStart = that.dragStart[0];
                that.selectWidth = 0;
                
                that.ui.addElement(that.areaElement, {zIndex: this.zIndex});
                
            }
            
            if (slot === 'barPos') {

				if (that.dragStart === null) {
					// Positioned without dragging; de-select
					if (that.areaElement === null) {
						if (that.ui.isElement(that.areaArgsTemplate.ID)) {
							that.ui.removeElement(that.areaArgsTemplate.ID);
						}
					}
				}
                
                if (that.areaElement !== null) {
                    width = value[0] - that.dragStart[0];
                    that.areaElement.values.width = width;
                    that.selectWidth = width;
                }
            }
            
            if (slot === 'dragEnd') {
                
                if (that.areaElement !== null) {
                    width = value[0] - that.dragStart[0];
                    that.areaElement.values.width = width;
                    that.selectWidth = width;
                    that.dragStart = null;
                    that.areaElement = null;
                }
                
            }
            
            // Call the optional callback
            if (typeof that.externalCallback === 'function') {
                that.externalCallback(slot, value, element);
            }
            
            that.ui.refresh();
        };
    };
    
    this.ui = parameters.ui;
    this.plugin_canvas = parameters.canvas;
    
    this.areaElement = null; 

    // TODO TODO TODO
    this.zIndex = parameters.zIndex || 0;

    this.width = parameters.width || parameters.canvas.width;
    this.height = parameters.height || parameters.canvas.height;

    this.externalCallback = parameters.callback;
    var callback = this.callback();
    
    // area template
    this.areaArgsTemplate = {
        ID : 'tempArea',
        top : 0,
        left : 0,
        width : parameters.defaultWidth || this.width,
        height : parameters.defaultHeight || this.height,
        thickness : parameters.areaThickness || 2,
        color : parameters.areaColor || "black",
        borderColor: parameters.areaBorderColor || "gray",
        borders: {top: false, bottom: false, right: false, left: false},
        move: parameters.move || 'none',
        dragBorders: {top: false, bottom: false, right: false, left: false},
        xMonotone: true,
        yMonotone: true,
        transparency : parameters.areaTransparency || 0.5,
        isListening: parameters.isListening || true,
        onValueSet : callback
    };
    
    if (parameters.areaThickness === 0) {
        areaArgsTemplate.thickness = 0;
    }
    
    this.barArgs = {
        ID: "selectBar",
        left: 0,
        top : 0,
        thickness: parameters.barThickness || 2,
        height: this.height,
        width: this.width,
        onValueSet: callback,
        barColor: parameters.barColor || 'red',
        transparency: parameters.barTransparency || 0.8,
        isListening: parameters.isListening || true
    };
        
    this.ui.addElement(new K2.Bar(this.barArgs), {zIndex: this.zIndex + 1});
    
    this.ui.refresh();
};

K2.ENGINE = {};

K2.ENGINE.engineFactory = function (type, args) {
    
    switch(type)
    {
    case 'CANVAS2D':
      if (args.target !== undefined) {
          return new canvasEngineCreator (args.target);
      }
      else {
          throw ("Engine: args is undefined");
      }
      break;
      
    case 'ANOTHERTYPE':
        throw ("Engine type not recognized: " + type);
    default:
        throw ("Engine type not recognized: " + type);
    }

    function canvasEngineCreator (canvas) {
        
        // Utility functions
        // Resets the canvas
        this.reset = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };

        // Constructor
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.type = 'CANVAS2D';
        
        this.getContext = function () {
            return this.context;
        };
        this.getCanvas = function () {
            return this.canvas;
        };
    }

};
// This implementation adds functionality to the canvas; see http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas
// and thanks to Rod MacDougall
var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if (CP.lineTo) {
    CP.dashedLine = function(x, y, x2, y2, da) {
        if (!da) da = [10,5];
        this.save();
        var dx = (x2-x), dy = (y2-y);
        var len = Math.sqrt(dx*dx + dy*dy);
        var rot = Math.atan2(dy, dx);
        this.translate(x, y);
        this.moveTo(0, 0);
        this.rotate(rot);       
        var dc = da.length;
        var di = 0, draw = true;
        x = 0;
        while (len > x) {
            x += da[di++ % dc];
            if (x > len) x = len;
            
            if (draw) {
                this.lineTo(x, 0);
            }
            else {
                this.moveTo(x, 0);
            }
            
            draw = !draw;
        }       
        this.restore();
    };
}
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

function loadImageArray(args) {

    this.onCompletion = function() {

        // Call the callback if there's one.
        if (typeof (this.onComplete) === 'function') {
            var final_status = this.pollStatus();
            var retvalue = {
                imagesArray: this.imagesArray,
                status: final_status
            };
            this.onComplete(retvalue);
        }

        return;
    };

    this.onLoad = function(that) {
        return function() {
            that.objectsLoaded += 1;
            that.check(that.onSingle, this);
        };
    };

    this.onError = function(that) {
        return function() {
            that.objectsError += 1;
            that.check(that.onErr, this);
        };
    };

    this.check = function(callback, imageObj) {

        if (typeof(callback) === 'function') {
                var temp_status = this.pollStatus();
                callback({
                    obj: imageObj,
                    status: temp_status
                });
        }
            if (this.objectsLoaded + this.objectsError === this.objectsTotal) {
                this.onCompletion();
            }
    };

    this.pollStatus = function() {
        return {
                id: this.ID,
                loaded: this.objectsLoaded,
                error: this.objectsError,
                total: this.objectsTotal
                };
    };

    // The user will recognize this particular instance by ID
    this.ID = args.ID;

    // Optional callbacks
    this.onComplete = args.onComplete;
    this.onSingle = args.onSingle;
    this.onErr = args.onError;

    // Statistics
    this.objectsLoaded = 0;
    this.objectsError = 0;
    this.objectsTotal = args.imageNames.length;
    this.imagesArray = [];

    // Load images from names
    for (var i = 0; i < this.objectsTotal; i += 1) {
        this.imagesArray[i] = new Image();
        this.imagesArray[i].onload = this.onLoad(this);
        this.imagesArray[i].onerror = this.onError(this);
        this.imagesArray[i].src = args.imageNames[i];
    }
}

function loadMultipleImages(args) {

    this.loadingManager = function() {
        // Storage the closurage.
        var that = this;
        return function(loaderStatus) {
            var ls = loaderStatus;
                    // console.log (ls.status.id, " called back to say everything is loaded.");

                    // Update the element status
                    if (that.loaders[ls.status.id] !== undefined) {
                        that.loaders[ls.status.id].done = true;
                        that.loaders[ls.status.id].images = that.loaders[ls.status.id].imageArray.imagesArray;
                        // Call the singleArray callback
                        if (typeof (that.onSingleArray) === 'function') {
                            that.onSingleArray(loaderStatus);
                        }
                    }
                    else {
                        throw new Error('in loaders, ' + ls.status.id + ' is undefined');
                    }

                    // Check if every registered element is complete.
                    for (var element in that.loaders) {
                        if (that.loaders.hasOwnProperty(element)) {
                            if (that.loaders[element].done !== true) {
                                // console.log ("status of element ", element, " is not true: ", that.loaders[element].done);
                                // Return, we're not done yet.
                                return;
                            }
                        }
                    }

                    that.onComplete(that.loaders);
            };
        };

     this.errorManager = function() {
         // Storage the closurage.
        var that = this;
        return function(errorStatus) {
            if (typeof (that.onError) === 'function') {
                that.onError(errorStatus);
            }
        };
    };

     this.singleManager = function() {
         // Storage the closurage.
        var that = this;
        return function(singleStatus) {
            if (typeof (that.onSingle) === 'function') {
                that.onSingle(singleStatus);
            }
        };
    };


    this.multipleImages = args.multipleImages;
    this.onComplete = args.onComplete;
    this.onError = args.onError;
    this.onSingle = args.onSingle;
    this.onSingleArray = args.onSingleArray;
    this.loaders = {};

    // init as many loadImageArray as needed, by the mighty powers of object
    // composition.
    for (var i = 0; i < this.multipleImages.length; i += 1) {

        var loader = {};
        loader.imageArray = new loadImageArray({ID: this.multipleImages[i].ID,
                                                 imageNames: this.multipleImages[i].imageNames,
                                                 onComplete: this.loadingManager(),
                                                 onError: this.errorManager(),
                                                 onSingle: this.singleManager()
                                                });
        loader.done = false;
        this.loaders[this.multipleImages[i].ID] = loader;
    }

}

function memoize(func, max) {
    max = max || 5000;
    return (function() {
        var cache = {};
        var remaining = max;
        function fn(n) {
            return (cache[n] || (remaining-- > 0 ? (cache[n] = func(n)) : func(n)));
        }
        return fn;
    }());
}


var fact_table = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 51090942171709440000, 1124000727777607680000, 25852016738884976640000, 620448401733239439360000, 15511210043330985984000000, 403291461126605635584000000, 10888869450418352160768000000, 304888344611713860501504000000, 8841761993739701954543616000000, 265252859812191058636308480000000, 8222838654177922817725562880000000, 263130836933693530167218012160000000, 8683317618811886495518194401280000000, 295232799039604140847618609643520000000, 10333147966386144929666651337523200000000, 371993326789901217467999448150835200000000, 13763753091226345046315979581580902400000000, 523022617466601111760007224100074291200000000, 20397882081197443358640281739902897356800000000, 815915283247897734345611269596115894272000000000, 33452526613163807108170062053440751665152000000000, 1405006117752879898543142606244511569936384000000000, 60415263063373835637355132068513997507264512000000000, 2658271574788448768043625811014615890319638528000000000, 119622220865480194561963161495657715064383733760000000000, 5502622159812088949850305428800254892961651752960000000000, 258623241511168180642964355153611979969197632389120000000000, 12413915592536072670862289047373375038521486354677760000000000, 608281864034267560872252163321295376887552831379210240000000000, 30414093201713378043612608166064768844377641568960512000000000000, 1551118753287382280224243016469303211063259720016986112000000000000, 80658175170943878571660636856403766975289505440883277824000000000000, 4274883284060025564298013753389399649690343788366813724672000000000000, 230843697339241380472092742683027581083278564571807941132288000000000000, 12696403353658275925965100847566516959580321051449436762275840000000000000, 710998587804863451854045647463724949736497978881168458687447040000000000000, 40526919504877216755680601905432322134980384796226602145184481280000000000000, 2350561331282878571829474910515074683828862318181142924420699914240000000000000, 138683118545689835737939019720389406345902876772687432540821294940160000000000000, 8320987112741390144276341183223364380754172606361245952449277696409600000000000000, 507580213877224798800856812176625227226004528988036003099405939480985600000000000000, 31469973260387937525653122354950764088012280797258232192163168247821107200000000000000, 1982608315404440064116146708361898137544773690227268628106279599612729753600000000000000, 126886932185884164103433389335161480802865516174545192198801894375214704230400000000000000, 8247650592082470666723170306785496252186258551345437492922123134388955774976000000000000000, 544344939077443064003729240247842752644293064388798874532860126869671081148416000000000000000, 36471110918188685288249859096605464427167635314049524593701628500267962436943872000000000000000, 2480035542436830599600990418569171581047399201355367672371710738018221445712183296000000000000000, 171122452428141311372468338881272839092270544893520369393648040923257279754140647424000000000000000, 11978571669969891796072783721689098736458938142546425857555362864628009582789845319680000000000000000, 850478588567862317521167644239926010288584608120796235886430763388588680378079017697280000000000000000, 61234458376886086861524070385274672740778091784697328983823014963978384987221689274204160000000000000000, 4470115461512684340891257138125051110076800700282905015819080092370422104067183317016903680000000000000000, 330788544151938641225953028221253782145683251820934971170611926835411235700971565459250872320000000000000000, 24809140811395398091946477116594033660926243886570122837795894512655842677572867409443815424000000000000000000, 1885494701666050254987932260861146558230394535379329335672487982961844043495537923117729972224000000000000000000, 145183092028285869634070784086308284983740379224208358846781574688061991349156420080065207861248000000000000000000, 11324281178206297831457521158732046228731749579488251990048962825668835325234200766245086213177344000000000000000000, 894618213078297528685144171539831652069808216779571907213868063227837990693501860533361810841010176000000000000000000, 71569457046263802294811533723186532165584657342365752577109445058227039255480148842668944867280814080000000000000000000, 5797126020747367985879734231578109105412357244731625958745865049716390179693892056256184534249745940480000000000000000000, 475364333701284174842138206989404946643813294067993328617160934076743994734899148613007131808479167119360000000000000000000, 39455239697206586511897471180120610571436503407643446275224357528369751562996629334879591940103770870906880000000000000000000, 3314240134565353266999387579130131288000666286242049487118846032383059131291716864129885722968716753156177920000000000000000000, 281710411438055027694947944226061159480056634330574206405101912752560026159795933451040286452340924018275123200000000000000000000, 24227095383672732381765523203441259715284870552429381750838764496720162249742450276789464634901319465571660595200000000000000000000, 2107757298379527717213600518699389595229783738061356212322972511214654115727593174080683423236414793504734471782400000000000000000000, 185482642257398439114796845645546284380220968949399346684421580986889562184028199319100141244804501828416633516851200000000000000000000, 16507955160908461081216919262453619309839666236496541854913520707833171034378509739399912570787600662729080382999756800000000000000000000, 1485715964481761497309522733620825737885569961284688766942216863704985393094065876545992131370884059645617234469978112000000000000000000000, 135200152767840296255166568759495142147586866476906677791741734597153670771559994765685283954750449427751168336768008192000000000000000000000, 12438414054641307255475324325873553077577991715875414356840239582938137710983519518443046123837041347353107486982656753664000000000000000000000, 1156772507081641574759205162306240436214753229576413535186142281213246807121467315215203289516844845303838996289387078090752000000000000000000000, 108736615665674308027365285256786601004186803580182872307497374434045199869417927630229109214583415458560865651202385340530688000000000000000000000, 10329978488239059262599702099394727095397746340117372869212250571234293987594703124871765375385424468563282236864226607350415360000000000000000000000, 991677934870949689209571401541893801158183648651267795444376054838492222809091499987689476037000748982075094738965754305639874560000000000000000000000, 96192759682482119853328425949563698712343813919172976158104477319333745612481875498805879175589072651261284189679678167647067832320000000000000000000000, 9426890448883247745626185743057242473809693764078951663494238777294707070023223798882976159207729119823605850588608460429412647567360000000000000000000000, 933262154439441526816992388562667004907159682643816214685929638952175999932299156089414639761565182862536979208272237582511852109168640000000000000000000000, 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000];
function fact_lookup(n) {
	if (0 < n <= 100) {
		return fact_table[n];
	}
	else {
		var rval = 1;
        for (var i = 2; i <= n; i++)
            rval = rval * i;
        return rval;
	}
}

K2.GenericUtils = {};

K2.GenericUtils.clone = function(obj) {
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
            copy[i] = K2.GenericUtils.clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = K2.GenericUtils.clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
};

K2.MathUtils = {};

K2.MathUtils.linearRange = function (a, b, y, z, c) {
    // Input:   value c between a and b
    // Output:  value x between y and z
    var x = (c - a) * (z - y) / (b - a) + y;
    return x;
};

K2.MathUtils.distance = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

K2.CanvasUtils = {};

K2.CanvasUtils.drawRotate = function (ctx, args /*{image, x, y, rot}*/) {
    ctx.save();
    ctx.translate(args.x + (args.image.width / 2), args.y + (args.image.height / 2));
    ctx.rotate(args.rot);
    ctx.translate(-(args.image.width / 2) - args.x, -(args.image.height / 2) - args.y);
    ctx.drawImage(args.image, args.x, args.y);
    ctx.restore();
};
if (typeof window.define === "function" && window.define.amd) {
  console.log ("AMD detected, setting define");  
  window.define("kievII", [], function() {
    console.log ("KievII: returning K2 object inside the define (AMD detected)");
    return K2;
  });
}
else {
    console.log ("KievII: setting window.K2 (no AMD)");
    window.kievII = window.K2 = K2;
}

/*
 * Hammer.JS
 * version 0.6.3
 * author: Eight Media
 * https://github.com/EightMedia/hammer.js
 * Licensed under the MIT license.
 */
function Hammer(element, options, undefined)
{
    var self = this;

    var defaults = {
        // prevent the default event or not... might be buggy when false
        prevent_default    : false,
        css_hacks          : true,

        swipe              : true,
        swipe_time         : 200,   // ms
        swipe_min_distance : 20, // pixels

        drag               : true,
        drag_vertical      : true,
        drag_horizontal    : true,
        // minimum distance before the drag event starts
        drag_min_distance  : 20, // pixels

        // pinch zoom and rotation
        transform          : true,
        scale_treshold     : 0.1,
        rotation_treshold  : 15, // degrees

        tap                : true,
        tap_double         : true,
        tap_max_interval   : 300,
        tap_max_distance   : 10,
        tap_double_distance: 20,

        hold               : true,
        hold_timeout       : 500
    };
    options = mergeObject(defaults, options);

    // some css hacks
    (function() {
        if(!options.css_hacks) {
            return false;
        }

        var vendors = ['webkit','moz','ms','o',''];
        var css_props = {
            "userSelect": "none",
            "touchCallout": "none",
            "userDrag": "none",
            "tapHighlightColor": "rgba(0,0,0,0)"
        };

        var prop = '';
        for(var i = 0; i < vendors.length; i++) {
            for(var p in css_props) {
                prop = p;
                if(vendors[i]) {
                    prop = vendors[i] + prop.substring(0, 1).toUpperCase() + prop.substring(1);
                }
                element.style[ prop ] = css_props[p];
            }
        }
    })();

    // holds the distance that has been moved
    var _distance = 0;

    // holds the exact angle that has been moved
    var _angle = 0;

    // holds the direction that has been moved
    var _direction = 0;

    // holds position movement for sliding
    var _pos = { };

    // how many fingers are on the screen
    var _fingers = 0;

    var _first = false;

    var _gesture = null;
    var _prev_gesture = null;

    var _touch_start_time = null;
    var _prev_tap_pos = {x: 0, y: 0};
    var _prev_tap_end_time = null;

    var _hold_timer = null;

    var _offset = {};

    // keep track of the mouse status
    var _mousedown = false;

    var _event_start;
    var _event_move;
    var _event_end;

    var _has_touch = ('ontouchstart' in window);


    /**
     * option setter/getter
     * @param   string  key
     * @param   mixed   value
     * @return  mixed   value
     */
    this.option = function(key, val) {
        if(val != undefined) {
            options[key] = val;
        }

        return options[key];
    };


    /**
     * angle to direction define
     * @param  float    angle
     * @return string   direction
     */
    this.getDirectionFromAngle = function( angle ) {
        var directions = {
            down: angle >= 45 && angle < 135, //90
            left: angle >= 135 || angle <= -135, //180
            up: angle < -45 && angle > -135, //270
            right: angle >= -45 && angle <= 45 //0
        };

        var direction, key;
        for(key in directions){
            if(directions[key]){
                direction = key;
                break;
            }
        }
        return direction;
    };


    /**
     * destroy events
     * @return  void
     */
    this.destroy = function() {
        if(_has_touch) {
            removeEvent(element, "touchstart touchmove touchend touchcancel", handleEvents);
        }
        // for non-touch
        else {
            removeEvent(element, "mouseup mousedown mousemove", handleEvents);
            removeEvent(element, "mouseout", handleMouseOut);
        }
    };


    /**
     * count the number of fingers in the event
     * when no fingers are detected, one finger is returned (mouse pointer)
     * @param  event
     * @return int  fingers
     */
    function countFingers( event )
    {
        // there is a bug on android (until v4?) that touches is always 1,
        // so no multitouch is supported, e.g. no, zoom and rotation...
        return event.touches ? event.touches.length : 1;
    }


    /**
     * get the x and y positions from the event object
     * @param  event
     * @return array  [{ x: int, y: int }]
     */
    function getXYfromEvent( event )
    {
        event = event || window.event;

        // no touches, use the event pageX and pageY
        if(!_has_touch) {
            var doc = document,
                body = doc.body;

            return [{
                x: event.pageX || event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && doc.clientLeft || 0 ),
                y: event.pageY || event.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && doc.clientTop || 0 )
            }];
        }
        // multitouch, return array with positions
        else {
            var pos = [], src;
            for(var t=0, len=event.touches.length; t<len; t++) {
                src = event.touches[t];
                pos.push({ x: src.pageX, y: src.pageY });
            }
            return pos;
        }
    }


    /**
     * calculate the angle between two points
     * @param   object  pos1 { x: int, y: int }
     * @param   object  pos2 { x: int, y: int }
     */
    function getAngle( pos1, pos2 )
    {
        return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) * 180 / Math.PI;
    }

    /**
     * calculate the distance between two points
     * @param   object  pos1 { x: int, y: int }
     * @param   object  pos2 { x: int, y: int }
     */
    function getDistance( pos1, pos2 )
    {
        var x = pos2.x - pos1.x, y = pos2.y - pos1.y;
        return Math.sqrt((x * x) + (y * y));
    }


    /**
     * calculate the scale size between two fingers
     * @param   object  pos_start
     * @param   object  pos_move
     * @return  float   scale
     */
    function calculateScale(pos_start, pos_move)
    {
        if(pos_start.length == 2 && pos_move.length == 2) {
            var start_distance = getDistance(pos_start[0], pos_start[1]);
            var end_distance = getDistance(pos_move[0], pos_move[1]);
            return end_distance / start_distance;
        }

        return 0;
    }


    /**
     * calculate the rotation degrees between two fingers
     * @param   object  pos_start
     * @param   object  pos_move
     * @return  float   rotation
     */
    function calculateRotation(pos_start, pos_move)
    {
        if(pos_start.length == 2 && pos_move.length == 2) {
            var start_rotation = getAngle(pos_start[1], pos_start[0]);
            var end_rotation = getAngle(pos_move[1], pos_move[0]);
            return end_rotation - start_rotation;
        }

        return 0;
    }


    /**
     * trigger an event/callback by name with params
     * @param string name
     * @param array  params
     */
    function triggerEvent( eventName, params )
    {
        // return touches object
        params.touches = getXYfromEvent(params.originalEvent);
        params.type = eventName;

        // trigger callback
        if(isFunction(self["on"+ eventName])) {
            self["on"+ eventName].call(self, params);
        }
    }


    /**
     * cancel event
     * @param   object  event
     * @return  void
     */

    function cancelEvent(event)
    {
        event = event || window.event;
        if(event.preventDefault){
            event.preventDefault();
            event.stopPropagation();
        }else{
            event.returnValue = false;
            event.cancelBubble = true;
        }
    }


    /**
     * reset the internal vars to the start values
     */
    function reset()
    {
        _pos = {};
        _first = false;
        _fingers = 0;
        _distance = 0;
        _angle = 0;
        _gesture = null;
    }


    var gestures = {
        // hold gesture
        // fired on touchstart
        hold : function(event)
        {
            // only when one finger is on the screen
            if(options.hold) {
                _gesture = 'hold';
                clearTimeout(_hold_timer);

                _hold_timer = setTimeout(function() {
                    if(_gesture == 'hold') {
                        triggerEvent("hold", {
                            originalEvent   : event,
                            position        : _pos.start
                        });
                    }
                }, options.hold_timeout);
            }
        },

        // swipe gesture
        // fired on touchend
        swipe : function(event)
        {
            //Do not allow a swipe event to be fired when in a transform state.
            if (!_pos.move || _gesture === "transform") {
                return;
            }

            // get the distance we moved
            var _distance_x = _pos.move[0].x - _pos.start[0].x;
            var _distance_y = _pos.move[0].y - _pos.start[0].y;
            _distance = Math.sqrt(_distance_x*_distance_x + _distance_y*_distance_y);

            // compare the kind of gesture by time
            var now = new Date().getTime();
            var touch_time = now - _touch_start_time;

            if(options.swipe && (options.swipe_time > touch_time) && (_distance > options.swipe_min_distance)) {
                // calculate the angle
                _angle = getAngle(_pos.start[0], _pos.move[0]);
                _direction = self.getDirectionFromAngle(_angle);

                _gesture = 'swipe';

                var position = { x: _pos.move[0].x - _offset.left,
                    y: _pos.move[0].y - _offset.top };

                var event_obj = {
                    originalEvent   : event,
                    position        : position,
                    direction       : _direction,
                    distance        : _distance,
                    distanceX       : _distance_x,
                    distanceY       : _distance_y,
                    angle           : _angle
                };

                // normal slide event
                triggerEvent("swipe", event_obj);
            }
        },


        // drag gesture
        // fired on mousemove
        drag : function(event)
        {
            // get the distance we moved
            var _distance_x = _pos.move[0].x - _pos.start[0].x;
            var _distance_y = _pos.move[0].y - _pos.start[0].y;
            _distance = Math.sqrt(_distance_x * _distance_x + _distance_y * _distance_y);

            // drag
            // minimal movement required
            if(options.drag && (_distance > options.drag_min_distance) || _gesture == 'drag') {
                // calculate the angle
                _angle = getAngle(_pos.start[0], _pos.move[0]);
                _direction = self.getDirectionFromAngle(_angle);

                // check the movement and stop if we go in the wrong direction
                var is_vertical = (_direction == 'up' || _direction == 'down');
                if(((is_vertical && !options.drag_vertical) || (!is_vertical && !options.drag_horizontal))
                    && (_distance > options.drag_min_distance)) {
                    return;
                }

                _gesture = 'drag';

                var position = { x: _pos.move[0].x - _offset.left,
                    y: _pos.move[0].y - _offset.top };

                var event_obj = {
                    originalEvent   : event,
                    position        : position,
                    direction       : _direction,
                    distance        : _distance,
                    distanceX       : _distance_x,
                    distanceY       : _distance_y,
                    angle           : _angle
                };

                // on the first time trigger the start event
                if(_first) {
                    triggerEvent("dragstart", event_obj);

                    _first = false;
                }

                // normal slide event
                triggerEvent("drag", event_obj);

                cancelEvent(event);
            }
        },


        // transform gesture
        // fired on touchmove
        transform : function(event)
        {
            if(options.transform) {
                if(countFingers(event) != 2) {
                    return false;
                }

                var rotation = calculateRotation(_pos.start, _pos.move);
                var scale = calculateScale(_pos.start, _pos.move);

                if(_gesture != 'drag' &&
                    (_gesture == 'transform' || Math.abs(1-scale) > options.scale_treshold || Math.abs(rotation) > options.rotation_treshold)) {
                    _gesture = 'transform';

                    _pos.center = {  x: ((_pos.move[0].x + _pos.move[1].x) / 2) - _offset.left,
                        y: ((_pos.move[0].y + _pos.move[1].y) / 2) - _offset.top };

                    if(_first)
                        _pos.startCenter = _pos.center;

                    var _distance_x = _pos.center.x - _pos.startCenter.x;
                    var _distance_y = _pos.center.y - _pos.startCenter.y;
                    _distance = Math.sqrt(_distance_x*_distance_x + _distance_y*_distance_y);

                    var event_obj = {
                        originalEvent   : event,
                        position        : _pos.center,
                        scale           : scale,
                        rotation        : rotation,
                        distance        : _distance,
                        distanceX       : _distance_x,
                        distanceY       : _distance_y,
                    };

                    // on the first time trigger the start event
                    if(_first) {
                        triggerEvent("transformstart", event_obj);
                        _first = false;
                    }

                    triggerEvent("transform", event_obj);

                    cancelEvent(event);

                    return true;
                }
            }

            return false;
        },


        // tap and double tap gesture
        // fired on touchend
        tap : function(event)
        {
            // compare the kind of gesture by time
            var now = new Date().getTime();
            var touch_time = now - _touch_start_time;

            // dont fire when hold is fired
            if(options.hold && !(options.hold && options.hold_timeout > touch_time)) {
                return;
            }

            // when previous event was tap and the tap was max_interval ms ago
            var is_double_tap = (function(){
                if (_prev_tap_pos &&
                    options.tap_double &&
                    _prev_gesture == 'tap' &&
                    (_touch_start_time - _prev_tap_end_time) < options.tap_max_interval)
                {
                    var x_distance = Math.abs(_prev_tap_pos[0].x - _pos.start[0].x);
                    var y_distance = Math.abs(_prev_tap_pos[0].y - _pos.start[0].y);
                    return (_prev_tap_pos && _pos.start && Math.max(x_distance, y_distance) < options.tap_double_distance);
                }
                return false;
            })();

            if(is_double_tap) {
                _gesture = 'double_tap';
                _prev_tap_end_time = null;

                triggerEvent("doubletap", {
                    originalEvent   : event,
                    position        : _pos.start
                });
                cancelEvent(event);
            }

            // single tap is single touch
            else {
                var x_distance = (_pos.move) ? Math.abs(_pos.move[0].x - _pos.start[0].x) : 0;
                var y_distance =  (_pos.move) ? Math.abs(_pos.move[0].y - _pos.start[0].y) : 0;
                _distance = Math.max(x_distance, y_distance);

                if(_distance < options.tap_max_distance) {
                    _gesture = 'tap';
                    _prev_tap_end_time = now;
                    _prev_tap_pos = _pos.start;

                    if(options.tap) {
                        triggerEvent("tap", {
                            originalEvent   : event,
                            position        : _pos.start
                        });
                        cancelEvent(event);
                    }
                }
            }

        }

    };


    function handleEvents(event)
    {
        switch(event.type)
        {
            case 'mousedown':
            case 'touchstart':
                _pos.start = getXYfromEvent(event);
                _touch_start_time = new Date().getTime();
                _fingers = countFingers(event);
                _first = true;
                _event_start = event;

                // borrowed from jquery offset https://github.com/jquery/jquery/blob/master/src/offset.js
                var box = element.getBoundingClientRect();
                var clientTop  = element.clientTop  || document.body.clientTop  || 0;
                var clientLeft = element.clientLeft || document.body.clientLeft || 0;
                var scrollTop  = window.pageYOffset || element.scrollTop  || document.body.scrollTop;
                var scrollLeft = window.pageXOffset || element.scrollLeft || document.body.scrollLeft;

                _offset = {
                    top: box.top + scrollTop - clientTop,
                    left: box.left + scrollLeft - clientLeft
                };

                _mousedown = true;

                // hold gesture
                gestures.hold(event);

                if(options.prevent_default) {
                    cancelEvent(event);
                }
                break;

            case 'mousemove':
            case 'touchmove':
                if(!_mousedown) {
                    return false;
                }
                _event_move = event;
                _pos.move = getXYfromEvent(event);

                if(!gestures.transform(event)) {
                    gestures.drag(event);
                }
                break;

            case 'mouseup':
            case 'mouseout':
            case 'touchcancel':
            case 'touchend':
                if(!_mousedown || (_gesture != 'transform' && event.touches && event.touches.length > 0)) {
                    return false;
                }

                _mousedown = false;
                _event_end = event;


                // swipe gesture
                gestures.swipe(event);


                // drag gesture
                // dragstart is triggered, so dragend is possible
                if(_gesture == 'drag') {
                    triggerEvent("dragend", {
                        originalEvent   : event,
                        direction       : _direction,
                        distance        : _distance,
                        angle           : _angle
                    });
                }

                // transform
                // transformstart is triggered, so transformed is possible
                else if(_gesture == 'transform') {
                    triggerEvent("transformend", {
                        originalEvent   : event,
                        position        : _pos.center,
                        scale           : calculateScale(_pos.start, _pos.move),
                        rotation        : calculateRotation(_pos.start, _pos.move),
                        distance        : _distance,
                        distanceX       : _distance_x,
                        distanceY       : _distance_y
                    });
                }
                else {
                    gestures.tap(_event_start);
                }

                _prev_gesture = _gesture;

                // trigger release event. 
                // "release" by default doesn't return the co-ords where your 
                // finger was released. "position" will return "the last touched co-ords"
                triggerEvent("release", {
                    originalEvent   : event,
                    gesture         : _gesture,
                    position        : _pos.move || _pos.start
                });

                // reset vars
                reset();
                break;
        }
    }


    function handleMouseOut(event) {
        if(!isInsideHammer(element, event.relatedTarget)) {
            handleEvents(event);
        }
    }


    // bind events for touch devices
    // except for windows phone 7.5, it doesnt support touch events..!
    if(_has_touch) {
        addEvent(element, "touchstart touchmove touchend touchcancel", handleEvents);
    }
    // for non-touch
    else {
        addEvent(element, "mouseup mousedown mousemove", handleEvents);
        addEvent(element, "mouseout", handleMouseOut);
    }


    /**
     * find if element is (inside) given parent element
     * @param   object  element
     * @param   object  parent
     * @return  bool    inside
     */
    function isInsideHammer(parent, child) {
        // get related target for IE
        if(!child && window.event && window.event.toElement){
            child = window.event.toElement;
        }

        if(parent === child){
            return true;
        }

        // loop over parentNodes of child until we find hammer element
        if(child){
            var node = child.parentNode;
            while(node !== null){
                if(node === parent){
                    return true;
                };
                node = node.parentNode;
            }
        }
        return false;
    }


    /**
     * merge 2 objects into a new object
     * @param   object  obj1
     * @param   object  obj2
     * @return  object  merged object
     */
    function mergeObject(obj1, obj2) {
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
    }


    /**
     * check if object is a function
     * @param   object  obj
     * @return  bool    is function
     */
    function isFunction( obj ){
        return Object.prototype.toString.call( obj ) == "[object Function]";
    }


    /**
     * attach event
     * @param   node    element
     * @param   string  types
     * @param   object  callback
     */
    function addEvent(element, types, callback) {
        types = types.split(" ");
        for(var t= 0,len=types.length; t<len; t++) {
            if(element.addEventListener){
                element.addEventListener(types[t], callback, false);
            }
            else if(document.attachEvent){
                element.attachEvent("on"+ types[t], callback);
            }
        }
    }


    /**
     * detach event
     * @param   node    element
     * @param   string  types
     * @param   object  callback
     */
    function removeEvent(element, types, callback) {
        types = types.split(" ");
        for(var t= 0,len=types.length; t<len; t++) {
            if(element.removeEventListener){
                element.removeEventListener(types[t], callback, false);
            }
            else if(document.detachEvent){
                element.detachEvent("on"+ types[t], callback);
            }
        }
    }
}
