(function () {
  var ajax = tddjs.namespace("ajax");

  if (!ajax.create) {
    return;
  }

  function requestComplete(transport, options) {
    var status = transport.status;
    if (status === 200 || status === 304 ||
        (tddjs.isLocal() && !status)) {
      if (typeof options.success === "function") {
        options.success(transport);
      }
    }
    else if (typeof options.failure === "function") {
      options.failure(transport);
    }
  }

  function get(url, options) {
    if (typeof url !== "string") {
      throw new TypeError("URL should be string");
    }

    options = options || {};
    var transport = ajax.create();
    transport.open("GET", url, true);

    transport.onreadystatechange = function () {
      if (transport.readyState === 4) {
        requestComplete(transport, options);
        transport.onreadystatechange = tddjs.noop;
      }
    };
    transport.send(null);
  }

  ajax.get = get;
})();
