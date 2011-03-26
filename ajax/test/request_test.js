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

  TestCase("GetRequestTest", {
    setUp: function () {
      this.ajaxCreate = ajax.create;
      this.tddjsIsLocal = tddjs.isLocal;
      this.xhr = Object.create(fakeXMLHttpRequest);
      ajax.create = stubFn(this.xhr);
    },

    tearDown: function () {
      ajax.create = this.ajaxCreate;
      tddjs.isLocal = this.tddjsIsLocal;
    },

    "test should define get method": function () {
      assertFunction(ajax.get);
    },

    "test should throw error without url": function () {
      assertException(function () {
        ajax.get();
      }, "TypeError");
    },

    "test should obtain an XMLHttpRequest object": function () {
      ajax.get("/url");

      assert(ajax.create.called);
    },

    "test should call open with method, url, async flag":
    function () {
      var url = "/url";
      ajax.get(url);

      assertEquals(["GET", url, true], this.xhr.open.args);
    },

    "test should add onreadystatechange handler": function () {
      ajax.get("/url");

      assertFunction(this.xhr.onreadystatechange);
    },

    "test should call send": function () {
      ajax.get("/url");

      assert(this.xhr.send.called);
    },
  });

  TestCase("ReadyStateHandlerTest", {
    setUp: function () {
      this.ajaxCreate = ajax.create;
      this.xhr = Object.create(fakeXMLHttpRequest);
      ajax.create = stubFn(this.xhr);
    },

    tearDown: function () {
      ajax.create = this.ajaxCreate;
    },

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

      ajax.get("/url");

      assertNoException(function () {
        this.xhr.onreadystatechange();
      }.bind(this));
    },

    "test should pass null as argument to send": function () {
      ajax.get("/url");

      assertNull(this.xhr.send.args[0]);
    },

    "test should reset onreadystatechange when complete":
    function () {
      this.xhr.readyState = 4;
      ajax.get("/url");

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
})();
