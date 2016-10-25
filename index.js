!(function () {
  /**
   *  Jackalope - a SAM-patterned redux-like state management utility
   *	Copyright (c) 2016, Zach Dahl <z.schtauffen@gmail.com>
   *
   *	Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
   *
   *	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   */
  function Jackalope (stream) {
    return function (model, middleware) {
      const J = Object.create(Jackalope)

      J.action$ = stream()
      J.model$ = stream()

      var present = function (action ) {
        model.present(action)
        J.model$(model)
      }

      if (middleware) {
        present = middleware.reverse().reduce(function (out, fn) {
          return fn(model)(out)
        }, present)
      }

      J.action$.map(present)
      J.action$({ type: J.INIT })

      return J
    }
  }

  Object.assign(Jackalope, {
    version: '0.1.0-alpha',

    INIT: '@@jackalope/init',

    createAction: function (type, fn) {
      var action = (typeof fn === 'function')
        ? function (payload) { return { type: type, payload: fn(payload) } }
        : function (payload) { return { type: type, payload: payload } }

      if (this.hasOwnProperty('action$'))
        return this.bindActions(action)

      return action
    },

    bindActions: function (actions, context) {
      context = context || this

      if (typeof actions === 'function')
        return function () { context.action$(actions.apply(null, Array.prototype.slice.call(arguments))) }

      return Object.keys(actions).reduce(function (out, key) {
        out[key] = context.bindActions(actions[key], context)
        return out
      }, {})
    },

    handleActions: function (actions) {
      return function (action) {
        if (actions.hasOwnProperty(action.type))
          actions[action.type](action.payload)
      }
    },

    thunk: function (fn, val) {
      return function () {
        return fn(val)
      }
    },
  })

  if (typeof module !== 'undefined') module['exports'] = Jackalope
  else window.Jackalope = Jackalope
}());
