(function () {
  var dom = tddjs.namespace("dom");
  var util = tddjs.util;
  var chat = tddjs.namespace("chat");


  function handleSubmit(event) {
    event.preventDefault();

    if (this.view) {
      var input = this.view.getElementsByTagName("input")[0];
      var userName = input.value;

      if (!userName) {
        alert('Username must not be empty');
        return;
      }

      this.view.className = "";
      this.model.currentUser = userName;
      this.notify("user", userName);
    }
  }

  function setModel(model) {
    this.model = model;
  }

  function setView(element) {
    element.className = "js-chat";
    var handler = this.handleSubmit.bind(this);
    dom.addEventHandler(element, "submit", handler);
    this.view = element;
  }

  chat.userFormController = tddjs.extend({}, util.observable);
  chat.userFormController.setView = setView;
  chat.userFormController.setModel = setModel;
  chat.userFormController.handleSubmit = handleSubmit;
}());
