var sys = require("sys");
var id = 0;

var chatRoom = {
  addMessage: function (user, message, callback) {
    var err = null;
    if (!user) { err = new TypeError("user is null"); }
    if (!message) { err = new TypeError("message is null"); }

    var data;

    if (!err) {
      if (!this.messages) {
        this.messages = [];
      }

      var id = this.messages.length + 1;
      data = { id: id, user: user, message: message };
      this.messages.push(data);
    }

    if (typeof callback == "function") {
      callback(err, data);
    }
  },

  getMessagesSince: function (id, callback) {
    var messages = this.messages || [];
    callback(null, messages.slice(id));
  },
};

module.exports = chatRoom;
