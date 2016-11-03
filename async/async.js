/**
 *  Jackalope/Async - an async utility for Jackalope
 *	Copyright (c) 2016, Zach Dahl <z.schtauffen@gmail.com>
 *
 *	Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
'use strict'

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

Jsync.get = function (id, url) {
  var token = {};
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url)

  var promise = new Promise(function(resolve, reject) {
    xhr.onload = function () { resolve(xhr.responseText) }
    xhr.onerror = reject
    token.cancel = function () {
      xhr.abort()
      reject(new Error(Jsync.consts.cancel))
    }
    xhr.send()
  })

  return Jsync.start(id, promise, token)
}

Jsync.middleware = function (J) {
  var jsync = J[Jsync.consts.async] = Jsync(J.options.model, J)

  return function (next) {
    return function (proposal) {
      jsync.present(proposal)
      next(proposal)
    }
  }
}

Jsync.present = function (model, J) {
  var proposalHandlers = {}

  proposalHandlers[Jsync.consts.start] = function (proposal) {
    var id = proposal.data.id

    if (model[id]) {
      cancel(model[id])
    }

    proposal.data.process
      .then(function (data) {
        J.present({
          type: Jsync.consts.finish,
          data: {
            id: id,
            response: data,
          },
        })
      })
      .catch(function (err) {
        if (err.message !== Jsync.consts.cancel) {
          J.present({
            type: Jsync.consts.fail,
            data: {
              id: id,
              error: err
            },
          })
        }
      })

    model[id] = {
      process: proposal.data.process,
      token: proposal.data.token,
    }
  }

  proposalHandlers[Jsync.consts.cancel] = function (proposal) {
    var id = proposal.data.id

    if (model[id]) {
      cancel(model[id])
      deleteById(proposal)
    }
  }

  proposalHandlers[Jsync.consts.fail] = deleteById
  proposalHandlers[Jsync.consts.finish] = deleteById

  return function (proposal) {
    var handler = proposalHandlers[proposal.type]

    if (typeof handler === 'function') {
      handler(proposal)
    }
  }

  function cancel (data) {
    if (data.process && data.process.cancel) {
      data.process.cancel();
    } else if (data.token && data.token.cancel) {
      data.token.cancel()
    }
  }

  function deleteById (proposal) {
    delete model[proposal.data.id]
  }
}

function Jsync (model, J) {
  var jsync = Object.create(Jsync)

  jsync.model = {}
  model[jsync.consts.async] = jsync.model

  jsync.present = jsync.present(jsync.model, J)

  return jsync
}

function will (evt) {
  return function (id, proposal) {
    return (proposal.type === Jsync.consts[evt] && id === proposal.data.id)
  }
}

function on (evt) {
  return function (id, fn) {
    return function (proposal) {
      if (id === '*' || Jsync.will[evt](id, proposal)) {
        if (evt === 'finish') return fn(proposal.data.response)
        if (evt === 'fail') return fn(proposal.data.error)
        return fn()
      }
    }
  }
}

module.exports = Jsync
