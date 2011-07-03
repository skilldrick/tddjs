(function () {
  var ajax = tddjs.ajax;

  TestCase("PollerTest", {
    setUp: function () {
      this.ajaxCreate = ajax.create;
      this.xhr = Object.create(fakeXMLHttpRequest);
      ajax.create = stubFn(this.xhr);
      this.ajaxRequest = ajax.request;
      this.poller = Object.create(ajax.poller);
      this.poller.url = "/url";
    },

    tearDown: function () {
      ajax.request = this.ajaxRequest;
      ajax.create = this.ajaxCreate;
      Clock.reset();
    },

    "test should be object": function () {
      assertObject(ajax.poller);
    },

    "test should throw exception for missing URL":
    function () {
      assertException(function () {
        this.poller.start();
      }, "TypeError");
    },

    "test should define a start method": function () {
      assertFunction(ajax.poller.start);
    },

    "test should schedule new request when complete": function () {
      this.poller.start();
      this.xhr.complete();
      this.xhr.send = stubFn();
      Clock.tick(1000);

      assert(this.xhr.send.called);
    },

    "test should not make a new request until 1000ms passed": function () {
      this.poller.start();
      this.xhr.complete();
      this.xhr.send = stubFn();
      Clock.tick(999);

      assertFalse(this.xhr.send.called);
    },

    "test should configure request interval":
    function () {
      this.poller.interval = 350;
      this.poller.start();
      this.xhr.complete();
      this.xhr.send = stubFn();

      Clock.tick(349);
      assertFalse(this.xhr.send.called);

      Clock.tick(1);
      assert(this.xhr.send.called);
    },

    "test should pass headers to request": function () {
      this.poller.headers = {
        "Header-One": "1",
        "Header-Two": "2"
      };

      this.poller.start();

      var actual = this.xhr.headers;
      var expected = this.poller.headers;
      assertEquals(expected["Header-One"],
                   actual["Header-One"]);
      assertEquals(expected["Header-Two"],
                   actual["Header-Two"]);
    },

    "test should pass success callback": function () {
      this.poller.success = stubFn();

      this.poller.start();
      this.xhr.complete();

      assert(this.poller.success.called);
    },

    "test should pass failure callback": function () {
      this.poller.failure = stubFn();

      this.poller.start();
      this.xhr.complete(400);

      assert(this.poller.failure.called);
    },

    "test poller can call complete callback": function () {
      this.poller.complete = stubFn();

      this.poller.start();
      this.xhr.complete(400);

      assert(this.poller.complete.called);
    },

    "test should re-request immediately after long request":
    function () {
      this.poller.interval = 500;
      this.poller.start();
      var ahead = new Date().getTime() + 600;
      stubDateConstructor(new Date(ahead));
      ajax.request = stubFn();

      this.xhr.complete();
      Clock.tick(0);

      assert(ajax.request.called);
    },

    "test should add cache buster to URL": function () {
      var date = new Date();
      var ts = date.getTime();
      stubDateConstructor(date);
      this.poller.url = "/url";

      this.poller.start();

      assertEquals("/url?" + ts, this.xhr.open.args[1]);
    },
  });

  TestCase("PollTest", {
    setUp: function () {
      this.request = ajax.request;
      this.create = Object.create;
      ajax.request = stubFn();
    },

    tearDown: function () {
      ajax.request = this.request;
      Object.create = this.create;
    },

    "test should call start on poller object": function () {
      var poller = { start: stubFn() };
      Object.create = stubFn(poller);

      ajax.poll("/url");

      assert(poller.start.called);
    },

    "test should set url property on poller object":
    function () {
      var poller = ajax.poll("/url");

      assertSame("/url", poller.url);
    },
  });
}());

