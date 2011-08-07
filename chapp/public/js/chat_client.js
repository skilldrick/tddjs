(function () {
  if (typeof tddjs == "undefined" ||
      typeof document == "undefined" ||
      !document.getElementById || !Object.create ||
      !tddjs.namespace("chat").userFormController) {
    alert("Broswer is not supported");
    return;
  }

  var chat = tddjs.chat;
  var model = {};
  var userForm = document.getElementById("userForm");
  console.log(userForm);
  var userController =
    Object.create(chat.userFormController);
  userController.setModel(model);
  userController.setView(userForm);
  console.log(userController);

  userController.observe("user", function (user) {
    alert("Welcome, " + user);
  });
})();
