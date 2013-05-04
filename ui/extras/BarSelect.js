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
