var base = '@@jackalope/async';

Jsync.consts = {
  async: base,
  start: base + '/start',
  cancel: base + '/cancel',
  finish: base + '/finish',
  fail: base + '/fail',
}

// action handler helpers
// not bound
Jsync.on = {}
// for spinners and such:
//   Jsync.on.start('async-id' )
Jsync.on.start = function () {}
Jsync.on.cancel = function () {}
Jsync.on.finish = function () {}
Jsync.on.fail = function () {}

// actions
// not bound
// usage:
//   present(Jsync.start('async-id', promise))
//   present(Jsync.cancel('async-id'))
Jsync.start = function (promise) {
}
Jsync.cancel = function () {
}

// not bound
Jsync.middleware = function (J) {
  var jsync = J[Jsync.consts.async] = Jsync(J.model)

  return function (next) {
    return function (action) {
      jsync.present(action)
      next(action)
      jsync.nap(model)
    }
  }
}

// bound
Jsync.present = function (model) {
  return function (action) {
    // acts on:
    //   module['@@jackalope/async']
  }
}

// bound ???
Jsync.nap = function (model) {
  return function () {
    // success / fail ?
  }
}

function Jsync (model) {
  var jsync = Object.create(Jsync)

  jsync.model = {}
  model[jsync.consts.async] = jsync.model

  jsync.present = jsync.present(model)
  jsync.nap = jsync.present(model)

  return jsync
}

module.exports = Jsync
