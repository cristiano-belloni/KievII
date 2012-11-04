var BarSelect = function(parameters) {

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
                
                if (that.areaElement === null) {
                	if (that.ui.isElement(that.areaArgsTemplate.ID)) {
                		that.ui.removeElement(that.areaArgsTemplate.ID);
                	}
	                var newArea = K2.GenericUtils.clone(that.areaArgsTemplate);
	                that.areaElement = new K2.Area(newArea);
                }
                
                that.areaElement.values.xOffset = that.dragStart[0];
                that.areaElement.values.width = 0;
                
                that.ui.addElement(that.areaElement);
                
                // Insert the element into the status array
                that.status.areaArray.splice(that.status.selected + 1, 0, newArea.ID);
                
            }
            
            if (slot === 'barPos') {
                
                if (that.areaElement !== null) {
                    var width = value[0] - that.dragStart[0];
                    that.areaElement.values.width = width;
                }
            }
            
            if (slot === 'dragEnd') {
                
                if (that.areaElement !== null) {
                    var width = value[0] - that.dragStart[0];
                    that.areaElement.values.width = width;
                    that.areaElement = null;
                }
                
            }
            
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
    
    this.areaElement = null; 

    this.Z_OFFSET = parameters.zOffset || 0;

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
        drag: {top: false, bottom: false, right: false, left: false},
        xMonotone: true,
        yMonotone: true,
        transparency : parameters.areaTransparency || 0.5,
        onValueSet : callback
    };
    
    barArgs = {
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
        
    this.ui.addElement(new K2.Bar(barArgs));
    
    this.ui.refresh();
};
