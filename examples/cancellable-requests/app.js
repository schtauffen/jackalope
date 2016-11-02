var Jackalope = require('../../core/jackalope')
var logger = require('../../middleware/logger')
var Jsync = require('../../async/async')

var actions = function (present) {
  return {
    request: function () {
      present(Jsync.get('my-request', 'http://httpbin.org/delay/5'))
    },
  }
}

var model = {
  response: '',
  present: function (display) {
    return function (action) {
      Jsync.on.start('my-request', function () {
        model.loading = true
        model.response = ''
      })(action)

      Jsync.on.start('your-request', function () {
        alert('I won\'t ever fire')
      })(action)

      Jsync.on.finish('my-request', function (data) {
        model.loading = false
        model.response = data
      })(action)

      Jsync.on.fail('my-request', function (err) {
        model.loading = false
      })(action)

      Jsync.on.cancel('my-request', function () {
        model.loading = false
      })(action)

      display(model)
    }
  }
}

function view (rendered) {
  var element = document.getElementById('app')
  element.innerHTML = rendered
}

function state (model, actions) {
  if (model.loading) {
    return view('<p>Loading...</p><button class="request">request again</button><button class="cancel">cancel</button>')
  }

  if (model.response) {
    return view('<p>Result:</p><pre>' + model.response + '</pre><button class="request">request again</button>')
  }

  view('<button class="request">request!</button')
}

var J = Jackalope({ state: state, actions: actions, model: model }, [ Jsync.middleware, logger ])

document.addEventListener('click', function (evt) {
  if (hasClass(evt.target, 'request')) {
    return J.actions.request()
  }

  if (hasClass(evt.target, 'cancel')) {
    return J.present(Jsync.cancel('my-request'))
  }
})

function hasClass (target, className) {
  return Array.prototype.indexOf.call(target.classList, className) > -1
}
