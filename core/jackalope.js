/**
 *  Jackalope - a microscopic and modular SAM container
 *	Copyright (c) 2016, Zach Dahl <z.schtauffen@gmail.com>
 *
 *	Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
'use strict'

Jackalope.version = '0.5.1'
Jackalope.INIT = '@@jackalope/init'

function Jackalope (options) {
  options.state = options.state || function (x) { return x }
  options.actions = options.actions || function () { return {}}

  var J = Object.create(Jackalope)

  var state = options.state.length === 1 ? options.state : function (model) {
    return options.state(model, J.actions)
  }

  J.options = options
  J.present = options.model.present(state)
  J.actions = {}

  J.bindActions = function (actions) {
    Object.assign(J.actions, actions(J.present))
  }

  if (arguments.length > 1) {
    J.present = Array.prototype.slice.call(arguments, 1)
      .reduce(function (out, middleware) {
        return out.concat(middleware)
      }, [])
      .reverse()
      .reduce(function (out, middleware) {
        return middleware(J)(out)
      }, J.present)
  }

  J.bindActions(options.actions)
  J.present({ type: J.INIT })

  return J
}

module.exports = Jackalope
