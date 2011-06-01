function UI(domElement, wrapperFactory) {

    // <EVENT HANDLING>

    // Thanks for these two functions to the noVNC project. You are great.
    // https://github.com/kanaka/noVNC/blob/master/include/util.js#L121
    
    // Get DOM element position on page
    this.getPosition = function (obj) {
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
    this.getEventPosition = function (e, obj, scale) {
        var evt, docX, docY, pos;
        //if (!e) evt = window.event;
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
        pos = this.getPosition(obj);
        if (typeof scale === "undefined") {
            scale = 1;
        }
        return {'x': (docX - pos.x) / scale, 'y': (docY - pos.y) / scale};
    };

    // Event handlers: we need closures here, because they will be called as callbacks.

    // On mouseMove event
    this.onMouseMoveFunc = function () {
        var that = this;
            return function (evt) {

            //var realCoords = that.calculateOffset(evt);
            var realCoords = that.getEventPosition (evt, that.domElement);

            // Only if the mouse button is still down (This could be useless TODO).
            if (that.mouseUp === false) {
                that.elementsNotifyEvent(realCoords.x, realCoords.y, "onMouseMove");
            }
        };
    };

    // On mouseDown event
    this.onMouseDownFunc = function () {
        var that = this;
            return function (evt) {

            var realCoords = that.getEventPosition (evt, that.domElement);

            that.mouseUp = false;
            that.elementsNotifyEvent(realCoords.x, realCoords.y, "onMouseDown");
        };
    };

    // On mouseUp event
    this.onMouseUpFunc = function () {
        var that = this;
            return function (evt) {

            var realCoords = that.getEventPosition (evt, that.domElement);

            that.mouseUp = true;
            that.elementsNotifyEvent(realCoords.x, realCoords.y, "onMouseUp");

        };
    };

    // Notify every element about the event.
    this.elementsNotifyEvent = function (x, y, event) {
        // For every element
        for (var ID in this.elements) {
            // If it is a real element
            if (this.elements.hasOwnProperty(ID)){
                // If the element wants to be bothered with events
                if (this.elements[ID].getClickable()) {
                    // Notify the element
                    ret = this.elements[ID][event](x, y);
                    // See if the element changed its value
                    if (ret !== undefined) {
                        if (ret instanceof Array) {
                            // An element could change multiple slots of itself.
                            for (var i = 0; i < ret.length; i+=1) {
                                this.setValue(ID, ret[i].slot, ret[i].value);
                            }
                        }
                        else {
                            // console.log("UI: Element ", ID, " changed its value on event ", event);
                            this.setValue(ID, ret.slot, ret.value);
                        }
                    }
                }
            }
        }
    };

    // <END OF EVENT HANDLING>


    // <CONSTRUCTOR>
    this.domElement = domElement;

    this.domElement.addEventListener("mousedown", this.onMouseDownFunc(), true);
    this.domElement.addEventListener("mouseup", this.onMouseUpFunc(), true);
    this.domElement.addEventListener("mousemove", this.onMouseMoveFunc(), true);

    this.mouseUp = true;
   
    var ret;

    // Elements in this UI.
    this.elements = {};

    // Connection between elements
    this.connections = {};

    // Z-index lists.
    this.zArray = [];
    this.zArrayUndefined = [];

    // Graphic frontend wrapper
    this.graphicWrapper = wrapperFactory;

    // </CONSTRUCTOR>

    // <ELEMENT HANDLING>

    // *** Add an UI element **** //
    this.addElement = function (element, elementParameters) {
        var slot,
            slots;

        if (this.elements[element.ID] !== undefined) {
            throw new Error("Conflicting / Duplicated ID in UI: " + element.ID + " (IDs are identifiers and should be unique)");
            return;
        }

        this.elements[element.ID] = element;

        // Set the element's graphic wrapper
        element.setGraphicWrapper(this.graphicWrapper);

        // Insert the element in the connection keys.
        this.connections[element.ID] = {};

        // Get the slots available from the element.
        slots = element.getValues();

        // Insert all possible elements in the connection matrix TODO ARRAY
        for (slot in slots) {
            if (slots.hasOwnProperty(slot)) {
                this.connections[element.ID][slots[slot]] = [];
            }
        }

        // Store the parameters
        if (elementParameters !== undefined) {
            // Z Index
            if (typeof(elementParameters.zIndex) === "number") {
                // Insert the element's z-index
                this.elements[element.ID].zIndex = elementParameters.zIndex;
                // if it's the first of its kind, initialize the array.
                if (this.zArray[elementParameters.zIndex] === undefined) {
                    this.zArray[elementParameters.zIndex] = [];
                }
                // Update the maximum and minimum z index.
                this.zArray[elementParameters.zIndex].push(this.elements[element.ID]);
                if ((this.zMin === undefined) || (this.zMin >  elementParameters.zIndex)) {
                    this.zMin = elementParameters.zIndex;
                }
                if ((this.zMax === undefined) || (this.zMax <  elementParameters.zIndex)) {
                    this.zMax = elementParameters.zIndex;
                }
            }
        }
        else {
            //We store the "undefined" as the lowest z-indexed layers.
            this.elements[element.ID].zIndex = undefined;
            this.zArrayUndefined.push(this.elements[element.ID]);
        }
        // Complete Repaint
        if (elementParameters.completeRepaint === true) {
            this.elements[element.ID].completeRepaint = true;
        }
    };
    
    // </ELEMENT HANDLING>


    // <CONNECTION HANDLING>

    // Connect slots, so that one element can "listen" to the other
    this.connectSlots  = function (senderElement, senderSlot, receiverElement, receiverSlot, connectParameters) {

        //Check for the elements.
        if ((this.elements[senderElement] !== undefined) && (this.elements[receiverElement] !== undefined)) {
            // //Check for the slots.
            if ((this.elements[senderElement].values[senderSlot] === undefined) ||
                (this.elements[receiverElement].values[receiverSlot] === undefined))  {
                throw new Error("Slot " + senderSlot + " or " + receiverSlot + " not present.");
            }

            else {

                //The sender & receiver element & slot exist. Do the connection.
                var receiverHash = {"recvElement" : receiverElement, "recvSlot": receiverSlot};

                //Check if there are optional parameters
                if (connectParameters !== undefined) {
                    // Is there a callback?
                    if (typeof(connectParameters.callback) === "function") {
                        receiverHash.callback = connectParameters.callback;
                    }
                }

                // Push the destination element/slot in the connections matrix.
                this.connections[senderElement][senderSlot].push(receiverHash);
            }
            
        }
        else {
            throw new Error("Element " + senderElement + " or " + receiverElement + " not present.");
        }
    };

    //</CONNECTION HANDLING>


    // <VALUE HANDLING>

    // This method handles one set value event and propagates it in the connections matrix
    this.setValue = function (elementID, slot, value, history) {
        var hist = [],
            receiverHash,
            recvElementID,
            recvSlot,
            i
            RECURSIONMAX = 1000;

        if (this.elements[elementID] !== undefined) {

            // First of all, check history if it is present.
            if (history !== undefined) {
                hist = history;
                // Is this an infinite loop?
                for(var k = 0; k < hist.length ; k += 1) {
                    // This is for precaution.
                    if (hist.length > RECURSIONMAX) {
                        throw new Error ("Recursion exceeded");
                        return;
                    }
                    if ((hist[k]["element"] === elementID) && (hist[k]["slot"] === slot)) {
                        // Loop is infinite; bail out!
                        console.log ("Broke recursion!");
                        return;
                    }
                }
            }
            // Element is present an there's no need to break a loop
            // really set value.
            this.elements[elementID].setValue(slot, value);

            // This element has been already set: update history
            hist.push({"element" : elementID, "slot" : slot});
        }

        else {
            throw new Error("Element " + elementID + " not present.");
        }

        // Z-Index handling: refresh every >z element, starting with z+1
        // If the element requested a full repaint (i.e. it overlaps with
        // another at the same zIndex), reset & refresh
        // TODO maybe completeRepaint can be set automatically.
        if (this.elements[elementID].zIndex !== undefined) {
            if (this.elements[elementID].completeRepaint !== true) {
                this.refreshZ(this.elements[elementID].zIndex + 1);
            }
            else {
                //Reset the wrapper.
                this.reset();
                // Repaint everything, in order.
                this.refresh();
            }
        }

        // Check if this element has connections
        if (this.connections[elementID][slot] !== undefined) {

            // For every connection the element has
            for (i in this.connections[elementID][slot]) {

                if (this.connections[elementID][slot].hasOwnProperty(i)){

                    // Retrieve the other connection end and the connection parameters.
                    receiverHash = this.connections[elementID][slot][i];
                 
                    recvElementID = receiverHash.recvElement;
                    recvSlot = receiverHash.recvSlot;

                    //Check the callback here.
                    if (typeof(receiverHash.callback) === "function") {
                        // We have a callback to call. This is typically
                        // used as a filter to translate the values.
                        value = receiverHash.callback (value);
                    }

                    // Recursively calls itself, keeping an history in the stack
                    // this.elements[recvHash].setValue(recvSlot, value);
                    this.setValue(recvElementID, recvSlot, value, hist);
                }
            }
        }
    };
    // </VALUE HANDLING>

    // <VISIBILITY HANDLING>

    // todo these two functions are complementary.

    this.hideElement = function (elementID) {

        var visibilityState;

        if (this.elements[elementID] !== undefined) {
            visibilityState = this.elements[elementID].getVisible();
            if (visibilityState === true) {
                // Set the element's visibility
                this.elements[elementID].setVisible (false);
                // When hidden, the element is also not listening to events
                this.elements[elementID].setClickable (false);

                // Reset the wrapper.
                this.reset();

                // Repaint everything, in order.
                this.refresh();
            }

        }

        else {
            throw new Error("Element " + elementID + " not present.");
        }

    }

    this.unhideElement = function (elementID) {

        var visibilityState;

        if (this.elements[elementID] !== undefined) {
            visibilityState = this.elements[elementID].getVisible();
            if (visibilityState === false) {

                // Set the element's visibility
                this.elements[elementID].setVisible (true);
                // When unhidden, the element starts listening to events again.
                this.elements[elementID].setClickable (true);

                //Reset the wrapper.
                this.reset();

                // Repaint everything, in order.
                this.refresh();
            }

        }

        else {
            throw new Error("Element " + elementID + " not present.");
        }
    }

    this.setHidden = function (elementID, value) {
        this.setVisible(elementID, !value)
    }

    this.setVisible = function (elementID, value) {
            var visibilityState;

            if (this.elements[elementID] !== undefined) {
                visibilityState = this.elements[elementID].getVisible();
                if (visibilityState !== value) {

                    // Set the element's visibility
                    this.elements[elementID].setVisible (value);
                    // When unhidden, the element starts listening to events again.
                    this.elements[elementID].setClickable (value);

                    //Reset the wrapper.
                    this.reset();

                    // Repaint everything, in order.
                    this.refresh();
                }

            }

            else {
                throw new Error("Element " + elementID + " not present.");
            }
        }

    // </VISIBILITY HANDLING>

    // <REFRESH HANDLING>
    this.refreshZ = function (z) {
        //Refresh every layer, starting from z to the last one.
        for (var i = z, length =  this.zArray.length; i < length; i += 1) {
            if (typeof(this.zArray[i]) === "object") {
                for (var k = 0, z_length = this.zArray[i].length; k < z_length; k += 1) {
                    if (this.zArray[i][k].getVisible() === true) {
                        this.zArray[i][k].setTainted(true);
                        this.zArray[i][k].refresh();
                    }
                }
            }
        }
    }

    this.refresh = function () {
        // Refresh the undefined z-index elements.
        for (var k = 0, z_length = this.zArrayUndefined.length; k < z_length; k += 1) {
            this.zArrayUndefined[k].setTainted(true);
            this.zArrayUndefined[k].refresh();
        }
        // Then refresh everything from the smallest z-value, if there is one.
        if (this.zMin !== undefined) {
            this.refreshZ(this.zMin);
        }
    }

    this.reset = function () {
        // Reset the graphic frontend
        this.graphicWrapper.reset();
    }
}
    // </REFRESH HANDLING>
