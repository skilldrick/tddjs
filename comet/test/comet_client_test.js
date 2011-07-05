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
})();
