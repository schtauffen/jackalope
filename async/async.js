// assumes bluebird promises for now
Jsync.consts = {
  async: '@@jackalope/async',
  events: [ 'start', 'finish', 'cancel', 'fail' ],
}

Jsync.will = {}
Jsync.on = {}
Jsync.consts.events.forEach(function (evt) {
  Jsync.consts[evt] = Jsync.consts.async + '/' + evt
  Jsync.will[evt] = will(evt)
  Jsync.on[evt] = on(evt)
})

Jsync.start = function (id, process) {
  return {
    type: Jsync.consts.start,
    data: {
      id: id,
      process: process,
    },
  }
}
Jsync.cancel = function (id) {
  return {
    type: Jsync.consts.cancel,
    data: {
      id: id,
    },
  }
}

Jsync.middleware = function (J) {
  var jsync = J[Jsync.consts.async] = Jsync(J.model)

  return function (next) {
    return function (action) {
      jsync.present(action)
      next(action)
    }
  }
}

Jsync.present = function (model) {
  // acts on:
  //   module['@@jackalope/async']
  var actionHandlers = {}

  // TODO - add finish/fail listeners
  actionHandlers[Jsync.consts.start] = function (action) {
    var id = action.data.id

    if (model[id]) {
      cancel(model[id])
    }

    model[id] = action.data.process
  }

  actionHandlers[Jsync.consts.cancel] = function (action) {
    var id = action.data.id

    if (model[id]) {
      cancel(model[id])
      deleteById(action)
    }
  }

  actionHandlers[Jsync.consts.fail] = deleteById
  actionHandlers[Jsync.consts.finish] = deleteById

  return function (action) {
    var handler = actionHandlers[action.type]

    if (typeof handler === 'function') {
      handler(action)
    }
  }

  function cancel (process) {
    // TODO - cancel process
    console.log(process)
  }

  function deleteById (action) {
    delete model[action.data.id]
  }
}

function Jsync (model) {
  var jsync = Object.create(Jsync)

  jsync.model = {}
  model[jsync.consts.async] = jsync.model

  jsync.present = jsync.present(jsync.model)

  return jsync
}

function will (evt) {
  return function (id, action) {
    return (action.type === Jsync.consts[evt] && id === action.data.id)
  }
}

function on (evt) {
  return function (id, fn) {
   return function (action) {
     if (id === '*' || Jsync.will[evt](id, action)) {
       return fn(action.data.process)
     }
   }
  }
}

module.exports = Jsync
