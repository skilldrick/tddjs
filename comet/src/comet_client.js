(function () {
  var ajax = tddjs.namespace("ajax");
  var util = tddjs.namespace("util");

  function dispatch(data) {
    var observers = this.observers;

    if (!observers || typeof observers.notify !== "function") {
      return;
    }

    tddjs.each(data, function (topic, events) {
      var length = events && events.length;

      for (var i = 0; i < length; i++) {
        observers.notify(topic, events[i]);
      }
    });
  }

  function observe(topic, observer) {
    if (!this.observers) {
      this.observers = Object.create(util.observable);
    }

    this.observers.observe(topic, observer);
  }

  function connect() {
    if (!this.url) {
      throw new TypeError("client url is null");
    }

    if (!this.poller) {
      this.poller = ajax.poll(this.url, {
        success: function (xhr) {
          this.dispatch(JSON.parse(xhr.responseText));
        }.bind(this)
      });
    }
  }

  ajax.cometClient = {
    connect: connect,
    dispatch: dispatch,
    observe: observe
  };
})();
