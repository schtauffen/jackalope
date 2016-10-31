// assume only promises for now... then add stream / callback support
Jsync.consts = {
  async: '@@jackalope/async',
  events: [ 'start', 'finish', 'cancel', 'fail' ],
  // add replace ?
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
//      jsync.nap(J.model)
    }
  }
}

/* does this even need nap?
Jsync.nap = function (model) {
  // success / fail events ->
}
*/

// bound
Jsync.present = function (model) {
  return function (action) {
    console.log(model, action)
    // acts on:
    //   module['@@jackalope/async']
    // maintains state
  }
}

function Jsync (model) {
  var jsync = Object.create(Jsync)

  jsync.model = {}
  model[jsync.consts.async] = jsync.model

  jsync.present = jsync.present(model)

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
     if (Jsync.will[evt](id, action)) {
       return fn(action.data.process)
     }
   }
  }
}

module.exports = Jsync
