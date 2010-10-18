function UI() {

        this.mouseUp = true;
        this.startedonknob = undefined;
        this.start_x = undefined;
        this.start_y = undefined;

        this.elements = {};
        this.connections = {};

        // *** Add an UI element **** //
        this.addElement = function(element, drawClass) {
                // This encapsulates the drawing class into the GUI element.
                element.setDrawClass(drawClass);

                this.elements[element.name] = element;

                // Insert the element in the connection keys.
                this.connections[element.name] = {};
                
                // Get the slots available from the element.
                var slots = element.getValues();
                
                // Insert all possible elements in the connection matrix
                for (var slot in slots) {
                    this.connections[element.name][slots[slot]] = new Array ();
                }
        }

        // *** Call all the ROI on clickable elements to get the slots they're locked to *** //
        this.elementsROI = function (x, y) {
            for (var name in this.elements) {
                if (this.elements[name].isClickable == true) {
                    if (this.elements[name].IsInROI (x,y) == true) {
                        //console.log("click ROI in ", name);
                        return name;
                    }
                }
            }
            //console.log("click ROI is undefined. x is ", x, " y is ", y , " elements are ", this.elements);
            return undefined;
        }

        // *** Some ROI was triggered, perform the proper action *** //
        this.onMouseMoveFunc = function (evt) {

             if (this.mouseUp == false) {

                if (this.startedonknob != undefined) {

                    var ret = this.elements[this.startedonknob].onROI(this.start_x,
                                                                    this.start_y,
                                                                    evt.pageX, evt.pageY);
                                                                    
                    this.setValue(this.startedonknob, ret["slot"], ret["value"]);

                }

            }

        }

        // *** Does mouse down triggers some element? *** //
        this.onMouseDownFunc = function (evt) {

            this.mouseUp = false;
            // Did it start on a clickable element?
            this.startedonknob = this.elementsROI(evt.pageX, evt.pageY);
            this.start_x = evt.pageX;
            this.start_y = evt.pageY;
        }

        // *** Mouse is up *** //
        this.onMouseUpFunc = function (evt) {

            this.mouseUp = true;
            this.start_x = undefined;
            this.start_y = undefined;
            this.startedonknob = undefined;

        }

        // *** Connect slots, so that one element can "listen" to the other *** //
        this.connectSlots  = function (senderElement, senderSlot, receiverElement, receiverSlot) {

            //Check for the elements.
            if ((this.elements[senderElement] != undefined) && (this.elements[receiverElement] != undefined)) {
                 //Check for the slots.
                 if ((this.elements[senderElement].values[senderSlot] != undefined) &&
                     (this.elements[receiverElement].values[receiverSlot] != undefined)) {
                            // The sender & receiver element & slot exist. Do the connection.
                            // Beware of infinite loops here.
                             var receiverHash = {"recvElement" : receiverElement, "recvSlot": receiverSlot};
                            // Push the destination element/slot in the connections matrix.
                            this.connections[senderElement][senderSlot].push (receiverHash);
                     }
                     else {
                         throw new Error ("Slot " + senderSlot + " or " + receiverSlot + " not present.");
                     }
            }

            else {
                throw new Error ("Element " + senderElement + " or " + receiverElement + " not present." );
            }
        }

        // *** This handles one set value event and propagates it in the connections matrix *** //
        this.setValue = function (elementName, slot, value) {
            if (this.elements[elementName] != undefined) {
                this.elements[elementName].setValue (slot, value);
            }
            else {
                throw new Error ("Element " + elementName + " not present.");
            }

            if (this.connections[elementName][slot] != undefined) {
                for (var i in this.connections[elementName][slot]) {
                    var receiverHash = this.connections[elementName][slot][i];
                    //console.log("Listener number ", i, " of ", elementName, ":", slot, " seems ", receiverHash);
                    /* Whew. */
                    // This should be always correct, as we checked when we inserted the connection.
                    // TODO Should recursively call the setValues
                    var recvHash = receiverHash["recvElement"];
                    var recvSlot = receiverHash["recvSlot"];
                    this.elements[recvHash].setValue(recvSlot, value);
                }
            }
        }

}

