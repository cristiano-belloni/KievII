if (typeof define === "function" && define.amd) {
  console.log ("AMD detected, setting define");  
  define(["hammerjs"], function(Hammer) {
    console.log ("KievII: returning K2 object inside the define (AMD detected)");
    K2.Hammer = Hammer;
    return K2;
  });
}
else {
    console.log ("KievII: setting window.K2 (no AMD)");
    // Check if Hammer.js is present
	if (typeof window.Hammer === 'undefined') {
		throw ("Hammer.js needed!");
	}
	K2.Hammer = window.Hammer;
    window.kievII = window.K2 = K2;
}

})();