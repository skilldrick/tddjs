module.exports = function (returnValue) {
  function stub() {
    stub.called = true;
    stub.callCount++;
    stub.args = arguments;
    return returnValue;
  };

  stub.called = false;
  stub.callCount = 0;

  return stub;
}
