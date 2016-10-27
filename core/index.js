!(function () {
  /**
   *  Jackalope - a microscopic SAM-patterned redux-like state management library
   *	Copyright (c) 2016, Zach Dahl <z.schtauffen@gmail.com>
   *
   *	Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
   *
   *	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   */
  function identity (x) {
    return x
  }

  function Jackalope (options, middleware) {
    var state = options.state || identity
    var model = options.model
    var actions = options.actions

    var J = Object.create(Jackalope)
    J.state = J.prop()

    var present = function (action ) {
      model.present(action)
      J.state(state(model))
    }

    if (middleware) {
      present = middleware.reverse().reduce(function (out, fn) {
        return fn(J)(out)
      }, present)
    }

    J.model = model
    J.present = present
    J.actions = actions ? J.bindActions(actions) : null
    J.present({ type: J.INIT })

    return J
  }

  Jackalope.version = '0.2.0'
  Jackalope.INIT = '@@jackalope/init'

  Jackalope.createAction = function (type, fn) {
    var action = (typeof fn === 'function')
      ? function (payload) { return { type: type, payload: fn(payload) } }
      : function (payload) { return { type: type, payload: payload } }

    if (this.hasOwnProperty('action$'))
      return this.bindActions(action)

    return action
  }

  Jackalope.bindActions = function (actions, context) {
    context = context || this

    if (typeof actions === 'function')
      return function () { context.present(actions.apply(null, Array.prototype.slice.call(arguments))) }

    return Object.keys(actions).reduce(function (out, key) {
      out[key] = context.bindActions(actions[key], context)
      return out
    }, {})
  }

  Jackalope.handleActions = function (actions) {
    return function (action) {
      if (actions.hasOwnProperty(action.type))
        actions[action.type](action.payload)
    }
  }

  Jackalope.prop = function (store) {
    iProp.toJSON = iProp()
    return iProp

    function iProp (pStore) {
      if (arguments.length) return store = pStore
      return store
    }
  }

  // TODO - move to jackalope/utils
  Jackalope.thunk = function (fn, val) {
    return function () {
      return fn(val)
    }
  }

  if (typeof module !== 'undefined') module['exports'] = Jackalope
  else window.Jackalope = Jackalope
}());
