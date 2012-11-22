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
