(function () {
  var ajax = tddjs.namespace("ajax");

  if (!ajax.create) {
    return;
  }

  function isSuccess(transport) {
    var status = transport.status;

    return (status >= 200 && status < 300) ||
            status === 304 ||
            (tddjs.isLocal() && !status);
  }

  function requestComplete(transport, options) {
    var status = transport.status;
    if (isSuccess(transport)) {
      if (typeof options.success === "function") {
        options.success(transport);
      }
    }
    else {
      if (typeof options.failure === "function") {
        options.failure(transport);
      }
    }
  }

  function get(url, options) {
    options = tddjs.extend({}, options);
    options.method = "GET";
    ajax.request(url, options);
  }

  function request(url, options) {
    if (typeof url !== "string") {
      throw new TypeError("URL should be string");
    }

    options = options || {};
    var transport = ajax.create();
    transport.open(options.method || "GET", url, true);

    transport.onreadystatechange = function () {
      if (transport.readyState === 4) {
        requestComplete(transport, options);
        transport.onreadystatechange = tddjs.noop;
      }
    };
    transport.send(null);
  }

  ajax.get = get;
  ajax.request = request;
})();
