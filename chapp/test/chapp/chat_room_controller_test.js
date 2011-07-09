var Promise = require("node-promise/promise").Promise;

function controllerSetUp() {
  var req = this.req = new EventEmitter();
  req.headers = { "x-access-token": "" };
  var res = this.res = {
    writeHead: stub(),
    write: stub(),
    end: stub()
  };
  this.controller = chatRoomController.create(req, res);
  this.jsonParse = JSON.parse;
  var add = this.addMessagePromise = new Promise();
  var wait = this.waitForMessagesPromise = new Promise();

  this.controller.chatRoom = {
    addMessage: stub(add),
    waitForMessagesSince: stub(wait)
  };

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

  "should write status header and close connection when addMessage resolves":
  function (test) {
    var data = { data: { user: "cjno", message: "hi" } };

    this.controller.respond = stub();
    this.controller.post();
    this.sendRequest(data);
    this.addMessagePromise.resolve({});

    process.nextTick(function () {
      test.ok(this.controller.respond.called);
      test.equals(this.controller.respond.args[0], 201);
      test.done();
    }.bind(this));
  },

  "should not respond immediately": function (test) {
    this.controller.post();
    this.sendRequest({ data: {} });

    test.ok(!this.res.end.called);
    test.done();
  },

  "should return 500 status code on error": function (test) {
    var data = { data: { user: "cjno", message: "hi" } };
    this.controller.post();
    this.sendRequest(data);
    this.addMessagePromise.reject({});

    process.nextTick(function () {
      test.ok(this.res.end.called);
      test.equals(this.res.writeHead.args[0], 500);
      test.done();
    }.bind(this));
  },
});

testCase(exports, "chatRoomController.get", {
  setUp: controllerSetUp,
  tearDown: controllerTearDown,

  "should wait for any message": function (test) {
    var chatRoom = this.controller.chatRoom;

    this.controller.get();

    test.ok(chatRoom.waitForMessagesSince.called);
    test.equals(chatRoom.waitForMessagesSince.args[0], 0);
    test.done();
  },

  "should wait for messages since X-Access-Token":
  function (test) {
    this.req.headers["x-access-token"] = 2;
    var chatRoom = this.controller.chatRoom;

    this.controller.get();

    test.ok(chatRoom.waitForMessagesSince.called);
    test.equals(chatRoom.waitForMessagesSince.args[0], 2);
    test.done();
  }
});

testCase(exports, "chatRoomController.respond", {
  setUp: controllerSetUp,

  "should write status code": function (test) {
    this.controller.respond(201);

    test.ok(this.res.writeHead.called);
    test.equals(this.res.writeHead.args[0], 201);
    test.done();
  },

  "should close connection": function (test) {
    this.controller.respond(201);

    test.ok(this.res.end.called);
    test.done();
  },

  "should respond with formatted data": function (test) {
    this.controller.respond = stub();
    var messages = [{ user: "cjno", message: "hi" }];
    this.waitForMessagesPromise.resolve(messages);

    this.controller.get();

    process.nextTick(function () {
      test.ok(this.controller.respond.called);
      var args = this.controller.respond.args;
      test.same(args[0], 201);
      test.same(args[1].message, messages);
      test.done();
    }.bind(this));
  },

  "should include token in response": function (test) {
    this.controller.respond = stub();
    this.waitForMessagesPromise.resolve([{id:24}, {id:25}]);

    this.controller.get();

    process.nextTick(function () {
      test.same(this.controller.respond.args[1].token, 25);
      test.done();
    }.bind(this));
  },
});
