//TODO do this with prototypes.

function CanvasDrawImage (canvas) {

    this.canvasC = canvas


    this.draw = function (image, x, y) {

            this.canvasC.drawImage(image, x, y);

        }

    // These should be in the wrappers interface. TODO THIS IS DUPLICATE CODE!!!
    this.saveBackground = function (left, top, width, height) {
        this.backgroundPixels = this.canvasC.getImageData(left, top, width, height);
        this.bgX = left;
        this.bgY = top;
        console.log ("this.bgX ", this.bgX, "this.bgY ", this.bgY)
        console.log ("Saved the background, from (", left, ",", top, ") to (", left + width, ",", top + height, ")");
    }

    this.restoreBackground = function () {
        this.canvasC.putImageData(this.backgroundPixels, this.bgX, this.bgY);
        console.log ("Restored the background in (", this.bgX, ",", this.bgY,")");
    }
}

function CanvasDrawText (canvas) {

    this.fillStyle = undefined;
    this.textStyle = undefined;

    this.canvasC = canvas;
    this.font = undefined;

    this.setFont = function (font) {
        this.font = font;
    }

    this.setFillStyle = function (fs) {
        this.fillStyle = fs;
        //console.log ("setFillStyle: fillStyle set to ", fs);
    }

    this.setTextStyle = function (ts) {
        this.textStyle = ts;
        //console.log ("setTextStyle: textStyle set to ", ts);
    }
    
    this.draw = function (text, x, y, width, length) {

            //Save the baseline
            var tempBaseline = this.canvasC.textBaseline;
            this.canvasC.textBaseline = "top";

            //Save the alignment
            var tempAlign = this.canvasC.textAlign;
            this.canvasC.textAlign = "left";

            //Save the font
            var tempFont = this.canvasC.font;
            if (this.font != undefined) {
                this.canvasC.font = this.font;
            }

            //Save the bg color.
            var tempfillStyle = this.canvasC.fillStyle;

            if (this.fillStyle != undefined) {
                this.canvasC.fillStyle = this.fillStyle;
            }
            //console.log ("fillStyle set to ", this.fillStyle);
            
            //Fill the label
            this.canvasC.fillRect (x, y,  width, length);

            if (this.textStyle != undefined) {
                this.canvasC.fillStyle = this.textStyle;
            }
            //console.log ("textStyle set to ", this.textStyle);

            //Write the label
            this.canvasC.fillText(text, x, y);
            
            //Restore the baseline
            this.canvasC.textBaseline = tempBaseline;

            //Restore the alignment
            this.canvasC.textAlign = tempAlign;

            // Restore the font
            this.canvasC.font = tempFont;

            // Restore the font
            this.canvasC.fillStyle = tempfillStyle;

        }
}

function CanvasDrawRect (canvas) {

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

    this.clear = function (x, y, width, length) {
        //Clears the background.
        this.reallyDraw (x, y, width, length, this.clearStyle);
    }

    this.reallyDraw = function (x, y, width, length, color) {

        //Save fillStyle.
        var tempfillStyle = this.canvasC.fillStyle;

        this.canvasC.fillStyle = color;

        this.canvasC.fillRect (x, y,  width, length);

        // Restore fillStyle
        this.canvasC.fillStyle = tempfillStyle;
    }
}

function CanvasDrawPoint (canvas, color, dimension) {

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
}

function CanvasDrawPath (canvas, color, dimension) {

    this.canvasC = canvas;
    this.inited = false;
    this.fillStyle = color;
    // To be implemented
    this.dimension = dimension;

    this.draw = function (x, y) {

        //Save fillStyle.
        var tempfillStyle = this.canvasC.fillStyle;
        this.canvasC.fillStyle = this.fillStyle;

        if (this.inited === false) {
            console.log ("Beginning path");
            this.canvasC.beginPath();
            this.canvasC.moveTo(x, y);
            this.inited = true;
        }
        else {
            this.canvasC.lineTo(x, y);
        }

        // Restore fillStyle
        this.canvasC.fillStyle = tempfillStyle;
    }

    // Redundant.
    this.beginDraw = function () {
        this.inited = false;
    }

    this.endDraw = function () {

        this.inited = false;
        //Save fillStyle.
        var tempfillStyle = this.canvasC.fillStyle;
        this.canvasC.fillStyle = this.fillStyle;

        this.canvasC.stroke();

        // Restore fillStyle
        this.canvasC.fillStyle = tempfillStyle;
    }

    // These should be in the wrappers interface.
    this.saveBackground = function (left, top, width, height) {
        this.backgroundPixels = this.canvasC.getImageData(left, top, width, height);
        this.bgX = left;
        this.bgY = top;
        console.log ("this.bgX ", this.bgX, "this.bgY ", this.bgY)
        console.log ("Saved the background, from (", left, ",", top, ") to (", left + width, ",", top + height, ")");
    }

    this.restoreBackground = function () {
        this.canvasC.putImageData(this.backgroundPixels, this.bgX, this.bgY);
        console.log ("Restored the background in (", this.bgX, ",", this.bgY,")");
    }

}