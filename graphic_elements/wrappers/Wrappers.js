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
        this.canvas = canvas;
        this.wrapper = CANVAS_WRAPPER;
        this.initObject = function (list) {
            // list: [{objName: "name", objParms: {parm1 = 1, parm2 = 2}},...]
            var ret = {};
            for (var i = 0; i < list.length; i +=1) {
                var name = list[i].objName;
                var parms = list[i].objParms;
                var func = this.wrapper[name];
                var obj = new func (this.canvas, parms);
                ret[name] = obj;
                ret[name]["staticMethods"] = this.wrapper.staticMethods;
            }
            return ret;
        }
    }

}