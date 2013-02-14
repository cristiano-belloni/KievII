if (typeof window.define === "function" && window.define.amd) {
  console.log ("AMD detected, setting define");  
  window.define("kievII", [], function() {
    console.log ("KievII: returning K2 object inside the define (AMD detected)");
    return K2;
  });
}
else {
    console.log ("KievII: setting window.K2 (no AMD)");
    window.kievII = window.K2 = K2;
}
