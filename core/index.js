(function (slice) {
  /**
   *  Jackalope - a microscopic and modular SAM container
   *	Copyright (c) 2016, Zach Dahl <z.schtauffen@gmail.com>
   *
   *	Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
   *
   *	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   */
  Jackalope.version = '0.3.0'
  Jackalope.INIT = '@@jackalope/init'

  Jackalope.bindActions = function (actions, context) {
    context = context || this

    if (typeof actions === 'function')
      return function () { context.present(actions.apply(null, slice.call(arguments))) }

    return Object.keys(actions).reduce(function (out, key) {
      out[key] = context.bindActions(actions[key], context)
      return out
    }, {})
  }

  function Jackalope (options) {
    var state = options.state || function (x) { return x }
    var model = options.model
    var actions = options.actions

    var J = Object.create(Jackalope)

    if (arguments.length > 1) {
      slice.call(arguments, 1).reduce(function (out, plug) {
        return out.concat(plug)
      }, []).forEach(function (plugin) {
        plugin(J, { state: state, model: model, actions: actions })
      })
    }

    J.actions = J.actions || (actions ? J.bindActions(actions) : {})
    J.present = J.present || model.present(state(J.actions))
    J.present({ type: J.INIT, data: null })

    return J
  }

  if (typeof module !== 'undefined') module.exports = Jackalope
  else window.Jackalope = Jackalope
})(Array.prototype.slice);
