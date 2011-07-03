(function () {
  var ajax = tddjs.ajax;

  TestCase("CometClientTest", {
    setUp: function () {
      this.client = Object.create(ajax.cometClient);
    },

    "test should be object": function () {
      assertObject(this.client);
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
      this.client.observers = {};

      assertNoException(function () {
        this.client.dispatch({ someEvent: [{}] });
      }.bind(this));
    },

  });
})();
