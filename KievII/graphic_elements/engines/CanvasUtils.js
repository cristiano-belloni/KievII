// This implementation adds functionality to the canvas; see http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas
// and thanks to Rod MacDougall
var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if (CP.lineTo) {
    CP.dashedLine = function(x, y, x2, y2, da) {
        if (!da) da = [10,5];
        this.save();
        var dx = (x2-x), dy = (y2-y);
        var len = Math.sqrt(dx*dx + dy*dy);
        var rot = Math.atan2(dy, dx);
        this.translate(x, y);
        this.moveTo(0, 0);
        this.rotate(rot);       
        var dc = da.length;
        var di = 0, draw = true;
        x = 0;
        while (len > x) {
            x += da[di++ % dc];
            if (x > len) x = len;
            
            if (draw) {
                this.lineTo(x, 0);
            }
            else {
                this.moveTo(x, 0);
            }
            
            draw = !draw;
        }       
        this.restore();
    };
}