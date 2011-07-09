require("function-bind");

var chatRoomController = {
  create: function (request, response) {
    return Object.create(this, {
      request: { value: request },
      response: { value: response }
    });
  },

  post: function () {
    var body = "";

    this.request.addListener("data", function (chunk) {
      body += chunk;
    });

    this.request.addListener("end", function () {
      var data = JSON.parse(decodeURI(body)).data;
      this.chatRoom.addMessage(data.user, data.message);
      this.response.writeHead(201);
      this.response.end();
    }.bind(this));
  }
};

module.exports = chatRoomController;