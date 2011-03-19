(function () {
  var ajax = tddjs.namespace("ajax");

  function get(url) {
    if (typeof url !== "string") {
      throw new TypeError("URL should be string");
    }
  }

  ajax.get = get;
})();
