// Generated by CoffeeScript 2.3.0
(function() {
  var TestMLBridge;

  require('testml/bridge');

  module.exports = TestMLBridge = class TestMLBridge extends TestML.Bridge {
    add(x, y) {
      return x + y;
    }

    sub(x, y) {
      return x - y;
    }

    cat(x, y) {
      return x + y;
    }

  };

}).call(this);
