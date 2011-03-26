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

tddjs.noop = function () {};

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

tddjs.isLocal = (function () {
  function isLocal() {
    return !!(window.location &&
      window.location.protocol.indexOf("file:") === 0);
  }

  return isLocal;
})();

tddjs.isOwnProperty = (function () {
  var hasOwn = Object.prototype.hasOwnProperty;

  if (typeof hasOwn === "function") {
    return function (object, property) {
      return hasOwn.call(object, property);
    };
  } else {
    throw "Not Implemented";
  }
})();

tddjs.each = (function () {
  // Returns an array of properties that are not exposed
  // in a for-in loop on the provided object
  function unEnumerated(object, properties) {
    var length = properties.length;

    for (var i = 0; i < length; i++) {
      object[properties[i]] = true;
    }

    var enumerated = length;

    for (var prop in object) {
      if (tddjs.isOwnProperty(object, prop)) {
        enumerated -= 1;
        object[prop] = false;
      }
    }

    if (!enumerated) {
      return;
    }

    var needsFix = [];

    for (i = 0; i < length; i++) {
      if (object[properties[i]]) {
        needsFix.push(properties[i]);
      }
    }

    return needsFix;
  }

  var oFixes = unEnumerated({},
    ["toString", "toLocaleString", "valueOf",
      "hasOwnProperty", "isPrototypeOf",
      "constructor", "propertyIsEnumerable"]);

  var fFixes = unEnumerated(
    function () {}, ["call", "apply", "prototype"]);

  if (fFixes && oFixes) {
    fFixes = oFixes.concat(fFixes);
  }

  var needsFix = { "object": oFixes, "function": fFixes };

  return function (object, callback) {
    if (typeof callback !== "function") {
      throw new TypeError("callback is not a function");
    }

    // Normal loop, should expose all enumerable properties
    // in conforming browsers
    for (var prop in object) {
      if (tddjs.isOwnProperty(object, prop)) {
        callback(prop, object[prop]);
      }
    }

    // Loop additional properties in non-conforming browsers
    var fixes = needsFix[typeof object];

    if (fixes) {
      var property;

      for (var i = 0, l = fixes.length; i < l; i++) {
        property = fixes[i];

        if (tddjs.isOwnProperty(object, property)) {
          callback(property, object[property]);
        }
      }
    }
  };
})();

tddjs.extend = (function () {
  function extend(target, source) {
    target = target || {};

    if (!source) {
      return target;
    }

    tddjs.each(source, function (prop, val) {
      target[prop] = val;
    });

    return target;
  }

  return extend;
})();

(function () {
  if (typeof encodeURIComponent === "undefined") {
    return;
  }

  function urlParams(object) {
    if (!object) {
      return "";
    }

    if (typeof object === "string") {
      return encodeURI(object);
    }

    var pieces = [];

    tddjs.each(object, function (prop, val) {
      pieces.push(encodeURIComponent(prop) + "=" +
                  encodeURIComponent(val));
    });

    return pieces.join("&");
  }

  tddjs.namespace("util").urlParams = urlParams;
})();
