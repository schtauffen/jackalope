!function () {
  /**
   * actions are responsible for proposing updates
   * to model
   *
   * Though you can manually present them to model.present,
   * Jackalope will automatically wrap them to do so if you pass
   * them in.
   *
   * Jackalope assumes actions will be synchronous and return
   * objects to be presented to the model. For async, they can
   * be called from within wrapping asynchronous functions, or
   * preferably handled in one of the optional plugins,
   * such as @jackalope/async
   */
  var actions = {
    start: function () {
      return { started: true }
    },

    abort: function () {
      return { aborted: true }
    },

    launch: function () {
      return { launched: true }
    },

    decrement: function (counter) {
      return { counter: counter - 1 }
    },

    reset: function () {
      return { reset: true }
    },
  }

  /**
   * The model is where we store all of our information
   * It can be in whatever format our APIs send us
   */
  var INITIAL_COUNT = 5

  var model = {
    started: false,
    launched: false,
    aborted: false,
    counter: INITIAL_COUNT,
  }

  /**
   * model.present is responsible for accepting actions
   * It either rejects or accepts the proposed updates
   * then updates accordingly
   *
   * Jackalope expects:
   *  1) present to be available on model
   *  2) present to the curried structure: display => action => {...}
   *  3) present to call "display(model)" to trigger state
   *
   * model.present is the only thing allowed to change model
   */
  model.present = function (display) {
    return function (action) {
      if (action.started) {
        model.started = true
        model.launched = false
        model.aborted = false
        model.counter = INITIAL_COUNT
      }

      if (action.aborted) {
        model.aborted = true
      }

      if (action.launched) {
        model.launched = true
      }

      if (typeof action.counter === 'number' && !model.aborted) {
        model.counter = action.counter
      }

      display(model)
    }
  }

  /**
   * Views should be "dumb" and not know anything about the Model
   * They are used by state when rendering
   */
  view.launched = function () {
    return '<div>Blast off!</div><button class="start">Start Over</button>'
  }
  view.aborted = function (after) {
    return '<div>Aborted after ' + after + ' seconds</div><button class="start">Start Over</button>'
  }
  view.counting = function (count) {
    return '<div>Launch in: ' + count + '</div><button class="abort">Abort</button>'
  }
  view.ready = function () {
    return '<button class="start">Start</button>'
  }

  function view (rendered) {
    var element = document.getElementById('app')
    element.innerHTML = rendered
  }

  /**
   * State is responsible for
   *  1) calculating view models
   *  2) rendering views with those view models
   *  3) determing if automatic action should occur
   *
   * Jackalope expects it to be a curried function of form:
   *  actions => model => { ... }
   *
   * Actions are provided as the first of the curried params
   * so views and the nap functions can have access
   */
  state.representation = function (model) {
    if (model.launched)
      return view.launched()

    if (model.aborted)
      return view.aborted(INITIAL_COUNT - model.counter)

    if (model.started)
      return view.counting(model.counter)

    return view.ready()
  }

  state.counting = function (model) {
    return !model.launched && !model.aborted && model.started
  }

  state.nap = function (model, actions) {
    if (state.counting(model)) {
      if (model.counter < 1) {
        actions.launch()

      } else if (state.counting(model)) {
        setTimeout(function () {
          actions.decrement(model.counter)
        }, 1000)
      }
    }
  }

  function state (actions) {
    return function (model) {
      var rendered = state.representation(model)
      view(rendered)
      state.nap(model, actions)
    }
  }

  /**
   * Jackalope will automatically initialize the SAM application
   */
  var J = Jackalope({ state: state, actions: actions, model: model })

  // View libraries usually have nicer ways to add events :)
  document.addEventListener('click', function (evt) {
    if (hasClass(evt.target, 'start')) {
      J.actions.start()
    }

    if (hasClass(evt.target, 'abort')) {
      J.actions.abort()
    }
  })

  function hasClass (target, className) {
    return Array.prototype.indexOf.call(target.classList, className) > -1
  }
}();
