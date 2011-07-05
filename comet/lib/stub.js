/*jslint indent: 2*/
function stubFn(returnValue) {
  var fn = function () {
    fn.called = true;
    fn.callCount++;
    fn.args = arguments;
    fn.allArgs.push(arguments);
    return returnValue;
  };

  fn.called = false;
  fn.callCount = 0;
  fn.allArgs = [];

  return fn;
}

(function (global) {
  var NativeDate = global.Date;

  global.stubDateConstructor = function (fakeDate) {
    global.Date = function () {
      global.Date = NativeDate;
      return fakeDate;
    }
  };
})(this);
