K2.ENGINE = {};

K2.ENGINE.engineFactory = function (type, args) {
    
    switch(type)
    {
    case 'CANVAS2D':
      if (args.target !== undefined) {
          return new canvasEngineCreator (args.target);
      }
      else {
          throw ("Engine: args is undefined");
      }
      break;
      
    case 'ANOTHERTYPE':
        throw ("Engine type not recognized: " + type);
    default:
        throw ("Engine type not recognized: " + type);
    }

    function canvasEngineCreator (canvas) {
        
        // Utility functions
        // Resets the canvas
        this.reset = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };

        // Constructor
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.type = 'CANVAS2D';
        
        this.getContext = function () {
            return this.context;
        };
        this.getCanvas = function () {
            return this.canvas;
        };
    }

};