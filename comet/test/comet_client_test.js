(function () {
  var ajax = tddjs.ajax;

  TestCase("CometClientTest", {
    "test should be object": function () {
      assertObject(ajax.cometClient);
    }
  });

  TestCase("CometClientDispatchTest", {
    setUp: function () {
      this.client = Object.create(ajax.cometClient);
      this.client.observers = { notify: stubFn() };
    },

    "test should have dispatch method": function () {
      assertFunction(this.client.dispatch);
    },

    "test dispatch should notify observers": function () {
      this.client.observers = { notify: stubFn() };

      this.client.dispatch({ someEvent: [{ id: 1234 }] });

      var args = this.client.observers.notify.args;

      assert(this.client.observers.notify.called);
      assertEquals("someEvent", args[0]);
      assertEquals({ id: 1234 }, args[1]);
    },

    "test should not throw if no observers": function () {
      this.client.observers = null;

      assertNoException(function () {
        this.client.dispatch({ someEvent: [{}] });
      }.bind(this));
    },

    "test should not throw if notify undefined": function () {
      assertNoException(function () {
        this.client.dispatch({ someEvent: [{}] });
      }.bind(this));
    },

    "test should not throw if data is not provided": function () {
      assertNoException(function () {
        this.client.dispatch();
      }.bind(this));
    },

    "test should not throw if event is null": function () {
      assertNoException(function () {
        this.client.dispatch({ myEvent: null });
      }.bind(this));
    },

    "test notify is called for all topics in data": function () {
      this.client.observers = { notify: stubFn() };

      this.client.dispatch(
        {
          someEvent: [{}, {}],
          otherEvent: [{}, {}, {}]
        }
      );

      var allArgs = this.client.observers.notify.allArgs;
      assertEquals(5, this.client.observers.notify.callCount);
      assertEquals('someEvent', allArgs[0][0]);
      assertEquals('otherEvent', allArgs[2][0]);
    },

    "test all events passed to observer": function () {
      var item1 = {};
      var item2 = {};
      var item3 = {};

      this.client.observers = { notify: stubFn() };

      this.client.dispatch({ someEvent: [item1, item2, item3] });

      var allArgs = this.client.observers.notify.allArgs;
      assertEquals(3, this.client.observers.notify.callCount);
      assertEquals(item1, allArgs[0][1]);
      assertEquals(item2, allArgs[1][1]);
      assertEquals(item3, allArgs[2][1]);
    },

  });

  TestCase("CometClientObserveTest", {
    setUp: function () {
      this.client = Object.create(ajax.cometClient);
    },

    "test should remember observers": function () {
      var observers = [stubFn(), stubFn()];
      this.client.observe("myEvent", observers[0]);
      this.client.observe("myEvent", observers[1]);
      var data = { myEvent: [{}] };

      this.client.dispatch(data);

      assert(observers[0].called);
      assertSame(data.myEvent[0], observers[0].args[0]);
      assert(observers[1].called);
      assertSame(data.myEvent[0], observers[1].args[0]);
    },
  });

  TestCase("CometClientConnectTest", {
    setUp: function () {
      this.client = Object.create(ajax.cometClient);
      this.ajaxPoll = ajax.poll;
      this.ajaxCreate = ajax.create;
      this.xhr = Object.create(fakeXMLHttpRequest);
      ajax.create = stubFn(this.xhr);
    },

    tearDown: function () {
      ajax.poll = this.ajaxPoll;
      ajax.create = this.ajaxCreate;
    },

    "test connect should start polling": function () {
      this.client.url = "/my/url";
      ajax.poll = stubFn({});

      this.client.connect();

      assert(ajax.poll.called);
      assertEquals("/my/url", ajax.poll.args[0]);
    },

    "test should not connect if connected": function () {
      this.client.url = "/my/url";
      ajax.poll = stubFn({});
      this.client.connect();
      ajax.poll = stubFn({});

      this.client.connect();

      assertFalse(ajax.poll.called);
    },

    "test should throw error if no url exists": function () {
      var client = Object.create(ajax.cometClient);
      ajax.poll = stubFn({});

      assertException(function () {
        client.connect();
      }, "TypeError");
    },

    "test should dispatch data from request": function () {
      var data = { topic: [{ id: "1234" }],
                    otherTopic: [{ name: "Me" }] };
      this.client.url = "/my/url";
      this.client.dispatch = stubFn();

      this.client.connect();
      this.xhr.complete(200, JSON.stringify(data));

      assert(this.client.dispatch.called);
      assertEquals(data, this.client.dispatch.args[0]);
    },

  });
})();
