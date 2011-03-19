(function () {
  var ajax = tddjs.namespace("ajax");

  if (!ajax.create) {
    return;
  }

  function get(url) {
    if (typeof url !== "string") {
      throw new TypeError("URL should be string");
    }
    var transport = tddjs.ajax.create();
    transport.open("GET", url, true);
  }

  ajax.get = get;
})();
