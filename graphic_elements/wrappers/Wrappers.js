var K2WRAPPER = {};

K2WRAPPER.createWrapper = function (type, args) {
    
    switch(type)
    {
    case "CANVAS_WRAPPER":
      if (args.canvas !== undefined) {
          return new canvasWrapperCreator (args.canvas);
      }
      //throw
      break;
    default:
      //throw
    }

    function canvasWrapperCreator (canvas) {
        
        // Utility functions
        // Resets the canvas
        this.reset = function () {
            this.wrapper.staticMethods.reset(this.context, this.canvas.width, this.canvas.height);
        }

        // Constructor
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.wrapper = CANVAS_WRAPPER;
        this.initObject = function (list) {
            // list: [{objName: "name", objParms: {parm1 = 1, parm2 = 2}},...]
            var ret = {};
            for (var i = 0; i < list.length; i +=1) {
                var name = list[i].objName;
                var parms = list[i].objParms;
                var func = this.wrapper[name];
                // Canvas is given to the object, so it can directly manipulate it.
                var obj = new func (this.context, parms);
                ret[name] = obj;
                ret[name]["staticMethods"] = this.wrapper.staticMethods;
            }
            return ret;
        }
    }

}