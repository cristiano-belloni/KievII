function UI() {

    // <CONSTRUCTOR>

    this.mouseUp = true;
    // TODO hmmm, ret could be changed asynchronously.
    var ret;

    this.elements = {};
    this.connections = {};

    // </CONSTRUCTOR>

    // <ELEMENT HANDLING>

    // *** Add an UI element **** //
    this.addElement = function (element, drawClass) {
        var slot,
            slots;

        // This encapsulates the drawing class into the GUI element.
        element.setDrawClass(drawClass);

        this.elements[element.name] = element;

        // Insert the element in the connection keys.
        this.connections[element.name] = {};

        // Get the slots available from the element.
        slots = element.getValues();

        // Insert all possible elements in the connection matrix TODO ARRAY
        for (slot in slots) {
            this.connections[element.name][slots[slot]] = [];
        }
    };
    
    // </ELEMENT HANDLING>


    // <CONNECTION HANDLING>

    // Connect slots, so that one element can "listen" to the other
    this.connectSlots  = function (senderElement, senderSlot, receiverElement, receiverSlot) {

        //Check for the elements.
        if ((this.elements[senderElement] !== undefined) && (this.elements[receiverElement] !== undefined)) {
            // //Check for the slots.
            if ((this.elements[senderElement].values[senderSlot] !== undefined) &&
                (this.elements[receiverElement].values[receiverSlot] !== undefined)) {
                //The sender & receiver element & slot exist. Do the connection.
                // Beware of infinite loops here.
                var receiverHash = {"recvElement" : receiverElement, "recvSlot": receiverSlot};
                // Push the destination element/slot in the connections matrix.
                this.connections[senderElement][senderSlot].push(receiverHash);
            }
            else {
                throw new Error("Slot " + senderSlot + " or " + receiverSlot + " not present.");
            }
        }
        else {
            throw new Error("Element " + senderElement + " or " + receiverElement + " not present.");
        }
    };

    //</CONNECTION HANDLING>


    // <VALUE HANDLING>

    // This method handles one set value event and propagates it in the connections matrix
    this.setValue = function (elementName, slot, value) {
        var receiverHash,
            recvHash,
            recvSlot,
            i;

        if (this.elements[elementName] !== undefined) {
            this.elements[elementName].setValue(slot, value);
        }
        else {
            throw new Error("Element " + elementName + " not present.");
        }

        if (this.connections[elementName][slot] !== undefined) {
            for (i in this.connections[elementName][slot]) {
                receiverHash = this.connections[elementName][slot][i];
                //console.log("Listener number ", i, " of ", elementName, ":", slot, " seems ", receiverHash);
                /* Whew. */
                // This should be always correct, as we checked when we inserted the connection.
                // TODO Should recursively call the setValues
                recvHash = receiverHash.recvElement;
                recvSlot = receiverHash.recvSlot;
                this.elements[recvHash].setValue(recvSlot, value);
            }
        }
    };
    // </VALUE HANDLING>
    
    // <EVENT HANDLING>

    // Notify every element about the event.
    this.elementsNotifyEvent = function (x, y, event) {
        // For every element
        for (var name in this.elements) {
            // Notify the element
            ret = this.elements[name][event](x, y);
            // See if the element changed its value
            if (ret !== undefined) {
                // console.log("UI: Element ", name, " changed its value on event ", event);
                this.setValue(name, ret.slot, ret.value);
            }
        }
    };

    // On mouseMove event
    this.onMouseMoveFunc = function (evt) {
        // Only if the mouse button is still down (This could be useless TODO).
        if (this.mouseUp === false) {
            this.elementsNotifyEvent(evt.pageX, evt.pageY, "onMouseMove");
        }
    };

    // On mouseDown event
    this.onMouseDownFunc = function (evt) {
        this.mouseUp = false;
        this.elementsNotifyEvent(evt.pageX, evt.pageY, "onMouseDown");
    };

    // On mouseUp event
    this.onMouseUpFunc = function (evt) {
        this.mouseUp = true;
        this.elementsNotifyEvent(evt.pageX, evt.pageY, "onMouseUp");
    };

    // </EVENT HANDLING>

}

