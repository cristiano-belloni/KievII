window.kievII = window.K2 = K2;
if (typeof window.define === "function" && window.define.amd) {
  window.define("kievII", [], function() {
    return kievII;
  });
}
