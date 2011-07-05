(function () {
  var ajax = tddjs.namespace("ajax");

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

  ajax.cometClient = {
    dispatch: dispatch
  };
})();
