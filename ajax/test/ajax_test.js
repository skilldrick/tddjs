TestCase("AjaxCreateTest", {
  "test should return XMLHttpRequest object": function () {
    var xhr = tddjs.ajax.create();

    assertNumber(xhr.readyState);
    assert(tddjs.isHostMethod(xhr, "open"));
    assert(tddjs.isHostMethod(xhr, "send"));
    assert(tddjs.isHostMethod(xhr, "setRequestHeader"));
  },

  "test should obtain an XMLHttpRequest object": function () {
    var originalCreate = ajax.create;

    ajax.create = function () {
      ajax.create.called = true;
    };

    ajax.get("/url");

    assert(ajax.create.called);

    ajax.create = originalCreate;
  },
});
