var BarSelect = function(parameters) {

    this.reorganizeElements = function() {
        
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
            
            if (slot === 'dragStart') {
                console.log ('Storing dragStart value ', value);
                that.dragStart = value;
            }
            
            if (slot === 'dragEnd') {
                console.log ('dragEnd, creating an Area ', value);
                that.dragEnd = value;
                var newArea = K2.GenericUtils.clone(that.areaArgsTemplate);
                newArea.ID = 'area' + that.status.nextNumber++;
                
                var areaElement = new K2.Area(newArea);
                
                areaElement.values.xOffset = that.dragStart[0];
                areaElement.values.width = that.dragEnd[0] - that.dragStart[0];
                
                console.log ('that.dragStart, that.dragEnd, newArea.left, newArea.width', that.dragStart, that.dragEnd, newArea.left, newArea.width);
                
                that.ui.addElement(areaElement);
                
                // Insert the element into the status array
                that.status.areaArray.splice(that.status.selected + 1, 0, newArea.ID);
            }
            
            
            //console.log("Reorganizing elements");
            //that.reorganizeElements();
            that.ui.refresh();
        };
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

    this.externalCallback = parameters.callback;
    var callback = this.callback();
    
    // area template
    this.areaArgsTemplate = {
        ID : '',
        top : 0,
        left : 0,
        width : parameters.defaultWidth || this.width,
        height : parameters.defaultHeight || this.height,
        thickness : parameters.thickness || 2,
        color : parameters.color || "black",
        borderColor: parameters.borderColor || "crimson",
        borders: {top: false, bottom: false, right: false, left: false},
        move: parameters.move || 'none',
        drag: {top: false, bottom: false, right: false, left: false},
        xMonotone: true,
        yMonotone: true,
        isListening : parameters.isListening || true,
        transparency : parameters.transparency || 0.5,
        onValueSet : callback
    };
    
    barArgs = {
        ID: "testBar",
        left: 0,
        top : 0,
        thickness: 2,
        height: this.height,
        width: this.width,
        onValueSet: callback,
        barColor: 'red',
        transparency: 0.8,
        isListening: true
    };
        
    this.ui.addElement(new K2.Bar(barArgs));
    
    this.ui.refresh();
};
