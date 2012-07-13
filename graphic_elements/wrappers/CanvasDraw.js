CANVAS_WRAPPER = {

    drawImage: function (canvas) {

        this.canvasC = canvas;


        this.draw = function (image, x, y) {

                this.canvasC.drawImage(image, x, y);

            }

        this.drawRotate = function (image, x, y, rot, rot_type /* = center TODO */) {
            this.canvasC.save();
            this.canvasC.translate(x + (image.width / 2), y + (image.height / 2));
            this.canvasC.rotate(rot);
            this.canvasC.translate(-(image.width / 2) - x, -(image.height / 2) - y);
            this.canvasC.drawImage(image, x, y);
            this.canvasC.restore();
        }

        this.saveBackground = function (left, top, width, height) {


            this.backgroundPixels = this.canvasC.getImageData(left, top, width, height);
            this.bgX = left;
            this.bgY = top;
        }

        this.restoreBackground = function () {
            this.canvasC.putImageData(this.backgroundPixels, this.bgX, this.bgY);
        }
    },

    drawText: function (canvas, textParms) {

        this.canvasC = canvas;

        var HTML5TextParameters = ['fillStyle', 'font', 'textAlign', 'textBaseline'];
        var canvasPropStorage = {};

        this.font = textParms.font || "verdana";        //Default
        this.textColor = textParms.textColor || null;   // Use the canvas' value
        this.textAlignment = textParms.textAlignment || null;
        this.textBaseline = textParms.textBaseline || null;

        this.draw = function (text, x, y, width, length) {

                //Save the parameters.
                canvasPropStorage.tempBaseline = this.canvasC.textBaseline;
                canvasPropStorage.tempAlign = this.canvasC.textAlign;
                canvasPropStorage.tempFont = this.canvasC.font;
                canvasPropStorage.tempfillStyle = this.canvasC.fillStyle;

                if (this.textBaseline !== null) {
                    this.canvasC.textBaseline = this.textBaseline;
                }

                if (this.textAlignment!== null) {
                    this.canvasC.textAlign = this.textAlignment;
                }

                if (this.font !== null) {
                    this.canvasC.font = this.font;
                }

                if (this.textColor != null) {
                    this.canvasC.fillStyle = this.textColor;
                }

                //Write the label
                this.canvasC.fillText(text, x, y);

                this.canvasC.textBaseline = canvasPropStorage.tempBaseline;
                this.canvasC.textAlign = canvasPropStorage.tempAlign;
                this.canvasC.font = canvasPropStorage.tempFont;
                this.canvasC.fillStyle = canvasPropStorage.tempfillStyle;

            }

            this.saveBackground = function (left, top, width, height) {

                var xcoord,
                    ycoord,
                    wd,
                    hg;

                    xcoord = left;
                    ycoord = top;
                    wd = width;
                    hg = height;

                /* TODO check all the out of bounds
                 * and all the possibilities:
                 * https://developer.mozilla.org/en/drawing_text_using_a_canvas */
                if (this.textBaseline === 'bottom') {
                    ycoord = top - height;
                }
                if (this.textBaseline === 'middle') {
                    ycoord = top - height / 2;
                }
                if (this.textAlignment === 'end') {
                    xcoord = xcoord - wd;
                    if (xcoord < 0) {
                        xcoord = 0;
                    }
                }

                this.backgroundPixels = this.canvasC.getImageData(xcoord, ycoord, wd, hg);
                this.bgX = xcoord;
                this.bgY = ycoord;


            }

            this.restoreBackground = function () {

                this.canvasC.putImageData(this.backgroundPixels, this.bgX, this.bgY);

            }
    },

    drawRect: function (canvas) {

        function HexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
        function HexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
        function HexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
        function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
        function RGB2HTML(R, G, B) {
            var red = parseInt(R);
            var green = parseInt(G);
            var blue = parseInt(B);
            var hexcode = fillZero(red.toString(16)) + fillZero(green.toString(16)) + fillZero(blue.toString(16));
            return '#' + hexcode.toUpperCase();
        }

        function fillZero(myString) {
            if (myString.length == 1) return "0" + myString;
            else return myString;
        }

        this.canvasC = canvas;
        this.fillStyle = undefined;

        this.setFillStyle = function (color) {
            this.fillStyle = color;
        }

        this.setClearStyle = function (color) {
            this.clearStyle = color;
        }

        this.setStroke = function (stroke) {
            this.stroke = stroke;
        }

        /* TODO Maybe opacity? */
        this.draw = function (x, y, width, length, shade) {

            //Trasform the base color in RGB
            var R = HexToR(this.fillStyle);
            var G = HexToG(this.fillStyle);
            var B = HexToB(this.fillStyle);

            //Add "shade" to the RGB values
            R += shade;
            G += shade;
            B += shade;

            if (R < 0) {
                R = 0;
            }
            if (G < 0) {
                G = 0;
            }
            if (B < 0) {
                B = 0;
            }
            if (R > 255) {
                R = 255;
            }
            if (G > 255) {
                G = 255;
            }
            if (B > 255) {
                B = 255;
            }
            //Convert back to hex format.
            var realColor = RGB2HTML(R, G, B);

            this.reallyDraw (x,y, width, length, realColor);
        }

        this.draw = function (x, y, width, length, color) {

            //Save fillStyle.
            var tempfillStyle = this.canvasC.fillStyle;

            // draw
            this.canvasC.fillStyle = color;
            this.canvasC.fillRect (x, y,  width, length);

            // Restore fillStyle
            this.canvasC.fillStyle = tempfillStyle;
        }
    },

    drawPoint: function (canvas, color, dimension) {

        this.canvasC = canvas;
        this.fillStyle = color;
        this.dimension = dimension;

        this.draw = function (x, y) {
            //Save fillStyle.
            var tempfillStyle = this.canvasC.fillStyle;
            this.canvasC.fillStyle = this.fillStyle;

            this.canvasC.fillRect(x, y, this.dimension, this.dimension);

            // Restore fillStyle
            this.canvasC.fillStyle = tempfillStyle;

        }
    },
    
    drawDummy: function (canvas) {
    	this.canvasC = canvas;
    },

    drawPath: function (canvas, pathParms) {

        this.canvasC = canvas;
        this.inited = false;
        this.pathColor = pathParms.pathColor || null;
        // To be implemented
        this.pathDimension = pathParms.pathDimension;

        this.draw = function (x, y) {

            //Save strokeStyle.
            var tempstrokeStyle = this.canvasC.strokeStyle;
            this.canvasC.strokeStyle = this.pathColor;
            
            //Save path dimension
            var templineWidth = this.canvasC.lineWidth;
            this.canvasC.lineWidth = this.pathDimension;

            if (this.inited === false) {
                this.canvasC.beginPath();
                this.canvasC.moveTo(x, y);
                this.inited = true;
            }
            else {
                this.canvasC.lineTo(x, y);
            }

            // Restore strokeStyle
            this.canvasC.strokeStyle = tempstrokeStyle;
            
            // Restore path dimension
            this.canvasC.lineWidth = templineWidth;
        }

        // Redundant.
        this.beginDraw = function () {
            this.inited = false;
        }

        this.endDraw = function () {

            this.inited = false;
            //Save strokeStyle.
            var tempstrokeStyle = this.canvasC.strokeStyle;
            this.canvasC.strokeStyle = this.pathColor;
            
            //Save path dimension
            var templineWidth = this.canvasC.lineWidth;
            this.canvasC.lineWidth = this.pathDimension;

            //this.canvasC.stroke();
            this.canvasC.fill();

            // Restore strokeStyle
            this.canvasC.strokeStyle = tempstrokeStyle;
            
            // Restore path dimension
            this.canvasC.lineWidth = templineWidth;
        }

        // These should be in the wrappers interface. TODO THIS IS DUPLICATE CODE!!!
        this.saveBackground = function (left, top, width, height) {


            this.backgroundPixels = this.canvasC.getImageData(left, top, width, height);
            this.bgX = left;
            this.bgY = top;
        }

        this.restoreBackground = function () {
            this.canvasC.putImageData(this.backgroundPixels, this.bgX, this.bgY);
        }
    },

   staticMethods : {
        reset: function (context, width, height) {
            context.clearRect(0, 0, width, height);
        }
    }
}