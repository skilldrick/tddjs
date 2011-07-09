var testCase = require("nodeunit").testCase;
var chatRoom = require("chapp/chat_room");
require("function-bind");

testCase(exports, "chatRoom.addMessage", {
  setUp: function () {
    this.room = Object.create(chatRoom);
  },

  "should require username": function (test) {
    this.room.addMessage(null, "a message", function (err) {
      test.isNotNull(err);
      test.inherits(err, TypeError);
      test.done();
    });
  },

  "should require message": function (test) {
    this.room.addMessage("cjno", null, function (err) {
      test.isNotNull(err);
      test.inherits(err, TypeError);
      test.done();
    });
  },

  "should not require a callback": function (test) {
    test.noException(function () {
      this.room.addMessage();
      test.done();
    }.bind(this));
  },

  "should call callback with new object": function (test) {
    var txt = "Some message";

    this.room.addMessage("cjno", txt, function (err, msg) {
      test.isObject(msg);
      test.isNumber(msg.id);
      test.equals(msg.message, txt);
      test.equals(msg.user, "cjno");
      test.done();
    });
  },

  "should assing unique ids to messages": function (test) {
    var user = "cjno";

    this.room.addMessage(user, "a", function (err, msg1) {
      this.room.addMessage(user, "b", function (err, msg2) {
        test.notEquals(msg1.id, msg2.id);
        test.done();
      });
    }.bind(this));
  },
});

testCase(exports, "chatRoom.getMessagesSince", {
  setUp: function () {
    this.room = Object.create(chatRoom);
    this.user = "cjno";
  },

  "should get messages since given id": function (test) {
    this.room.addMessage(this.user, "msg", function (e, first) {
      this.room.addMessage(this.user, "msg2", function (e, second) {
        this.room.getMessagesSince(first.id, function (e, msgs) {
          test.isArray(msgs);
          test.same(msgs, [second]);
          test.done();
        });
      }.bind(this));
    }.bind(this));
  },

  "should yield empty array if messages array does not exist":
  function (test) {
    this.room.getMessagesSince(0, function (e, msgs) {
      test.isArray(msgs);
      test.equals(msgs.length, 0);
    });
  },

  "should yield empty array if no relevant messages exist":
  function (test) {
    this.room.addMessage(this.user, "msg", function (e, first) {
      this.room.addMessage(this.user, "msg2", function (e, second) {
        this.room.getMessagesSince(5, function (e, msgs) {
          test.isArray(msgs);
          test.equals(msgs.length, 0);
        });
      }.bind(this));
    }.bind(this));
  },
});
