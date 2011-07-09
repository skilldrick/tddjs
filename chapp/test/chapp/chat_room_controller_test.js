function controllerSetUp() {
  var req = this.req = new EventEmitter();
  var res = this.res = {
    writeHead: stub(),
    end: stub()
  };
  this.controller = chatRoomController.create(req, res);
  this.jsonParse = JSON.parse;
  this.controller.chatRoom = { addMessage: stub() };

  this.sendRequest = function (data) {
    var str = encodeURI(JSON.stringify(data));
    this.req.emit("data", str.substring(0, str.length / 2));
    this.req.emit("data", str.substring(str.length / 2));
    this.req.emit("end");
  };
}

function controllerTearDown() {
  JSON.parse = this.jsonParse;
}

var EventEmitter = require("events").EventEmitter;
var stub = require("stub");

var testCase = require("nodeunit").testCase;
var chatRoomController = require("chapp/chat_room_controller");

testCase(exports, "chatRoomController", {
  "should be object": function (test) {
    test.isNotNull(chatRoomController);
    test.isFunction(chatRoomController.create);
    test.done();
  }
});

testCase(exports, "chatRoomController.create", {
  setUp: controllerSetUp,

  "should return object with request and response":
  function (test) {
    test.inherits(this.controller, chatRoomController);
    test.strictEqual(this.controller.request, this.req);
    test.strictEqual(this.controller.response, this.res);
    test.done();
  }
});

testCase(exports, "chatRoomController.post", {
  setUp: controllerSetUp,
  tearDown: controllerTearDown,

  "should parse request body as JSON": function (test) {
    var data = { data: { user: "cjno", message: "hi" } };
    var stringData = JSON.stringify(data);
    var str = encodeURI(stringData);

    JSON.parse = stub(data);
    this.controller.post();
    this.sendRequest(data);

    test.equals(JSON.parse.args[0], stringData);
    test.done();
  },

  "should add message from request body": function (test) {
    var data = { data: { user: "cjno", message: "hi" } };

    this.controller.post();
    this.sendRequest(data);

    test.ok(this.controller.chatRoom.addMessage.called);
    var args = this.controller.chatRoom.addMessage.args;
    test.equals(args[0], data.data.user);
    test.equals(args[1], data.data.message);
    test.done();
  },

  "should write status header": function (test) {
    var data = { data: { user: "cjno", message: "hi" } };

    this.controller.post();
    this.sendRequest(data);

    test.ok(this.res.writeHead.called);
    test.equals(this.res.writeHead.args[0], 201);
    test.done();
  },

  "should close connection": function (test) {
    var data = { data: { user: "cjno", message: "hi" } };

    this.controller.post();
    this.sendRequest(data);

    test.ok(this.res.end.called);
    test.done();
  },
});

