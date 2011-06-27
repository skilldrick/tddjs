(function () {
  var ajax = tddjs.ajax;

  function forceStatusAndReadyState(xhr, status, rs) {
    var success = stubFn();
    var failure = stubFn();

    ajax.get("/url", {
      success: success,
      failure: failure
    });

    xhr.status = status;
    xhr.readyStateChange(rs);

    return {
      success: success.called,
      failure: failure.called
    };
  }

  function setUp() {
    this.tddjsUrlParams = tddjs.util.urlParams;
    this.tddjsIsLocal = tddjs.isLocal;
    this.ajaxCreate = ajax.create;
    this.ajaxRequest = ajax.request;
    this.xhr = Object.create(fakeXMLHttpRequest);
    ajax.create = stubFn(this.xhr);
  }

  function tearDown() {
    tddjs.util.urlParams = this.tddjsUrlParams;
    tddjs.isLocal = this.tddjsIsLocal;
    ajax.create = this.ajaxCreate;
    ajax.request = this.ajaxRequest;
  }

  TestCase("RequestTest", {
    setUp: setUp,
    tearDown: tearDown,

    "test should use specified request method": function () {
      ajax.request("/uri", { method: "POST" });

      assertEquals("POST", this.xhr.open.args[0]);
    },

    "test should throw error without url": function () {
      assertException(function () {
        ajax.request();
      }, "TypeError");
    },

    "test should obtain an XMLHttpRequest object": function () {
      ajax.request("/url");

      assert(ajax.create.called);
    },

    "test should call open with method, url, async flag": function () {
      var url = "/url";
      ajax.request(url);

      assertEquals(["GET", url, true], this.xhr.open.args);
    },

    "test should add onreadystatechange handler": function () {
      ajax.request("/url");

      assertFunction(this.xhr.onreadystatechange);
    },

    "test should call send": function () {
      ajax.request("/url");

      assert(this.xhr.send.called);
    },

    "test should encode data": function () {
      tddjs.util.urlParams = stubFn();
      var object = { field1: "13", field2: "Lots of data!" };

      ajax.request("/url", { data: object, method: "POST" });

      assertSame(object, tddjs.util.urlParams.args[0]);
    },
  });

  TestCase("GetRequestTest", {
    setUp: setUp,
    tearDown: tearDown,

    "test should define get method": function () {
      assertFunction(ajax.get);
    },

    "test should sent data on URL for GET": function () {
      var url = "/url";
      var object = { field1: "$13", field2: "Lots of data!" };
      var expected = url + "?" + tddjs.util.urlParams(object);

      ajax.request(url, { data: object, method: "GET" });

      assertEquals(expected, this.xhr.open.args[1]);
    },

    "test should not break pre-existing querystring": function () {
      var url = "/url?page=1";
      var object = { field1: "$13", field2: "Lots of data!" };
      var expected = url + "&" + tddjs.util.urlParams(object);

      ajax.request(url, { data: object, method: "GET" });

      assertEquals(expected, this.xhr.open.args[1]);
    },
      

  });

  TestCase("ReadyStateHandlerTest", {
    setUp: setUp,
    tearDown: tearDown,

    "test should call success handler for status 200":
    function () {
      var request = forceStatusAndReadyState(this.xhr, 200, 4);

      assert(request.success);
    },

    "test should call success handler for status 304":
    function () {
      var request = forceStatusAndReadyState(this.xhr, 304, 4);

      assert(request.success);
    },

    "test should not throw error without success handler":
    function () {
      this.xhr.readyState = 4;
      this.xhr.status = 200;

      ajax.request("/url");

      assertNoException(function () {
        this.xhr.onreadystatechange();
      }.bind(this));
    },

    "test should pass null as argument to send": function () {
      ajax.request("/url");

      assertNull(this.xhr.send.args[0]);
    },

    "test should reset onreadystatechange when complete":
    function () {
      this.xhr.readyState = 4;
      ajax.request("/url");

      this.xhr.onreadystatechange();

      assertSame(tddjs.noop, this.xhr.onreadystatechange);
    },

    "test should call success handler for local requests":
    function () {
      tddjs.isLocal = stubFn(true);

      var request = forceStatusAndReadyState(this.xhr, 200, 4);

      assert(request.success);
    },

    "test should call failure handler for bad status codes":
    function () {
      var request = forceStatusAndReadyState(this.xhr, 404, 4);

      assert(request.failure);
    },
  });

  TestCase("PostRequestTest", {
    setUp: setUp,
    tearDown: tearDown,
    
    "test should call request with POST method": function () {
      ajax.request = stubFn();

      ajax.post("/url");

      assertEquals("POST", ajax.request.args[1].method);
    },

    "test should send data with send() for POST": function () {
      var object = { field1: "$13", field2: "Lots of data!" };
      var expected = tddjs.util.urlParams(object);

      ajax.request("/url",  { data: object, method: "POST" });

      assertEquals(expected, this.xhr.send.args[0]);
    }
  });

})();
