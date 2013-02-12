if (typeof window.define === "function" && window.define.amd) {
  window.define("kievII", [], function() {
    return kievII;
  });
}
else {
    window.kievII = window.K2 = K2;
}
