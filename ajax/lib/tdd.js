var tddjs = (function () {
  function namespace(string) {
    var object = this;
    var levels = string.split(".");

    for (var i = 0, l = levels.length; i < l; i++) {
      if (typeof object[levels[i]] == "undefined") {
        object[levels[i]] = {};
      }

      object = object[levels[i]];
    }

    return object;
  }
  return {
    namespace: namespace
  }
})();

(function () {
  var dom = tddjs.namespace("dom");

  function addClassName(element, cName) {
    var regexp = new RegExp("(^|\\s)" + cName + "(\\s|$)");

    if (element && !regexp.test(element.className)) {
      cName = element.className + " " + cName;
      element.className = cName.replace(/^\s+|\s+$/g, "");
    }
  }

  function removeClassName(element, cName) {
    var r = new RegExp("(^|\\s)" + cName + "(\\s|$)");

    if (element) {
      cName = element.className.replace(r, " ");
      element.className = cName.replace(/^\s+|\s+$/g, "");
    }
  }

  dom.addClassName = addClassName;
  dom.removeClassName = removeClassName;
})();

tddjs.isHostMethod = function (object, property) {
  var type = typeof object[property];

  return type == "function" ||
  (type == "object" && !!object[property]) ||
  type == "unknown";
};
