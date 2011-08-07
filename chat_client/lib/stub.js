function stubFn(returnValue) {
  var fn = function () {
    fn.called = true;
    fn.args = arguments;
    fn.thisValue = this;
    return returnValue;
  };

  fn.called = false;

  return fn;
}
