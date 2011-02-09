function UI(offsetTop, offsetLeft) {

    // <CONSTRUCTOR>

    // The drawing context can be offset.
    this.offsetTop = offsetTop;
    this.offsetLeft = offsetLeft;

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

        if (this.elements[element.name] !== undefined) {
            throw new Error("Conflicting / Duplicated name in UI: " + element.name + " (names are identifiers and should be unique)");
            return;
        }

        this.elements[element.name] = element;

        // Insert the element in the connection keys.
        this.connections[element.name] = {};

        // Get the slots available from the element.
        slots = element.getValues();

        // Insert all possible elements in the connection matrix TODO ARRAY
        for (slot in slots) {
            if (slots.hasOwnProperty(slot)) {
                this.connections[element.name][slots[slot]] = [];
            }
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

    this.checkInfiniteLoops = function () {
        for (var element in this.connections) {
            if (this.connections.hasOwnProperty(element)) {
                for (var slot in element) {
                    if (element.hasOwnProperty(slot)) {
                        var alreadySaw = [];
                        // Here traverse the chain TODO.
                        // slot.recvElement;
                        // slot.recvSlot;
                    }
                }
            }
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
                if (this.connections[elementName][slot].hasOwnProperty(i)){
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
        }
    };
    // </VALUE HANDLING>
    
    // <EVENT HANDLING>

    // Notify every element about the event.
    this.elementsNotifyEvent = function (x, y, event) {
        // For every element
        for (var name in this.elements) {
            if (this.elements.hasOwnProperty(name)){
                // Notify the element
                ret = this.elements[name][event](x, y);
                // See if the element changed its value
                if (ret !== undefined) {
                    // console.log("UI: Element ", name, " changed its value on event ", event);
                    this.setValue(name, ret.slot, ret.value);
                }
            }
        }
    };

    // Event handlers: we need closures here, because they will be called as callbacks.

    // On mouseMove event
    this.onMouseMoveFunc = function () {
        var that = this;
            return function (evt) {

            var realCoords = that.calculateOffset(evt);

            // Only if the mouse button is still down (This could be useless TODO).
            if (that.mouseUp === false) {
                that.elementsNotifyEvent(realCoords.pageX, realCoords.pageY, "onMouseMove");
            }
        };
    };

    // On mouseDown event
    this.onMouseDownFunc = function () {
        var that = this;
            return function (evt) {

            var realCoords = that.calculateOffset(evt);

            that.mouseUp = false;
            that.elementsNotifyEvent(realCoords.pageX, realCoords.pageY, "onMouseDown");
        };
    };

    // On mouseUp event
    this.onMouseUpFunc = function () {
        var that = this;
            return function (evt) {

            var realCoords = that.calculateOffset(evt);

            that.mouseUp = true;
            that.elementsNotifyEvent(realCoords.pageX, realCoords.pageY, "onMouseUp");

        };
    };

    this.calculateOffset = function (evt) {

            var obj = {};

            obj.pageX = evt.pageX;
            obj.pageY = evt.pageY;

            if (this.offsetTop !== undefined) {
                obj.pageY -= this.offsetTop;
            }

            if (this.offsetLeft !== undefined) {
                obj.pageX -= this.offsetLeft;
            }

            return obj;
    }

    // </EVENT HANDLING>

}

