/**
 *  Jackalope/Async - an async utility for Jackalope
 *	Copyright (c) 2016, Zach Dahl <z.schtauffen@gmail.com>
 *
 *	Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
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

Jsync.start = function (id, process, token) {
  return {
    type: Jsync.consts.start,
    data: {
      id: id,
      process: process,
      token: token, // required for cancellation
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

Jsync.get = function (url, token) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url)

  return new Promise(function(resolve, reject) {
    xhr.onload = function () { resolve(xhr.responseText) }
    xhr.onerror = reject

    if (token) {
      token.cancel = cancel
    }

    function cancel () {
      xhr.abort()
      reject(new Error(Jsync.consts.cancel))
    }
  })
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
  var actionHandlers = {}

  actionHandlers[Jsync.consts.start] = function (action) {
    var id = action.data.id

    if (model[id]) {
      cancel(model[id])
    }

    process
      .then(function (data) {
        model.present({
          type: Jsync.consts.finish,
          data: data,
        })
      })
      .catch(function (err) {
        if (err.message !== Jsync.consts.cancel) {
          model.present({
            type: Jsync.consts.fail,
            data: err,
          })
        }
      })

    model[id] = {
      process: action.data.process,
      token: action.data.token,
    }
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

  function cancel (data) {
    if (data.process && data.process.cancel) {
      data.process.cancel();
    } else if (data.token) {
      data.token()
    }
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
